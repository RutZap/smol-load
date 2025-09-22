import { useDatabase } from '@teamkeel/sdk';
import { sql } from 'kysely';
import { parseFloatNormalise } from '../utils/parseFloatNormalise';

interface QueryItem {
  quantity: number;
  title: string;
  sku: string;
  image: string | null;
  variantTitle: string;
  barcodes: string[];
  originalPrice: string;
  totalPrice: string;
  weightKg: number;
  height: number | null;
  width: number | null;
  length: number | null;
  defaultShippingRateId: string | null;
}

export interface DispatchLineItem {
  sku: string;
  variantTitle: string;
  quantity: number;
  image: {
    url: string;
  };
  barcodes: string[];
  weightKg: number;
  originalPrice: number;
  totalPrice: number;
  height: number | null;
  width: number | null;
  length: number | null;
  defaultShippingRateId: string | null;
}

interface DispatchLineItemsSuccess {
  ok: true;
  items: DispatchLineItem[];
}

type DispatchLineItemsError = {
  ok: false;
  message: string;
};

export type DispatchLineItemResult = DispatchLineItemsSuccess | DispatchLineItemsError;

/**
 * Fetches line items ready for a pickList
 * @param orderId for the order being dispatched
 * @returns PickListItemResult
 * * PickListItemsSuccess.items: A list of PickListItems that is safe to use in ctx.ui.interactive.pickList
 * * PickListItemsError.message: A user friendly description of the error to be displayed in the UI.
 *
 * If the image missing for some reason a placeholder image URL is returned
 */
export async function getDispatchLineItems(orderId: string): Promise<DispatchLineItemResult> {
  const db = useDatabase();
  const items = await db
    .selectFrom('line_item')
    .leftJoin('product', 'product.externalProductId', 'line_item.externalProductId')
    .leftJoin('product_variant', 'product_variant.externalVariantId', 'line_item.externalVariantId')
    .leftJoin('product_image', 'product_image.productId', 'product.id')
    .leftJoin('whistl_service', 'whistl_service.id', 'product_variant.defaultShippingRateId')
    .select([
      'product_variant.title as variantTitle',
      'line_item.quantity',
      sql<string[]>`array[barcode_1, barcode_2, barcode_3, barcode_4, barcode_5]`.as('barcodes'),
      'product_variant.sku',
      'product.title',
      'product_image.small as image',
      'line_item.originalPrice',
      'line_item.totalPrice',
      'product_variant.weight as weightKg',
      'product_variant.defaultShippingRateId',
      'product_variant.height',
      'product_variant.width',
      'product_variant.length',
    ])
    .where('line_item.orderId', '=', orderId)
    .where('product_variant.isPhysical', '!=', false)
    .execute();

  if (!items?.length) {
    return {
      ok: false,
      message: `No line items found for order ID: ${orderId}`,
    };
  }

  if (items.some(item => item.quantity == null)) {
    return {
      ok: false,
      message: 'One or more line items are missing a dispatch quantity',
    };
  }

  if (items.some(item => item.sku == null)) {
    return {
      ok: false,
      message: 'One or more line items are missing an SKU',
    };
  }

  if (items.some(item => item.weightKg == null)) {
    return {
      ok: false,
      message: 'One or more line items are missing a valid weight',
    };
  }

  if (items.some(item => item.originalPrice == null)) {
    return {
      ok: false,
      message: 'One or more line items are missing a valid unit price',
    };
  }

  if (items.some(item => item.totalPrice == null)) {
    return {
      ok: false,
      message: 'One or more line items are missing a valid total price',
    };
  }

  if (items.some(item => item.title == null) || items.some(item => item.variantTitle == null)) {
    return {
      ok: false,
      message: 'One or more line items do not have the correct name',
    };
  }

  const imagePlaceholderUrl =
    'https://placehold.co/300x300/FFFFFF/73D0B3/png?text=No+image+available';

  const validPickList: DispatchLineItem[] = items
    .filter(
      (item): item is QueryItem =>
        item.quantity != null &&
        item.sku != null &&
        item.title != null &&
        item.variantTitle != null &&
        item.weightKg != null &&
        item.originalPrice != null &&
        item.totalPrice != null
    )
    .map(item => {
      const fullVariantTitle =
        item.variantTitle.trim() === 'Default Title'
          ? item.title
          : `${item.title} - ${item.variantTitle}`;
      return {
        sku: item.sku,
        variantTitle: fullVariantTitle,
        quantity: item.quantity,
        image: {
          url: item.image ?? imagePlaceholderUrl,
        },
        barcodes: item.barcodes,
        weightKg: item.weightKg,
        originalPrice: parseFloatNormalise(item.originalPrice) ?? 0,
        totalPrice: parseFloatNormalise(item.totalPrice) ?? 0,
        defaultShippingRateId: item.defaultShippingRateId,
        height: item.height,
        width: item.width,
        length: item.length,
      };
    });

  if (items.length != validPickList.length) {
    return {
      ok: false,
      message: `Unable to process order: ${orderId}. Please report this...`,
    };
  }

  return {
    ok: true,
    items: validPickList,
  };
}
