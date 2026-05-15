import { InvoicePreviewProduct } from "./product";

export type Screen =
  | "home"
  | "dashboard"
  | "scan"
  | "products"
  | "branches"
  | "stock_requests"
  | "access"
  | "certificate"
  | "billing"
  | "profile"
  | "notifications";
export type AuthMode = "login" | "register" | "reset";
export type UserRole = "main" | "master" | "default";
export type UserPlan = "free" | "basic" | "premium" | "pro" | "custom";
export type AppModule = "dashboard" | "scan" | "products" | "branches" | "stock_requests" | "access";

export type PlanDefinition = {
  id: UserPlan;
  label: string;
  description: string;
  monthlyPriceCents: number | null;
  maxManagedUsers: number | null;
  modules: AppModule[];
  features: { key: string; label: string }[];
  highlighted?: boolean;
  contactRequired?: boolean;
};

export type BillingCheckoutResult = {
  status: "free" | "pending" | "active" | "past_due" | "canceled" | "custom_requested";
  plan: PlanDefinition;
  checkoutUrl?: string;
  message: string;
};

export type DashboardProductStatus = "out_of_stock" | "without_movement" | "stopped" | "attention" | "healthy";
export type DashboardAgingBucket = "sem_estoque" | "sem_movimentacao" | "0_7" | "8_30" | "31_60" | "61_90" | "90_plus";

export type DashboardProduct = {
  id: string;
  name: string;
  ean: string;
  centralQuantity: number;
  branchQuantity: number;
  totalQuantity: number;
  branchStocks: Array<{
    branchName: string;
    quantity: number;
  }>;
  lastMovementAt?: string;
  lastMovementType?: string;
  lastMovementSource?: string;
  daysStopped: number | null;
  status: DashboardProductStatus;
  agingBucket: DashboardAgingBucket;
  managementHint: string;
};

export type InventoryDashboard = {
  generatedAt: string;
  filters: {
    product?: string;
    minStoppedDays?: number;
    stoppedDaysTo?: number;
    onlyWithStock: boolean;
    stoppedThresholdDays: number;
    sortBy: "daysStopped" | "quantity" | "name";
    sortDir: "asc" | "desc";
    limit: number;
  };
  metrics: {
    totalProducts: number;
    stockedProducts: number;
    totalUnitsInStock: number;
    stoppedProducts: number;
    withoutMovementProducts: number;
    averageStoppedDays: number;
    oldestProduct: {
      id: string;
      name: string;
      daysStopped: number | null;
      totalQuantity: number;
    } | null;
  };
  agingBuckets: Record<DashboardAgingBucket, number>;
  products: DashboardProduct[];
};

export type EditableInvoiceProduct = InvoicePreviewProduct & {
  quantityInput: string;
};

export type BranchOption = {
  code: string;
  name: string;
};

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  createdBy?: string;
  photoUrl?: string;
  enabled: boolean;
  modules: AppModule[];
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = AuthCredentials & {
  name: string;
};

export type UpdateUserAccessPayload = {
  role?: UserRole;
  plan?: UserPlan;
  enabled?: boolean;
  modules?: AppModule[];
};

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  photoUrl?: string;
  currentPassword?: string;
  newPassword?: string;
};

export type CreateManagedUserPayload = RegisterCredentials & {
  role?: UserRole;
  plan?: UserPlan;
  modules?: AppModule[];
};

export type CertificateDocumentType = "CNPJ" | "CPF";
export type SefazEnvironment = "1" | "2";

export type OrganizationCertificate = {
  id: string;
  owner: string;
  documentType: CertificateDocumentType;
  documentNumber: string;
  cUFAutor?: string;
  ambiente: SefazEnvironment;
  originalFileName: string;
  certificateValidFrom?: string;
  certificateValidTo?: string;
  certificateSubject?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CertificateStatus = {
  configured: boolean;
  certificate: OrganizationCertificate | null;
};

export type UpsertCertificatePayload = {
  fileName?: string;
  fileBase64?: string;
  password?: string;
  documentType: CertificateDocumentType;
  documentNumber: string;
  cUFAutor?: string;
  ambiente: SefazEnvironment;
};
