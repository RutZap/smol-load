import { OrderStatus, PurchaseItemType } from '@teamkeel/sdk';
import { Metafield } from './metafield';

export interface Order {
  id: number | string;
  address_id: number | null;
  billing_address: Address | null;
  charge: {
    id: number | null;
    external_transaction_id: {
      payment_processor: string | null;
    };
    payment_processor_name: string | null;
    status?: string | null;
  };
  client_details: {
    browser_ip: string | null;
    user_agent: string | null;
  };
  created_at: string | null;
  currency: string | null;
  customer: Customer | null;
  error?: any;
  discounts: Discount[];
  external_cart_token: string | null;
  external_order_id: {
    ecommerce: string | null;
  };
  external_order_name?: {
    ecommerce: string | null;
  };
  external_order_number: {
    ecommerce: string | null;
  };
  hash?: string | null;
  include?: {
    metafields: Metafield[];
  };
  is_prepaid: boolean;
  line_items: LineItem[];
  note: string | null;
  order_attributes: NameValue[];
  processed_at: string | null;
  scheduled_at: string | null;
  shipping_address: Address | null;
  shipping_lines: ShippingLine[];
  status: 'queued' | 'skipped' | 'cancelled' | 'fulfilled' | 'success';
  subtotal_price: string | null;
  tags: string | null;
  tax_lines: TaxLine[];
  taxable: boolean;
  total_discounts: string | null;
  total_duties: string | null;
  total_line_items_price: string;
  total_price: string | null;
  total_refunds: string | null;
  total_tax: string | null;
  total_weight_grams: number | null;
  type: 'recurring' | 'checkout';
  updated_at: string | null;
}

export interface Customer {
  id: number | null;
  email: string | null;
  external_customer_id: {
    ecommerce: string | null;
  };
  hash: string | null;
}

export interface Address {
  address1: string | null;
  address2: string | null;
  city: string | null;
  company: string | null;
  country_code: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  province: string | null;
  zip: string | null;
}

export interface Discount {
  id?: number | null;
  code?: string | null;
  value?: string | null;
  value_type: 'percentage' | 'fixed_amount';
}

export interface LineItem {
  purchase_item_id: number | null;
  external_inventory_policy: string | null;
  external_product_id: {
    ecommerce: string;
  };
  external_variant_id: {
    ecommerce: string;
  };
  grams: number | null;
  images: LineItemImages;
  offer_attributes?: any;
  original_price: string | null;
  properties: NameValue[];
  purchase_item_type: 'subscription' | 'onetime';
  quantity: number | null;
  sku: string | null;
  tax_due: string | null;
  tax_lines: TaxLineWithUnit[];
  taxable: boolean;
  taxable_amount: string | null;
  title: string | null;
  total_price: string | null;
  unit_price: string | null;
  unit_price_includes_tax: boolean;
  variant_title: string | null;
  handle?: string | null;
}

export interface LineItemImages {
  original: string | null;
  small: string | null;
  medium: string | null;
  large: string | null;
}

export interface TaxLine {
  price: string | null;
  rate: number | string | null;
  title: string | null;
}

export interface TaxLineWithUnit extends TaxLine {
  unit_price: string | null;
}

export interface ShippingLine {
  code?: string | null;
  price?: string | null;
  taxable: boolean;
  tax_lines: TaxLine[];
  title?: string | null;
  source?: string | null;
}

export interface NameValue {
  name: string;
  value: string;
}

export const OrderStatusMap = {
  queued: OrderStatus.Queued,
  skipped: OrderStatus.Skipped,
  cancelled: OrderStatus.Cancelled,
  fulfilled: OrderStatus.Fulfilled,
};

export const PurchaseItemTypeMap = {
  subscription: PurchaseItemType.Subscription,
  onetime: PurchaseItemType.Onetime,
};

export interface OrderResponse {
  order: Order;
}

export interface UpdateOrderRequest {
  billing_address?: Address;
  customer?: Customer;
  line_items?: LineItem[];
  external_order_id?: {
    ecommerce: string;
  };
  scheduled_at?: string;
  shipping_address?: Address;
  status: 'queued' | 'skipped' | 'cancelled' | 'fulfilled';
}
