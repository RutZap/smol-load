import { RechargeClient } from './rechargeClient';

export class RechargeResource {
  protected api: RechargeClient;

  constructor(api: RechargeClient) {
    this.api = api;
  }
}
