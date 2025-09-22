import { Order, LineItem } from '../types/order';
import { models, ProductVariant } from '@teamkeel/sdk';

/**
 * Order splitting logic for UK only
 * @param order is a single order from the Recharge API
 * @returns an array of orders
 *
 * Split order conditions:
 * - At least 2 items
 * - Less than £20 total value
 * - If all items are letterboxable
 */
export async function processOrderSplitUK(order: Order): Promise<Order[]> {
  // Check: At least 2 items
  const isManyItems = order.line_items.length > 1;

  // Check: <£20 total value
  const isUnder20Gbp = parseFloat(order.total_line_items_price) < 20;

  // Check: Are all items in order letterboxable
  const lineItemIds = order.line_items.map(item => item.external_variant_id.ecommerce);
  const productVariants = await models.productVariant.findMany({
    where: { externalVariantId: { oneOf: lineItemIds } },
  });
  const allLetterBoxable = productVariants.every(variant => variant.isLetterboxable);

  // Split order and add new IDs
  let processedOrders: Order[];
  if (isManyItems && isUnder20Gbp && allLetterBoxable) {
    processedOrders = order.line_items.map((item, index) => {
      const singleItem = order.line_items[index];
      const splitOrderId = `${order.id}-${index + 2}`;
      return {
        ...order,
        line_items: [singleItem],
        id: splitOrderId,
      };
    });
  } else {
    const splitOrderId = `${order.id}-1`;
    processedOrders = [{ ...order, id: splitOrderId }];
  }

  return processedOrders;
}
