// From Despatch Cloud legacy API (undocumented, anywhere)
export interface stockTransactions {
  id: string;
  log_date: string;
  staff_id: string;
  qty: string;
  prev_qty: string;
  new_qty: string;
  action: string;
  note: string;
  stock_code: string;
}

// From Despatch Cloud legacy API (undocumented, anywhere)
export interface inventoryItem {
  product_id: string;
  product_code: string;
  item_barcode: string;
  item_barcode_2: string;
  item_barcode_3: string;
  item_barcode_4: string;
  item_barcode_5: string;
  name: string;
  image: string;
  location: string;
  location_2: string;
  location_3: string;
  location_4: string;
  location_5: string;
  stock_level: string;
  stock_warn_level: string;
  sync_stock: string;
  production: string;
  product_weight: string;
  product_height: string;
  product_width: string;
  product_length: string;
  date_added: string;
  data_array: string;
  description?: string;
  supplier: string;
  cost_price: string;
  last_updated: string;
  vat_option: string;
  accounts_code: string;
  max_level: string;
  multiplier: string;
  retail_price: string;
  shipping_service_id: string;
  archive: string;
  stock_transactions: stockTransactions[];
  has_image: boolean;
  image_url: string;
}

// From Despatch Cloud legacy API (undocumented, anywhere)
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

export interface getInventoryItemResponse {
  status: string;
  data: inventoryItem[];
  pagination: pagination;
}
