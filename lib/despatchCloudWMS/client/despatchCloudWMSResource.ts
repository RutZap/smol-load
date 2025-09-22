import { DespatchCloudWMSClient } from './despatchCloudWMSClient';

export class DespatchCloudWMSResource {
  protected api: DespatchCloudWMSClient;

  constructor(api: DespatchCloudWMSClient) {
    this.api = api;
  }
}
