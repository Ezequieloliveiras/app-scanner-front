import { InvoicePreviewProduct } from "./product";

export type Screen =
  | "home"
  | "scan"
  | "products"
  | "branches"
  | "stock_requests"
  | "access"
  | "billing"
  | "profile"
  | "notifications";
export type AuthMode = "login" | "register" | "reset";
export type UserRole = "main" | "master" | "default";
export type UserPlan = "free" | "basic" | "premium" | "pro" | "custom";
export type AppModule = "scan" | "products" | "branches" | "stock_requests" | "access";

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
