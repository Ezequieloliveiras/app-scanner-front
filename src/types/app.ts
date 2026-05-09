import { InvoicePreviewProduct } from "./product";

export type Screen =
  | "home"
  | "scan"
  | "products"
  | "branches"
  | "stock_requests"
  | "access"
  | "profile"
  | "notifications";
export type AuthMode = "login" | "register" | "reset";
export type UserRole = "main" | "master" | "default";
export type UserPlan = "basic" | "premium" | "pro";
export type AppModule = "scan" | "products" | "branches" | "stock_requests" | "access";

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
