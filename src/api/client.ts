import {
  CommitStockPayload,
  CommitStockResult,
  BranchTransfer,
  BranchTransferStatus,
  CreateBranchTransferPayload,
  InvoiceResult,
  MissingDeliveredPayload,
  Product
} from "../types/product";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {})
      },
      ...options
    });
  } catch {
    throw new Error(`Nao consegui conectar na API em ${API_URL}. Confira se backend e celular estao na mesma rede.`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Erro na comunicacao com a API.");
  }

  return data as T;
}

export const api = {
  scanInvoice(qrCodeContent: string) {
    return request<InvoiceResult>("/api/invoices/scan", {
      method: "POST",
      body: JSON.stringify({ qrCodeContent })
    });
  },

  simulateInvoice() {
    return request<InvoiceResult>("/api/invoices/simulate", {
      method: "POST"
    });
  },

  commitStock(payload: CommitStockPayload) {
    return request<CommitStockResult>("/api/invoices/commit", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  listProducts() {
    return request<Product[]>("/api/products");
  },

  registerMissingDelivered(productId: string, payload: MissingDeliveredPayload) {
    return request<Product>(`/api/products/${productId}/missing-delivered`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  listBranchTransfers() {
    return request<BranchTransfer[]>("/api/branches/transfers");
  },

  createBranchTransfer(payload: CreateBranchTransferPayload) {
    return request<BranchTransfer>("/api/branches/transfers", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  updateBranchTransferStatus(id: string, status: Exclude<BranchTransferStatus, "reserved">, observation?: string) {
    return request<BranchTransfer>(`/api/branches/transfers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, observation })
    });
  },

  cancelBranchTransfer(id: string, observation?: string) {
    return request<BranchTransfer>(`/api/branches/transfers/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ observation })
    });
  }
};
