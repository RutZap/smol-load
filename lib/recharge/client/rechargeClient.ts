import { errors } from '@teamkeel/sdk';
import { RechargeClientConfig } from '../types/config';

export class RechargeClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: RechargeClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT',
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    console.log(`Request URL: ${url}`);

    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Recharge-Version': '2021-11',
      'X-Recharge-Access-Token': this.apiKey,
    });

    const request = new Request(url, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const response = await fetch(request);

    if (!response.ok) {
      const body = await response.text();
      console.log(`Recharge API error: ${response.status}: ${body}`, request);
      throw new errors.BadRequest(`Recharge API error: ${response.status}: ${body}`);
    }

    const jsonBody = (await response.json()) as T;

    return jsonBody;
  }

  public get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  public post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, body);
  }

  public put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', endpoint, body);
  }
}
