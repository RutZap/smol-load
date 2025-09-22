import { RechargeClientConfig } from '../types/config';
import { RechargeClient } from './rechargeClient';
import { Products } from './products';
import { Orders } from './orders';

export class Recharge {
  private client: RechargeClient;
  products: Products;
  orders: Orders;

  constructor(config: RechargeClientConfig) {
    this.client = new RechargeClient(config);
    this.products = new Products(this.client);
    this.orders = new Orders(this.client);
  }
}
