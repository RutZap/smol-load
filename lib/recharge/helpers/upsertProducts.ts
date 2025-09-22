import { useDatabase } from '@teamkeel/sdk';
import { Product } from '../types/product';

/**
 * @param products returned from Recharge get Products API
 * Upserts new product data into models
 * Any previously added values that are no longer used, will not be removed. As this might break things in progress
 */
export async function upsertProducts(products: Product[]): Promise<void> {
  const db = useDatabase();
  const productUpsert = await db
    .insertInto('product')
    .values(
      products.map(item => {
        return {
          brand: item.brand,
          description: item.description,
          externalCreatedAt: item.external_created_at,
          externalProductId: item.external_product_id,
          externalUpdatedAt: item.external_updated_at,
          publishedAt: item.published_at,
          requiresShipping: item.requires_shipping,
          title: item.title,
          vendor: item.vendor,
        };
      })
    )
    .onConflict(oc =>
      oc.column('externalProductId').doUpdateSet({
        brand: eb => eb.ref('excluded.brand'),
        description: eb => eb.ref('excluded.description'),
        externalCreatedAt: eb => eb.ref('excluded.externalCreatedAt'),
        externalUpdatedAt: eb => eb.ref('excluded.externalUpdatedAt'),
        publishedAt: eb => eb.ref('excluded.publishedAt'),
        requiresShipping: eb => eb.ref('excluded.requiresShipping'),
        title: eb => eb.ref('excluded.title'),
        vendor: eb => eb.ref('excluded.vendor'),
      })
    )
    .returning(['id', 'externalProductId'])
    .execute();

  // Build productOptions bulk upsert array:
  // - Adding the Keel product ID for use as a foreign key
  const productOptions = products.flatMap(item => {
    const productId = productUpsert.find(
      ({ externalProductId }) => externalProductId === item.external_product_id
    );
    if (!productId || !item?.options?.length) return [];
    return item.options.map(option => {
      return {
        productId: productId.id,
        ...option,
      };
    });
  });

  let productOptionsUpsert: { id: string; productId: string }[];
  if (productOptions.length) {
    productOptionsUpsert = await db
      .insertInto('product_option')
      .values(
        productOptions.map(option => {
          return {
            productId: option.productId,
            name: option.name,
            position: option.position,
          };
        })
      )
      .onConflict(oc =>
        oc.columns(['productId', 'name']).doUpdateSet({
          name: eb => eb.ref('excluded.name'),
          position: eb => eb.ref('excluded.position'),
        })
      )
      .returning(['id', 'productId'])
      .execute();
  }

  // Build productOptionValues upsert array:
  // - Adding the Keel product ID and option ID for use as a foreign key
  const productOptionValues = productOptions.flatMap(option => {
    const productOptionId = productOptionsUpsert.find(
      ({ productId }) => productId === option.productId
    );
    if (!productOptionId) return [];
    return option.values.map(optionValue => {
      return {
        productOptionId: productOptionId.id,
        productId: productOptionId.productId,
        ...optionValue,
      };
    });
  });

  const productOptionValueUpsert = await db
    .insertInto('product_option_value')
    .values(
      productOptionValues.map(optionValue => {
        return {
          productOptionId: optionValue.productOptionId,
          label: optionValue.label,
          position: optionValue.position,
        };
      })
    )
    .onConflict(oc => oc.columns(['productOptionId', 'label']).doNothing())
    .returning(['id', 'productOptionId', 'label'])
    .execute();

  // Build the product image upsert array:
  //  - Flatten out product images for bulk insert
  //  - Add the Keel product ID for use as a foreign key
  const productImage = products.flatMap(product => {
    const productId = productUpsert.find(
      ({ externalProductId }) => externalProductId === product.external_product_id
    );
    if (!productId || !product?.images?.length) return [];
    return product.images.map(image => {
      return {
        productId: productId.id,
        ...image,
      };
    });
  });

  if (productImage?.length) {
    const productImageUpsert = await db
      .insertInto('product_image')
      .values(
        productImage.map(image => {
          return {
            productId: image.productId,
            small: image.small,
            medium: image.medium,
            large: image.large,
            original: image.original,
            sortOrder: image.sort_order,
          };
        })
      )
      .onConflict(oc =>
        oc.columns(['productId', 'sortOrder']).doUpdateSet({
          small: eb => eb.ref('excluded.small'),
          medium: eb => eb.ref('excluded.medium'),
          large: eb => eb.ref('excluded.large'),
          original: eb => eb.ref('excluded.original'),
        })
      )
      .returning(['product_image.id', 'product_image.productId'])
      .execute();
  }

  // Build the productVariants upsert array:
  // - Add the Keel product ID for use as a foreign key
  const productVariants = products.flatMap(product => {
    const productId = productUpsert.find(
      ({ externalProductId }) => externalProductId === product.external_product_id
    );
    if (!productId) return [];
    return product.variants.map(variant => {
      return {
        productId: productId.id,
        externalProductId: product.external_product_id,
        ...variant,
      };
    });
  });

  const productVariantUpsert = await db
    .insertInto('product_variant')
    .values(
      productVariants.map(variant => {
        return {
          externalVariantId: variant.external_variant_id,
          productId: variant.productId,
          rechargeWeight: variant.dimensions.weight,
          rechargeWeightUnit: variant.dimensions.weight_unit,
          requiresShipping: variant.requires_shipping,
          sku: variant.sku,
          title: variant.title,
          taxable: variant.taxable,
          taxCode: variant.tax_code,
          compareAtPrice: variant.prices.compare_at_price,
          unitPrice: variant.prices.unit_price,
          smallImageUrl: variant.image.small,
          mediumImageUrl: variant.image.medium,
          largeImageUrl: variant.image.large,
          originalImageUrl: variant.image.original,
        };
      })
    )
    .onConflict(oc =>
      oc.column('externalVariantId').doUpdateSet({
        productId: eb => eb.ref('excluded.productId'),
        rechargeWeight: eb => eb.ref('excluded.rechargeWeight'),
        rechargeWeightUnit: eb => eb.ref('excluded.rechargeWeightUnit'),
        requiresShipping: eb => eb.ref('excluded.requiresShipping'),
        sku: eb => eb.ref('excluded.sku'),
        title: eb => eb.ref('excluded.title'),
        taxable: eb => eb.ref('excluded.taxable'),
        taxCode: eb => eb.ref('excluded.taxCode'),
        compareAtPrice: eb => eb.ref('excluded.compareAtPrice'),
        unitPrice: eb => eb.ref('excluded.unitPrice'),
        smallImageUrl: eb => eb.ref('excluded.smallImageUrl'),
        mediumImageUrl: eb => eb.ref('excluded.mediumImageUrl'),
        largeImageUrl: eb => eb.ref('excluded.largeImageUrl'),
        originalImageUrl: eb => eb.ref('excluded.originalImageUrl'),
      })
    )
    .returning(['id', 'externalVariantId'])
    .execute();

  // Build the productVariantOptions bulk upsert array:
  // - This is a many-to-many relationship in Keel: productVariant <-> productOption
  // - Build an array of productVariant IDs mapped to productOption IDs
  const productVariantOptions = productVariants.flatMap(productVariant => {
    const productVariantId = productVariantUpsert.find(
      ({ externalVariantId }) => externalVariantId == productVariant.external_variant_id
    );
    const productIdMap = productUpsert.find(
      ({ externalProductId }) => externalProductId === productVariant.externalProductId
    );

    if (!productVariantId || !productIdMap) return [];

    const optionId = productOptionsUpsert.find(({ productId }) => productId === productIdMap.id);

    if (!optionId) return [];

    return productVariant.option_values.flatMap(optionValue => {
      const productOptionValueId = productOptionValueUpsert.find(
        ({ productOptionId, label }) =>
          productOptionId === optionId.id && label === optionValue.label
      );

      if (!productOptionValueId) return [];

      return {
        productOptionValueId: productOptionValueId.id,
        productVariantId: productVariantId.id,
      };
    });
  });

  if (!productVariantOptions?.length) return;

  const productVariantOptionsUpsert = await db
    .insertInto('product_variant_option_value')
    .values(
      productVariantOptions.map(option => {
        return {
          productOptionValueId: option.productOptionValueId,
          productVariantId: option.productVariantId,
        };
      })
    )
    .onConflict(oc => oc.columns(['productOptionValueId', 'productVariantId']).doNothing())
    .returning(['id'])
    .execute();
}
