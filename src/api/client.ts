import {
  AuthCredentials,
  AuthSession,
  AuthUser,
  BillingCheckoutResult,
  CreateManagedUserPayload,
  InventoryDashboard,
  PlanDefinition,
  RegisterCredentials,
  UpdateProfilePayload,
  UpdateUserAccessPayload
} from "../types/app";
import {
  CommitStockPayload,
  CommitStockResult,
  BranchTransfer,
  BranchTransferStatus,
  CreateBranchTransferPayload,
  CreateStockRequestPayload,
  InvoiceResult,
  MissingDeliveredPayload,
  Product,
  StockRequest
} from "../types/product";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333";

async function request<T>(path: string, options?: RequestInit & { token?: string }): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options?.headers || {})
      },
      credentials: "include",
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
  login(payload: AuthCredentials) {
    return request<AuthSession>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  register(payload: RegisterCredentials) {
    return request<AuthSession>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  getProfile(token: string) {
    return request<AuthUser>("/api/auth/me", { token });
  },

  registerPushToken(token: string, expoPushToken: string, deviceId?: string) {
    return request<{ ok: true }>("/api/auth/push-token", {
      method: "POST",
      token,
      body: JSON.stringify({ token: expoPushToken, deviceId })
    });
  },

  listUsers(token: string) {
    return request<AuthUser[]>("/api/auth/users", { token });
  },

  updateProfile(token: string, payload: UpdateProfilePayload) {
    return request<AuthUser>("/api/auth/me", {
      method: "PATCH",
      token,
      body: JSON.stringify(payload)
    });
  },

  requestPasswordReset(email: string) {
    return request<{ message: string; resetToken?: string }>("/api/auth/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  },

  createUser(token: string, payload: CreateManagedUserPayload) {
    return request<AuthUser>("/api/auth/users", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    });
  },

  updateUserAccess(token: string, userId: string, payload: UpdateUserAccessPayload) {
    return request<AuthUser>(`/api/auth/users/${userId}/access`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload)
    });
  },

  listPlans() {
    return request<PlanDefinition[]>("/api/billing/plans");
  },

  requestPlanCheckout(token: string, plan: PlanDefinition["id"]) {
    return request<BillingCheckoutResult>("/api/billing/checkout", {
      method: "POST",
      token,
      body: JSON.stringify({ plan })
    });
  },

  adminResetPassword(token: string, userId: string, password: string) {
    return request<AuthUser>(`/api/auth/users/${userId}/password`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ password })
    });
  },

  scanInvoice(token: string, qrCodeContent: string) {
    return request<InvoiceResult>("/api/invoices/scan", {
      method: "POST",
      token,
      body: JSON.stringify({ qrCodeContent })
    });
  },

  simulateInvoice(token: string) {
    return request<InvoiceResult>("/api/invoices/simulate", {
      method: "POST",
      token
    });
  },

  commitStock(token: string, payload: CommitStockPayload) {
    return request<CommitStockResult>("/api/invoices/commit", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    });
  },

  listProducts(token: string) {
    return request<Product[]>("/api/products", { token });
  },

  getInventoryDashboard(token: string, query?: Record<string, string | number | boolean | undefined>) {
    const params = new URLSearchParams();

    Object.entries(query || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });

    const suffix = params.toString() ? `?${params.toString()}` : "";
    return request<InventoryDashboard>(`/api/dashboard${suffix}`, { token });
  },

  registerMissingDelivered(token: string, productId: string, payload: MissingDeliveredPayload) {
    return request<Product>(`/api/products/${productId}/missing-delivered`, {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    });
  },

  listStockRequests(token: string) {
    return request<StockRequest[]>("/api/stock-requests", { token });
  },

  createStockRequest(token: string, payload: CreateStockRequestPayload) {
    return request<StockRequest>("/api/stock-requests", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    });
  },

  updateStockRequestStatus(token: string, id: string, status: "approved" | "rejected", observation?: string) {
    return request<StockRequest>(`/api/stock-requests/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status, observation })
    });
  },

  listBranchTransfers(token: string) {
    return request<BranchTransfer[]>("/api/branches/transfers", { token });
  },

  createBranchTransfer(token: string, payload: CreateBranchTransferPayload) {
    return request<BranchTransfer>("/api/branches/transfers", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    });
  },

  updateBranchTransferStatus(
    token: string,
    id: string,
    status: Exclude<BranchTransferStatus, "reserved">,
    observation?: string
  ) {
    return request<BranchTransfer>(`/api/branches/transfers/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status, observation })
    });
  },

  cancelBranchTransfer(token: string, id: string, observation?: string) {
    return request<BranchTransfer>(`/api/branches/transfers/${id}/cancel`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ observation })
    });
  }
};
