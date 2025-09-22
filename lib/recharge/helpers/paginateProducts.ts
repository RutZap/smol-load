import { ListProductsResponse } from '../types/product';
import { Product } from '../types/product';

export async function* paginateProducts(
  fetchPage: (cursor: string | undefined) => Promise<ListProductsResponse>,
  cursor?: string
): AsyncGenerator<Product[], void> {
  const { products, next_cursor } = await fetchPage(cursor);

  if (products.length === 0) return;

  yield products;

  if (next_cursor != null) {
    yield* paginateProducts(fetchPage, next_cursor);
  }
}
