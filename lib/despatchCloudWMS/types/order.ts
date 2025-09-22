export interface orderInventory {
  id: string;
  order_id: string;
  stock_code: string;
  quantity: string;
  name: string;
  price: string;
  options: string;
  notes: string;
  sales_channel_item_id: string;
}

export interface order {
  order_id: string;
  chapi_uuid: string;
  chapi: string;
  channel_id: string;
  channel_alt_id: string;
  channel_username: string;
  shipping_name_company: string;
  shipping_name: string;
  shipping_address_line_one: string;
  shipping_address_line_two: string;
  shipping_address_city: string;
  shipping_address_county: string;
  shipping_address_country: string;
  shipping_address_postcode: string;
  shipping_address_iso: string;
  invoice_name_company: string;
  invoice_name: string;
  invoice_address_line_one: string;
  invoice_address_line_two: string;
  invoice_address_city: string;
  invoice_address_county: string;
  invoice_address_country: string;
  invoice_address_postcode: string;
  invoice_address_iso: string;
  email: string;
  phone_one: string;
  phone_two: string;
  total_paid: string;
  tax_paid: string;
  shipping_paid: string;
  shipping_method_requested: string;
  shipping_tracking_code: string;
  payment_method: string;
  payment_ref: string;
  payment_currency: string;
  sales_channel: string;
  date_received: string;
  date_dispatched: string;
  date_packing_scan: string;
  status: string;
  customer_comments: string;
  staff_comments: string;
  staff_notes: string;
  deleted: string;
  files: string;
  discount_code_used: string;
  customer_group: string;
  coupon_code: string;
  total_inventory_count: string;
  channel_updated: string;
  channel_updated_time: string;
  xero_status: string;
  aramex_status: string;
  aramex_order_id: string;
  account_status: string;
  print_batch_ref: string;
  external_reference: string;
  one_off_shipment: string;
  archived: string;
  label_pre_booked: string;
  label_pre_format: string;
  label_pre_booked_data: string;
  label_pre_booked_count: string;
  label_pre_verification_checks_done: string;
  label_pre_book_batch_id: string;
  import_tag: string;
  shipping_method_id_calculated: string;
  d2p_batch_id: string;
  sent_to_printer: string;
  sent_to_printer_time: string;
  print_queue_number: string;
  print_confirm_number: string;
  sent_to_wms: string;
  sent_to_whistl: string;
  sent_to_wms_run_id: string;
  sent_to_wms_update_time: string;
  order_inventory: orderInventory[];
}

export const OrderStatus = {
  Draft: '1',
  OnHold: '2',
  Ready: '3',
  Dispatched: '5',
  Cancelled: '6',
} as const;

export type OrderStatusCode = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface pagination {
  current_page: number;
  total_pages: number;
  total_records: number;
  limit: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  next_page: number;
  previous_page: number;
}

export interface orderResponse {
  status: string;
  data: order[];
  pagination: pagination;
}
