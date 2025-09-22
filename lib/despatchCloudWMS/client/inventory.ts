import { getInventoryItemResponse } from '../types/inventory';
import { DespatchCloudWMSResource } from './despatchCloudWMSResource';

export class Inventory extends DespatchCloudWMSResource {
  async getItem(inventoryId: string): Promise<getInventoryItemResponse> {
    const endpoint = `ws/v1/wskiel/get_inventory/${inventoryId}`;
    const inventory = await this.api.get<getInventoryItemResponse>(endpoint);
    return inventory;
  }
}
