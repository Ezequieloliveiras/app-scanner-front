import { BranchTransfer, BranchTransferStatus, InvoiceResult, Product } from "../types/product";
import { BranchOption, Screen } from "../types/app";
export function getScreenTitle(screen: Screen, pendingInvoice: InvoiceResult | null) {
  if (screen === "scan") return "Scannear nota";
  if (screen === "branches") return "Filial";
  if (screen === "products" && pendingInvoice) return "Revisar entrada";
  if (screen === "products") return "Produtos";
  return "Home";
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
    return item.observation || `Movimentacao cancelada. Estoque devolvido para ${transfer.sourceBranch}.`;
  }

  return item.observation || getTransferStatusLabel(item.status);
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sem horario";
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
