import { RechargeResource } from './RechargeResource';
import { ListProductsResponse, GetProductResponse } from '../types/product';

export class Products extends RechargeResource {
  async listProducts(params?: { limit?: number; cursor?: string }): Promise<ListProductsResponse> {
    let endpoint = 'products';
    const searchParams = new URLSearchParams();
    if (params?.limit !== undefined) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params?.cursor !== undefined) {
      searchParams.append('cursor', params.cursor);
    }
    if (searchParams.size) {
      endpoint += `?${searchParams.toString()}`;
    }
    const response = await this.api.get<ListProductsResponse>(endpoint);
    console.log(endpoint);
    return response;
  }

  async getProduct(externalProductId: string): Promise<GetProductResponse> {
    const endpoint = `products/${externalProductId}`;
    const response = await this.api.get<GetProductResponse>(endpoint);
    return response;
  }

  // TODO - for moving PIM into Keel:
  // - createProduct
  // - updateProduct
}
