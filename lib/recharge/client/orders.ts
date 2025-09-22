import { RechargeResource } from './RechargeResource';
import { OrderResponse, UpdateOrderRequest } from '../types/order';

export class Orders extends RechargeResource {
  async getOrder(orderId: string): Promise<OrderResponse> {
    const endpoint = `orders/${orderId}?include=metafields`;
    const response = await this.api.get<OrderResponse>(endpoint);
    return response;
  }

  async updateOrder(orderId: string, orderData: UpdateOrderRequest): Promise<OrderResponse> {
    const endpoint = `orders/${orderId}`;
    const response = await this.api.put<OrderResponse>(endpoint, orderData);
    return response;
  }
}
