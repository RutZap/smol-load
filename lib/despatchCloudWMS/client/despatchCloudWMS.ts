import { RechargeClientConfig } from '../../recharge/types/config';
import { DespatchCloudWMSClient } from './despatchCloudWMSClient';
import { Inventory } from './inventory';
import { Order } from './order';

export class DespatchCloudWMS {
  private client: DespatchCloudWMSClient;
  inventory: Inventory;
  order: Order;

  constructor(config: RechargeClientConfig) {
    this.client = new DespatchCloudWMSClient(config);
    this.inventory = new Inventory(this.client);
    this.order = new Order(this.client);
  }
}
