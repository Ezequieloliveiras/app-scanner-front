export type StockEntry = {
  quantity: number;
  source: string;
  type?: "invoice_entry" | "missing_delivered";
  invoiceKey?: string;
  observation?: string;
  createdAt: string;
};

export type Product = {
  _id: string;
  name: string;
  quantity: number;
  ean: string;
  stockEntries: StockEntry[];
};

export type InvoicePreviewProduct = {
  name: string;
  quantity: number;
  ean: string;
  observation?: string;
};

export type InvoiceResult = {
  invoiceKey?: string;
  source: string;
  products: InvoicePreviewProduct[];
};

export type CommitStockPayload = {
  invoiceKey?: string;
  source: string;
  products: InvoicePreviewProduct[];
};

export type CommitStockResult = {
  invoiceKey?: string;
  products: Product[];
};

export type MissingDeliveredPayload = {
  quantity: number;
  observation?: string;
};
