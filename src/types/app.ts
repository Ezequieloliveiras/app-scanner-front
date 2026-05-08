import { InvoicePreviewProduct } from "./product";

export type Screen = "home" | "scan" | "products" | "branches";

export type EditableInvoiceProduct = InvoicePreviewProduct & {
  quantityInput: string;
};

export type BranchOption = {
  code: string;
  name: string;
};