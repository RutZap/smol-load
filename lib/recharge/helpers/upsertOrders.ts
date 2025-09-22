import { useDatabase, OrderTaskType } from '@teamkeel/sdk';
import { Order, OrderStatusMap, PurchaseItemTypeMap } from '../types/order';
import { processOrderSplitUK } from './processOrderSplitUK';

/**
 * @param orders returned from Recharge get Orders API
 * Upserts new orders into the Keel data model
 * Attempts to match product and variant IDs to those already in Keel
 */
export async function upsertOrders(ordersInput: Order[]): Promise<void> {
  // Running splitting function over ordersInput
  // ...Do this before writing order data to avoid race conditions between new unsplit orders and dispatches
  const splitOrders = await Promise.all(
    ordersInput.map(async order => {
      const splitOrder = await processOrderSplitUK(order);
      return splitOrder;
    })
  );
  const orders = splitOrders.flat();

  const db = useDatabase();
  const ordersUpsert = await db.transaction().execute(async trx => {
    const ordersUpsert = await trx
      .insertInto('order')
      .values(
        orders.map(order => {
          return {
            rechargeId: order.id.toString(),
            customerEmail: order.customer?.email,
            customerRechargeId: order.customer?.id?.toString(),
            shippingAddressOne: order.shipping_address?.address1,
            shippingAddressTwo: order.shipping_address?.address2,
            shippingCity: order.shipping_address?.city,
            shippingCompany: order.shipping_address?.company,
            shippingCountryCode: order.shipping_address?.country_code,
            shippingFirstName: order.shipping_address?.first_name,
            shippingLastName: order.shipping_address?.last_name,
            shippingPhone: order.shipping_address?.phone,
            shippingProvince: order.shipping_address?.province,
            shippingPostCode: order.shipping_address?.zip,
            billingAddressOne: order.billing_address?.address1,
            billingAddressTwo: order.billing_address?.address2,
            billingCity: order.billing_address?.city,
            billingCompany: order.billing_address?.company,
            billingCountryCode: order.billing_address?.country_code,
            billingFirstName: order.billing_address?.first_name,
            billingLastName: order.billing_address?.last_name,
            billingProvince: order.billing_address?.province,
            billingPostCode: order.billing_address?.zip,
            paymentTotal: order.total_price,
            paymentTax: order.total_tax,
            // Although shipping_lines is an array this will always contain exactly 1 object
            shippingCode: order.shipping_lines[0]?.code,
            shippingTitle: order.shipping_lines[0]?.title,
            shippingPrice: order.shipping_lines[0]?.price,
            paymentMethod: order.charge?.payment_processor_name,
            paymentReference: order.charge?.external_transaction_id?.payment_processor,
            paymentCurrency: order.currency,
            status: OrderStatusMap[order.status],
          };
        })
      )
      .onConflict(oc =>
        oc.column('rechargeId').doUpdateSet({
          customerEmail: eb => eb.ref('excluded.customerEmail'),
          customerRechargeId: eb => eb.ref('excluded.customerRechargeId'),
          shippingAddressOne: eb => eb.ref('excluded.shippingAddressOne'),
          shippingAddressTwo: eb => eb.ref('excluded.shippingAddressTwo'),
          shippingCity: eb => eb.ref('excluded.shippingCity'),
          shippingCompany: eb => eb.ref('excluded.shippingCompany'),
          shippingCountryCode: eb => eb.ref('excluded.shippingCountryCode'),
          shippingFirstName: eb => eb.ref('excluded.shippingFirstName'),
          shippingLastName: eb => eb.ref('excluded.shippingLastName'),
          shippingPhone: eb => eb.ref('excluded.shippingPhone'),
          shippingProvince: eb => eb.ref('excluded.shippingProvince'),
          shippingPostCode: eb => eb.ref('excluded.shippingPostCode'),
          billingAddressOne: eb => eb.ref('excluded.billingAddressOne'),
          billingAddressTwo: eb => eb.ref('excluded.billingAddressTwo'),
          billingCity: eb => eb.ref('excluded.billingCity'),
          billingCompany: eb => eb.ref('excluded.billingCompany'),
          billingCountryCode: eb => eb.ref('excluded.billingCountryCode'),
          billingFirstName: eb => eb.ref('excluded.billingFirstName'),
          billingLastName: eb => eb.ref('excluded.billingLastName'),
          billingProvince: eb => eb.ref('excluded.billingProvince'),
          billingPostCode: eb => eb.ref('excluded.billingPostCode'),
          paymentTotal: eb => eb.ref('excluded.paymentTotal'),
          paymentTax: eb => eb.ref('excluded.paymentTax'),
          shippingCode: eb => eb.ref('excluded.shippingCode'),
          shippingTitle: eb => eb.ref('excluded.shippingTitle'),
          shippingPrice: eb => eb.ref('excluded.shippingPrice'),
          paymentMethod: eb => eb.ref('excluded.paymentMethod'),
          paymentReference: eb => eb.ref('excluded.paymentReference'),
          paymentCurrency: eb => eb.ref('excluded.paymentCurrency'),
          status: eb => eb.ref('excluded.status'),
        })
      )
      .returning(['id', 'rechargeId'])
      .execute();

    // Get a list of Recharge product and variant IDs to find in Keel
    const externalProductIds = orders.flatMap(order => {
      return order.line_items.map(item => {
        return {
          externalProductId: item.external_product_id.ecommerce,
          externalProductVariantId: item.external_variant_id.ecommerce,
        };
      });
    });

    // Build a lookup list to go from external_product_id to Keel product ID
    const productIdMap = await trx
      .selectFrom('product')
      .select(['id', 'externalProductId'])
      .distinct()
      .where(
        'externalProductId',
        'in',
        externalProductIds.map(entry => entry.externalProductId)
      )
      .execute();

    // Build a lookup list to go from external_variant_id to Keel productVariant ID
    const productVariantMap = await trx
      .selectFrom('product_variant')
      .select(['id', 'externalVariantId'])
      .distinct()
      .where(
        'externalVariantId',
        'in',
        externalProductIds.map(entry => entry.externalProductVariantId)
      )
      .execute();

    // Build lineItem upsert array:
    // - Add Keel orderId, productId and productVariantId for use as foreign keys
    const lineItems = orders.flatMap(order => {
      const orderId = ordersUpsert.find(({ rechargeId }) => rechargeId === order.id.toString());
      if (!orderId) return [];

      return order.line_items.map(lineItem => {
        const productId =
          productIdMap.find(
            ({ externalProductId }) => externalProductId === lineItem.external_product_id.ecommerce
          )?.id ?? null;

        const productVariantId =
          productVariantMap.find(
            ({ externalVariantId }) => externalVariantId === lineItem.external_variant_id.ecommerce
          )?.id ?? null;

        return {
          orderId: orderId.id,
          productId: productId,
          productVariantId: productVariantId,
          ...lineItem,
        };
      });
    });

    // Initially set all lineItems, for orders being upserted, to NOT active
    // After the lineItem upsert below, any newly removed items will be left in a not active state
    // e.g. We handle the "removed from order" update situation
    await trx
      .updateTable('line_item')
      .set(eb => ({ active: false }))
      .where(
        'orderId',
        'in',
        ordersUpsert.map(order => order.id)
      )
      .returning(['line_item.id', 'line_item.active'])
      .execute();

    // Upsert all line items from all orders being updated
    // Handles matching products and variants to the existing data model
    const lineItemUpsert = await trx
      .insertInto('line_item')
      .values(
        lineItems.map(item => {
          return {
            orderId: item.orderId,
            purchaseItemId: item.purchase_item_id?.toString(),
            externalInventoryPolicy: item.external_inventory_policy,
            externalProductId: item.external_product_id.ecommerce,
            externalVariantId: item.external_variant_id.ecommerce,
            productId: item.productId,
            productVariantId: item.productVariantId,
            grams: item.grams,
            originalPrice: item.original_price,
            purchaseItemType: PurchaseItemTypeMap[item.purchase_item_type],
            quantity: item.quantity,
            sku: item.sku,
            taxDue: item.tax_due,
            taxable: item.taxable,
            taxableAmount: item.taxable_amount,
            title: item.title,
            totalPrice: item.total_price,
            unitPrice: item.unit_price,
            unitPriceIncludesTax: item.unit_price_includes_tax,
            variantTitle: item.variant_title,
            active: true,
          };
        })
      )
      .onConflict(oc =>
        oc.columns(['orderId', 'externalVariantId', 'purchaseItemId']).doUpdateSet({
          externalInventoryPolicy: eb => eb.ref('excluded.externalInventoryPolicy'),
          externalProductId: eb => eb.ref('excluded.externalProductId'),
          externalVariantId: eb => eb.ref('excluded.externalVariantId'),
          productId: eb => eb.ref('excluded.productId'),
          productVariantId: eb => eb.ref('excluded.productVariantId'),
          grams: eb => eb.ref('excluded.grams'),
          originalPrice: eb => eb.ref('excluded.originalPrice'),
          purchaseItemType: eb => eb.ref('excluded.purchaseItemType'),
          quantity: eb => eb.ref('excluded.quantity'),
          sku: eb => eb.ref('excluded.sku'),
          taxDue: eb => eb.ref('excluded.taxDue'),
          taxable: eb => eb.ref('excluded.taxable'),
          taxableAmount: eb => eb.ref('excluded.taxableAmount'),
          title: eb => eb.ref('excluded.title'),
          totalPrice: eb => eb.ref('excluded.totalPrice'),
          unitPrice: eb => eb.ref('excluded.unitPrice'),
          unitPriceIncludesTax: eb => eb.ref('excluded.unitPriceIncludesTax'),
          variantTitle: eb => eb.ref('excluded.variantTitle'),
          active: true,
        })
      )
      .returning(['id', 'externalVariantId', 'purchaseItemId'])
      .execute();

    // Initially set all linetemProperties to NOT active
    // After the linetemProperties upsert below, any newly removed properties will be left in a not active state
    // e.g. We handle the situation where a property is removed
    await trx
      .updateTable('line_item_properties')
      .set(eb => ({ active: false }))
      .where(
        'lineItemId',
        'in',
        lineItemUpsert.map(item => item.id)
      )
      .returning(['lineItemId'])
      .execute();

    // Build lineItemProperties array:
    // - Add Keel lineItemId into object for use as foreign key
    const lineItemProperties = lineItems.flatMap(lineItem => {
      const lineItemId =
        lineItemUpsert.find(
          ({ externalVariantId, purchaseItemId }) =>
            externalVariantId === lineItem.external_variant_id.ecommerce &&
            purchaseItemId === lineItem.purchase_item_id?.toString()
        )?.id ?? null;
      if (!lineItemId) return [];
      return lineItem.properties.map(property => {
        return {
          lineItemId: lineItemId,
          name: property.name,
          value: property.value,
        };
      });
    });

    // Upsert query for lineItemProperties with mapping to exiting Keel lineItems
    if (lineItemProperties.length > 0) {
      const lineItemPropertiesUpsert = await trx
        .insertInto('line_item_properties')
        .values(
          lineItemProperties.map(lineItemProperty => {
            return {
              lineItemId: lineItemProperty.lineItemId,
              name: lineItemProperty.name,
              value: lineItemProperty.value,
              active: true,
            };
          })
        )
        .onConflict(oc =>
          oc.columns(['lineItemId', 'name']).doUpdateSet({
            value: eb => eb.ref('excluded.value'),
            active: true,
          })
        )
        .returning(['line_item_properties.id', 'lineItemId'])
        .execute();
    }

    // Initially set all metafields to NOT active
    // After the metafields upsert below, any newly REMOVED metafields will be left in a not active state
    // e.g. We handle the situation where a metafield is removed from an order
    await trx
      .updateTable('order_metafield')
      .set(eb => ({ active: false }))
      .where(
        'orderId',
        'in',
        ordersUpsert.map(order => order.id)
      )
      .returning(['id'])
      .execute();

    // Build metafields upsert array
    const metafields = orders.flatMap(order => {
      if (!order.include?.metafields.length) return [];
      const orderId = ordersUpsert.find(({ rechargeId }) => rechargeId === order.id.toString());
      if (!orderId) return [];

      return order.include.metafields.map(metafield => {
        return {
          orderId: orderId.id,
          ...metafield,
        };
      });
    });

    // Upsert query for order metafields
    if (metafields.length > 0) {
      const metafieldsUpsert = await trx
        .insertInto('order_metafield')
        .values(
          metafields.map(metafield => {
            return {
              rechargeId: metafield.id.toString(),
              rechargeCreatedAt: metafield.created_at,
              description: metafield.description,
              key: metafield.key,
              namespace: metafield.namespace,
              orderId: metafield.orderId,
              rechargeUpdatedAt: metafield.updated_at,
              value: metafield.value,
              valueType: metafield.value_type,
            };
          })
        )
        .onConflict(oc =>
          oc.column('rechargeId').doUpdateSet({
            rechargeCreatedAt: eb => eb.ref('excluded.rechargeCreatedAt'),
            description: eb => eb.ref('excluded.description'),
            key: eb => eb.ref('excluded.key'),
            namespace: eb => eb.ref('excluded.namespace'),
            orderId: eb => eb.ref('excluded.orderId'),
            rechargeUpdatedAt: eb => eb.ref('excluded.rechargeUpdatedAt'),
            value: eb => eb.ref('excluded.value'),
            valueType: eb => eb.ref('excluded.valueType'),
            active: true,
          })
        )
        .returning(['rechargeId', 'id'])
        .execute();
    }
    return ordersUpsert;
  });

  // Return if orderUpsert transaction fails
  if (!ordersUpsert?.length) return;

  // Create dispatch tasks:
  // - Temp fix for subscribers not firing from a database API call inside a flow
  // - Is safe to run alongside subscriber
  await Promise.all(
    ordersUpsert.map(async order => {
      const lineItemData = await db
        .selectFrom('line_item')
        .leftJoin(
          'product_variant',
          'product_variant.externalVariantId',
          'line_item.externalVariantId'
        )
        .select([
          'line_item.orderId',
          'line_item.externalVariantId',
          'canBeSparePart',
          'bundleComponentProducts',
        ])
        .where('orderId', '=', order.id)
        .execute();
      // Single SKU: Exactly 1 item, that it not a bundle or a spare part
      // Pick-n-pack: All other orders
      const taskType =
        lineItemData.length === 1 &&
        (!lineItemData[0].bundleComponentProducts ||
          lineItemData[0].bundleComponentProducts.length <= 1) &&
        lineItemData[0].canBeSparePart != true
          ? OrderTaskType.SingleSkuDispatch
          : OrderTaskType.PickPackDispatch;

      // Create a dispatch task if one doesn't already exist
      await db
        .insertInto('order_task')
        .values({ type: taskType, orderId: order.id, deferredUntil: new Date(Date.now()) })
        .onConflict(oc => oc.columns(['type', 'orderId']).doNothing())
        .returning(['id'])
        .execute();
    })
  );
}
