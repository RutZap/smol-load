import {} from '../types/inventory';
import { orderResponse, OrderStatusCode } from '../types/order';
import { DespatchCloudWMSResource } from './despatchCloudWMSResource';

export class Order extends DespatchCloudWMSResource {
  async get(orderId: string): Promise<orderResponse> {
    const endpoint = `ws/v1/wskiel/get_orders/${orderId}`;
    const order = await this.api.get<orderResponse>(endpoint);
    return order;
  }

  async updateStatus(orderId: string, status: OrderStatusCode): Promise<orderResponse> {
    const endpoint = `/ws/v1/wskiel/update_order/${orderId}`;
    const body = { order: { status: status } };
    const orderUpdate = await this.api.post<orderResponse>(endpoint, body);
    return orderUpdate;
  }
}
