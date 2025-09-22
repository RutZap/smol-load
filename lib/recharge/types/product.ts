interface ProductImage {
  small?: string | null;
  medium?: string | null;
  large?: string | null;
  original?: string | null;
  sort_order: number;
}

interface ProductOptionValue {
  label: string;
  position: number;
}

interface ProductOption {
  name: string;
  position: number;
  values: ProductOptionValue[];
}

interface Dimensions {
  weight: number;
  weight_unit: string;
}

interface Prices {
  compare_at_price?: string | null;
  unit_price: string;
}

interface ProductVariant {
  external_variant_id: string;
  dimensions: Dimensions;
  image: Omit<ProductImage, 'sort_order'>;
  option_values: Array<{ label: string }>;
  requires_shipping: boolean;
  sku: string;
  title: string;
  taxable: boolean;
  tax_code?: string | null;
  prices: Prices;
}

export interface Product {
  brand?: string | null;
  description?: string;
  external_created_at: string;
  external_product_id: string;
  external_updated_at: string;
  images: ProductImage[];
  options: ProductOption[];
  published_at: string;
  requires_shipping: boolean;
  title: string;
  variants: ProductVariant[];
  vendor: string;
}

export interface ListProductsResponse {
  next_cursor: string | null;
  previous_cursor: string | null;
  products: Product[];
}

export interface GetProductResponse {
  product: Product;
}
