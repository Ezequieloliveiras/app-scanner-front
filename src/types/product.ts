export type StockEntry = {
  quantity: number;
  source: string;
  type?: "invoice_entry" | "missing_delivered" | "stock_withdraw_requested" | "stock_withdraw_approved" | "stock_withdraw_rejected";
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
  branchStocks?: BranchStock[];
};

export type BranchStock = {
  branchName: string;
  quantity: number;
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

export type BranchTransferStatus = "reserved" | "in_transit" | "received" | "cancelled";

export type BranchTransferHistory = {
  status: BranchTransferStatus;
  observation?: string;
  createdAt: string;
};

export type BranchTransfer = {
  _id: string;
  product: string;
  productName: string;
  ean: string;
  quantity: number;
  sourceBranch: string;
  sourceBranchCode?: string;
  targetBranch: string;
  targetBranchCode?: string;
  lot?: string;
  status: BranchTransferStatus;
  observation?: string;
  history: BranchTransferHistory[];
  createdAt: string;
};

export type CreateBranchTransferPayload = {
  productId: string;
  quantity: number;
  sourceBranch?: string;
  sourceBranchCode?: string;
  targetBranch: string;
  targetBranchCode?: string;
  lot?: string;
  observation?: string;
};

export type StockRequestStatus = "pending" | "approved" | "rejected";

export type StockRequestHistory = {
  status: StockRequestStatus;
  observation?: string;
  actorName?: string;
  createdAt: string;
};

export type StockRequest = {
  _id: string;
  product: string;
  productName: string;
  ean: string;
  quantity: number;
  observation?: string;
  status: StockRequestStatus;
  requester: string;
  requesterName: string;
  requesterEmail: string;
  reviewer?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewObservation?: string;
  history: StockRequestHistory[];
  createdAt: string;
};

export type CreateStockRequestPayload = {
  productId: string;
  quantity: number;
  observation?: string;
};
