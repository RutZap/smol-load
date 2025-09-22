import { OrderStatus as DespatchCloudOrderStatus } from '../types/order';
import { DispatchLineItem } from '../../flowsShared/getDispatchLineItems';
import { DespatchCloudWMS } from '../client/despatchCloudWMS';

interface syncStatusMatchSkuParams {
  orderId: string;
  dispatchItem: DispatchLineItem[];
  baseUrl: string;
  apiKey: string;
}

interface syncStatusMatchSkuResult {
  ok: boolean;
  message: string;
}

/**
 * Temporary function to help ensure Despatch Cloud order match Keel orders before sync-ing the dispatched status
 * Despatch Cloud state when splitting orders the IDs are named -2, -3, -4 etc following the index of the item,
 * however we will check this to be absolutely sure
 *
 * @param orderId Recharge ID of order. Plus the suffic following a split
 * @param dispatchItem DispatchLineItem returned from getDispatchLineItems
 * @param baseUrl from env.DESPATCH_CLOUD_WMS_BASE_URL
 * @param apiKey from env.DESPATCH_CLOUD_WMS_API_KEY
 *
 */
export async function syncStatusMatchSku(
  params: syncStatusMatchSkuParams
): Promise<syncStatusMatchSkuResult> {
  const despatchCloud = new DespatchCloudWMS({
    baseUrl: params.baseUrl,
    apiKey: params.apiKey,
  });
  const despatchCloudOrder = await despatchCloud.order.get(params.orderId);

  if (!despatchCloudOrder)
    return {
      ok: false,
      message: `Order not found in Despatch Cloud using ID: ${params.orderId}`,
    };

  const skuList: string[] = params.dispatchItem.map(item => item.sku);
  const dcSkuList: string[] = despatchCloudOrder.data[0].order_inventory.map(
    item => item.stock_code
  );
  const skusEqual =
    skuList.length === dcSkuList.length && skuList.every(code => dcSkuList.includes(code));

  if (skusEqual === false)
    return {
      ok: false,
      message: `Item in Keel order do not match Despatch Cloud. Please report this quoting: ${params.orderId}`,
    };

  const despatchCloudUpdate = await despatchCloud.order.updateStatus(
    params.orderId,
    DespatchCloudOrderStatus.Dispatched
  );

  const ok = despatchCloudUpdate.status === 'SUCCESS' ? true : false;
  const message =
    despatchCloudUpdate.status === 'SUCCESS'
      ? 'Success'
      : `Error updating Despactch Cloud: Please report this quoting: ${params.orderId}`;

  return {
    ok,
    message,
  };
}
