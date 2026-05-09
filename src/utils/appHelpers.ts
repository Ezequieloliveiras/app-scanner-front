import { BranchTransfer, BranchTransferStatus, InvoiceResult, Product } from "../types/product";
import { AppModule, AuthUser, BranchOption, Screen } from "../types/app";

export const MODULE_LABELS: Record<AppModule, string> = {
  scan: "Scanner",
  products: "Produtos",
  branches: "Filial",
  access: "Acessos"
};

export const APP_MODULES: AppModule[] = ["scan", "products", "branches", "access"];

export const PLAN_LABELS = {
  basic: "Basic",
  premium: "Premium",
  pro: "Pro"
} as const;

export const PLAN_LIMITS = {
  basic: 3,
  premium: 10,
  pro: 30
} as const;

export function canManageAccess(user: AuthUser | null) {
  return user?.role === "main" || user?.role === "master";
}

export function canAccessModule(user: AuthUser | null, module: AppModule) {
  if (!user?.enabled) return false;
  if (user.role === "main" || user.role === "master") return true;
  return user.modules.includes(module);
}

export function getScreenTitle(screen: Screen, pendingInvoice: InvoiceResult | null) {
  if (screen === "scan") return "Escanear nota";
  if (screen === "branches") return "Filial";
  if (screen === "access") return "Acessos";
  if (screen === "profile") return "Perfil";
  if (screen === "notifications") return "Notificações";
  if (screen === "products") return "Produtos";
  return "Início";
}

export function getTransferStatusLabel(status: BranchTransferStatus) {
  if (status === "reserved") return "Reservado";
  if (status === "in_transit") return "A caminho";
  if (status === "cancelled") return "Cancelada";
  return "Entrada na filial";
}

export function getTransferHistoryText(transfer: BranchTransfer, item: { status: BranchTransferStatus; observation?: string }) {
  if (item.status === "reserved") {
    return item.observation || `Produto reservado para a filial ${transfer.targetBranch}`;
  }

  if (item.status === "cancelled") {
    return item.observation || `Movimentação cancelada. Estoque devolvido para ${transfer.sourceBranch}.`;
  }

  return item.observation || getTransferStatusLabel(item.status);
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sem horário";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function filterProducts(products: Product[], query: string) {
  const normalizedQuery = normalizeSearch(query);

  if (!normalizedQuery) {
    return [];
  }

  return products.filter((product) =>
    normalizeSearch(`${product.name} ${product.ean}`).includes(normalizedQuery)
  );
}

export function filterBranches(branches: BranchOption[], query: string) {
  const normalizedQuery = normalizeSearch(query);

  if (!normalizedQuery) {
    return [];
  }

  return branches.filter((branch) =>
    normalizeSearch(`${branch.code} ${branch.name}`).includes(normalizedQuery)
  );
}

export function filterTransfers(
  transfers: BranchTransfer[],
  movementId: string,
  sourceBranch: BranchOption | null,
  targetBranch: BranchOption | null
) {
  const normalizedId = normalizeSearch(movementId);

  return transfers.filter((transfer) => {
    const matchesId = normalizedId ? normalizeSearch(transfer._id).includes(normalizedId) : true;
    const matchesSource = sourceBranch
      ? transfer.sourceBranchCode === sourceBranch.code || transfer.sourceBranch === sourceBranch.name
      : true;
    const matchesTarget = targetBranch
      ? transfer.targetBranchCode === targetBranch.code || transfer.targetBranch === targetBranch.name
      : true;

    return matchesId && matchesSource && matchesTarget;
  });
}

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

export function parseQuantity(value: string) {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
