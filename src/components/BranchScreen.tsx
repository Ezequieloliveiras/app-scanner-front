import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { BranchOption } from "../types/app";
import { BranchTransfer, BranchTransferStatus, Product } from "../types/product";
import { filterProducts, filterTransfers, formatDateTime, getTransferHistoryText, getTransferStatusLabel } from "../utils/appHelpers";
import { SelectorModal } from "./SelectorModal";

export function BranchScreen({
  products,
  transfers,
  selectedProductId,
  productSearch,
  branchOptions,
  sourceBranch,
  sourceBranchSearch,
  targetBranch,
  targetBranchSearch,
  quantity,
  lot,
  observation,
  loading,
  onSelectProduct,
  onChangeProductSearch,
  onSelectSourceBranch,
  onChangeSourceBranchSearch,
  onSelectTargetBranch,
  onChangeTargetBranchSearch,
  onChangeQuantity,
  onChangeLot,
  onChangeObservation,
  onCreateTransfer,
  onUpdateStatus,
  onCancelTransfer
}: {
  products: Product[];
  transfers: BranchTransfer[];
  selectedProductId: string;
  productSearch: string;
  branchOptions: BranchOption[];
  sourceBranch: BranchOption;
  sourceBranchSearch: string;
  targetBranch: BranchOption | null;
  targetBranchSearch: string;
  quantity: string;
  lot: string;
  observation: string;
  loading: boolean;
  onSelectProduct: (productId: string) => void;
  onChangeProductSearch: (value: string) => void;
  onSelectSourceBranch: (branch: BranchOption) => void;
  onChangeSourceBranchSearch: (value: string) => void;
  onSelectTargetBranch: (branch: BranchOption | null) => void;
  onChangeTargetBranchSearch: (value: string) => void;
  onChangeQuantity: (value: string) => void;
  onChangeLot: (value: string) => void;
  onChangeObservation: (value: string) => void;
  onCreateTransfer: () => void;
  onUpdateStatus: (id: string, status: Exclude<BranchTransferStatus, "reserved">) => void;
  onCancelTransfer: (id: string) => void;
}) {
  const [selectModal, setSelectModal] = useState<"product" | "source" | "target" | "filterSource" | "filterTarget" | null>(null);
  const [reserveExpanded, setReserveExpanded] = useState(true);
  const [movementsExpanded, setMovementsExpanded] = useState(true);
  const [movementIdSearch, setMovementIdSearch] = useState("");
  const [filterSourceBranch, setFilterSourceBranch] = useState<BranchOption | null>(null);
  const [filterTargetBranch, setFilterTargetBranch] = useState<BranchOption | null>(null);
  const [expandedTransferId, setExpandedTransferId] = useState<string | null>(null);

  const selectedProduct = products.find((product) => product._id === selectedProductId);
  const productResults = filterProducts(products, productSearch).slice(0, 6);
  const filteredTransfers = filterTransfers(transfers, movementIdSearch, filterSourceBranch, filterTargetBranch);
  const quantityNumber = Number(quantity.replace(",", "."));
  const canReserve = Boolean(selectedProduct && targetBranch && Number.isFinite(quantityNumber) && quantityNumber > 0 && !loading);
  const sourceLabel = sourceBranchSearch || `${sourceBranch.code} - ${sourceBranch.name}`;
  const targetLabel = targetBranchSearch || (targetBranch ? `${targetBranch.code} - ${targetBranch.name}` : "Selecionar");

  return (
    <KeyboardAvoidingView style={branchStyles.root} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={branchStyles.scroll}
        contentContainerStyle={branchStyles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        <View style={branchStyles.reserveSection}>
          <Pressable
            style={({ pressed }) => [branchStyles.sectionHeader, pressed && branchStyles.pressed]}
            onPress={() => setReserveExpanded((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={reserveExpanded ? "Fechar reserva de estoque" : "Abrir reserva de estoque"}
          >
            <View style={branchStyles.sectionTitleRow}>
              <Ionicons name="cube-outline" size={17} color="#2563eb" />
              <Text style={branchStyles.sectionTitle}>Reservar estoque para filial</Text>
            </View>
            <Ionicons name={reserveExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={18} color="#8aa0ba" />
          </Pressable>

          {reserveExpanded && (
            <View style={branchStyles.formBody}>
              <Text style={branchStyles.helperText}>Busque produto e filiais por nome ou código antes de reservar.</Text>

              <LabeledField label="Produto">
                <TextInput
                  value={productSearch}
                  onChangeText={(value) => {
                    onChangeProductSearch(value);
                    onSelectProduct("");
                  }}
                  placeholder="Buscar produto por nome ou EAN"
                  placeholderTextColor="#94a3b8"
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={branchStyles.textInput}
                  accessibilityLabel="Buscar produto"
                />
              </LabeledField>

              {!!productSearch.trim() && !selectedProduct && (
                <View style={branchStyles.optionList}>
                  {productResults.length === 0 ? (
                    <Text style={branchStyles.emptyText}>Nenhum produto encontrado.</Text>
                  ) : (
                    productResults.map((product) => (
                      <Pressable
                        key={product._id}
                        style={({ pressed }) => [branchStyles.optionItem, pressed && branchStyles.pressed]}
                        onPress={() => {
                          onSelectProduct(product._id);
                          onChangeProductSearch(`${product.name} - ${product.ean}`);
                        }}
                      >
                        <Text style={branchStyles.optionTitle}>{product.name}</Text>
                        <Text style={branchStyles.optionMeta}>EAN {product.ean} | Central: {product.quantity}</Text>
                      </Pressable>
                    ))
                  )}
                </View>
              )}

              <View style={branchStyles.twoColumnRow}>
                <LabeledField label="Filial origem" style={branchStyles.column}>
                  <BranchSelect
                    label={sourceLabel || "Selecionar"}
                    accessibilityLabel="Selecionar filial origem"
                    onPress={() => setSelectModal("source")}
                  />
                </LabeledField>

                <LabeledField label="Filial destino" style={branchStyles.column}>
                  <BranchSelect
                    label={targetLabel}
                    accessibilityLabel="Selecionar filial destino"
                    muted={!targetBranch && !targetBranchSearch}
                    onPress={() => setSelectModal("target")}
                  />
                </LabeledField>
              </View>

              <View style={branchStyles.twoColumnRow}>
                <LabeledField label="Quantidade" style={branchStyles.column}>
                  <TextInput
                    value={quantity}
                    onChangeText={onChangeQuantity}
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                    style={branchStyles.textInput}
                    accessibilityLabel="Quantidade"
                  />
                </LabeledField>

                <LabeledField label="Lote" style={branchStyles.column}>
                  <TextInput
                    value={lot}
                    onChangeText={onChangeLot}
                    placeholder="Opcional"
                    placeholderTextColor="#94a3b8"
                    returnKeyType="next"
                    style={branchStyles.textInput}
                    accessibilityLabel="Lote"
                  />
                </LabeledField>
              </View>

              <LabeledField label="Observação da reserva">
                <TextInput
                  value={observation}
                  onChangeText={onChangeObservation}
                  placeholder="Opcional"
                  placeholderTextColor="#94a3b8"
                  multiline
                  returnKeyType="done"
                  style={[branchStyles.textInput, branchStyles.observationInput]}
                  accessibilityLabel="Observação da reserva"
                />
              </LabeledField>

              <Pressable
                style={({ pressed }) => [
                  branchStyles.reserveButton,
                  !canReserve && branchStyles.reserveButtonDisabled,
                  pressed && canReserve && branchStyles.pressed
                ]}
                disabled={!canReserve}
                onPress={onCreateTransfer}
                accessibilityRole="button"
                accessibilityLabel="Reservar para filial"
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Ionicons name="git-branch-outline" size={17} color="#ffffff" />
                )}
                <Text style={branchStyles.reserveButtonText}>Reservar para filial</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={branchStyles.sectionBreak} />

        <View style={branchStyles.movementsSection}>
          <Pressable
            style={({ pressed }) => [branchStyles.movementHeader, pressed && branchStyles.pressed]}
            onPress={() => setMovementsExpanded((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={movementsExpanded ? "Fechar movimentações entre filiais" : "Abrir movimentações entre filiais"}
          >
            <View style={branchStyles.sectionTitleRow}>
              <Ionicons name="bus-outline" size={18} color="#071426" />
              <Text style={branchStyles.sectionTitle}>Movimentações entre filiais</Text>
            </View>
            <Ionicons name={movementsExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={18} color="#8aa0ba" />
          </Pressable>

          {movementsExpanded && (
            <View style={branchStyles.movementsBody}>
              <Text style={branchStyles.movementHelperText}>Acompanhe reservado, a caminho e entrada na filial.</Text>

              <View style={branchStyles.movementSearchBox}>
                <Ionicons name="search-outline" size={18} color="#94a3b8" />
                <TextInput
                  value={movementIdSearch}
                  onChangeText={setMovementIdSearch}
                  placeholder="Produto, EAN ou ID da movimentação"
                  placeholderTextColor="#94a3b8"
                  returnKeyType="search"
                  style={branchStyles.movementSearchInput}
                />
              </View>

              <View style={branchStyles.movementFilterRow}>
                  <BranchSelect
                    label={filterSourceBranch ? `${filterSourceBranch.code} - ${filterSourceBranch.name}` : "Todas as origens"}
                    style={branchStyles.movementFilterSelect}
                    onPress={() => setSelectModal("filterSource")}
                  />

                  <BranchSelect
                    label={filterTargetBranch ? `${filterTargetBranch.code} - ${filterTargetBranch.name}` : "Todos os destinos"}
                    style={branchStyles.movementFilterSelect}
                    onPress={() => setSelectModal("filterTarget")}
                  />
              </View>

              {(movementIdSearch || filterSourceBranch || filterTargetBranch) && (
                <Pressable
                  style={({ pressed }) => [branchStyles.clearFilterButton, pressed && branchStyles.pressed]}
                  onPress={() => {
                    setMovementIdSearch("");
                    setFilterSourceBranch(null);
                    setFilterTargetBranch(null);
                  }}
                >
                  <Ionicons name="close-outline" size={18} color="#475569" />
                  <Text style={branchStyles.clearFilterText}>Limpar filtros</Text>
                </Pressable>
              )}

              {filteredTransfers.length === 0 ? (
                <Text style={branchStyles.emptyText}>Nenhuma movimentação de filial ainda.</Text>
              ) : (
                filteredTransfers.map((transfer) => {
                  const isExpanded = expandedTransferId === transfer._id;

                  return (
                    <View key={transfer._id} style={branchStyles.transferCard}>
                      <View style={branchStyles.transferTopRow}>
                        <View style={branchStyles.transferTitleArea}>
                          <Text style={branchStyles.transferName}>{transfer.productName}</Text>
                          <View style={branchStyles.transferRouteRow}>
                            <Text style={[branchStyles.transferStatusBadge, getTransferStatusStyle(transfer.status)]}>
                            {getTransferStatusLabel(transfer.status)}
                            </Text>
                            <Text style={branchStyles.transferRoute} numberOfLines={1}>
                              {transfer.sourceBranch || "Estoque central"} <Text style={branchStyles.routeArrow}>→</Text> {transfer.targetBranch}
                            </Text>
                          </View>
                        </View>

                        <Pressable
                          style={branchStyles.transferRightArea}
                          onPress={() => setExpandedTransferId(isExpanded ? null : transfer._id)}
                          accessibilityLabel={isExpanded ? "Recolher movimentação" : "Expandir movimentação"}
                        >
                          <Text style={branchStyles.transferQuantity}>{transfer.quantity}</Text>
                          <Ionicons name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={18} color="#8aa0ba" />
                        </Pressable>
                      </View>

                      <View style={branchStyles.transferFooterRow}>
                        <Text style={branchStyles.meta}>Origem: {transfer.sourceBranch || "Estoque central"}</Text>
                        <Pressable
                          onPress={() => setExpandedTransferId(isExpanded ? null : transfer._id)}
                          accessibilityLabel={isExpanded ? "Recolher movimentação" : "Expandir movimentação"}
                        >
                          <Ionicons name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={22} color="#2563eb" />
                        </Pressable>
                      </View>

                      {isExpanded && (
                        <View style={branchStyles.transferExpanded}>
                          <View style={branchStyles.transferDetailGrid}>
                            <View style={branchStyles.transferDetailItem}>
                              <Text style={branchStyles.transferDetailLabel}>ID</Text>
                              <Text selectable style={branchStyles.transferDetailValue}>{transfer._id}</Text>
                            </View>

                            <View style={branchStyles.transferDetailItem}>
                              <Text style={branchStyles.transferDetailLabel}>EAN</Text>
                              <Text style={branchStyles.transferDetailValue}>{transfer.ean}</Text>
                            </View>

                            <View style={branchStyles.transferDetailItem}>
                              <Text style={branchStyles.transferDetailLabel}>Data</Text>
                              <Text style={branchStyles.transferDetailValue}>{formatTransferDate(transfer.createdAt)}</Text>
                            </View>

                            {transfer.lot && (
                              <View style={branchStyles.transferDetailItem}>
                                <Text style={branchStyles.transferDetailLabel}>Lote</Text>
                                <Text style={branchStyles.transferDetailValue}>{transfer.lot}</Text>
                              </View>
                            )}
                          </View>

                          {transfer.status === "reserved" && (
                            <View style={branchStyles.transferActionRow}>
                              <Pressable style={branchStyles.cancelOutlineButton} onPress={() => onCancelTransfer(transfer._id)}>
                                <Text style={branchStyles.cancelOutlineText}>Cancelar</Text>
                              </Pressable>

                              <Pressable style={branchStyles.transferPrimaryAction} onPress={() => onUpdateStatus(transfer._id, "in_transit")}>
                                <Ionicons name="navigate-circle-outline" size={16} color="#ffffff" />
                                <Text style={branchStyles.transferPrimaryActionText}>A caminho</Text>
                              </Pressable>
                            </View>
                          )}

                          {transfer.status === "in_transit" && (
                            <View style={branchStyles.transferActionRow}>
                              <Pressable style={branchStyles.cancelOutlineButton} onPress={() => onCancelTransfer(transfer._id)}>
                                <Text style={branchStyles.cancelOutlineText}>Cancelar</Text>
                              </Pressable>

                              <Pressable style={branchStyles.transferPrimaryAction} onPress={() => onUpdateStatus(transfer._id, "received")}>
                                <Ionicons name="checkmark-circle-outline" size={16} color="#ffffff" />
                                <Text style={branchStyles.transferPrimaryActionText}>Entrada na filial</Text>
                              </Pressable>
                            </View>
                          )}
                          <View style={branchStyles.expandedInfoGrid}>
                            <View style={branchStyles.expandedInfoCell}>
                              <Text style={branchStyles.expandedInfoLabel}>ID</Text>
                              <Text selectable style={branchStyles.expandedInfoValue}>{formatTransferShortId(transfer._id)}</Text>
                            </View>
                            <View style={branchStyles.expandedInfoCell}>
                              <Text style={branchStyles.expandedInfoLabel}>EAN</Text>
                              <Text selectable style={branchStyles.expandedInfoValue}>{transfer.ean}</Text>
                            </View>
                            <View style={branchStyles.expandedInfoCell}>
                              <Text style={branchStyles.expandedInfoLabel}>Data</Text>
                              <Text style={branchStyles.expandedInfoValue}>{formatTransferDate(transfer.createdAt)}</Text>
                            </View>
                          </View>

                          {transfer.status !== "received" && transfer.status !== "cancelled" && (
                            <View style={branchStyles.expandedActions}>
                              <Pressable style={branchStyles.expandedCancelButton} onPress={() => onCancelTransfer(transfer._id)}>
                                <Text style={branchStyles.expandedCancelText}>Cancelar</Text>
                              </Pressable>

                              <Pressable
                                style={branchStyles.expandedPrimaryButton}
                                onPress={() => onUpdateStatus(transfer._id, transfer.status === "reserved" ? "in_transit" : "received")}
                              >
                                <Ionicons name="checkmark-circle-outline" size={15} color="#ffffff" />
                                <Text style={branchStyles.expandedPrimaryText}>
                                  {transfer.status === "reserved" ? "Produto a caminho" : "Entrada na filial"}
                                </Text>
                              </Pressable>
                            </View>
                          )}

                          <View style={branchStyles.transferIdRow}>
                            <Text style={branchStyles.transferIdLabel}>ID:</Text>
                            <Text selectable style={branchStyles.transferIdValue}>{transfer._id}</Text>
                          </View>

                          <Text style={branchStyles.meta}>EAN: {transfer.ean}</Text>
                          {transfer.lot && <Text style={branchStyles.meta}>Lote: {transfer.lot}</Text>}

                          {transfer.history?.map((item, index) => (
                            <Text key={`${item.status}-${index}`} style={branchStyles.transferHistory}>
                              {getTransferHistoryText(transfer, item)} - {formatDateTime(item.createdAt)}
                            </Text>
                          ))}

                          {transfer.status === "reserved" && (
                            <View style={branchStyles.transferActions}>
                              <Pressable style={branchStyles.secondaryButton} onPress={() => onUpdateStatus(transfer._id, "in_transit")}>
                                <Ionicons name="car-outline" size={18} color="#2563eb" />
                                <Text style={branchStyles.secondaryButtonText}>Produto a caminho</Text>
                              </Pressable>

                              <Pressable style={branchStyles.cancelButton} onPress={() => onCancelTransfer(transfer._id)}>
                                <Ionicons name="close-circle-outline" size={18} color="#991b1b" />
                                <Text style={branchStyles.cancelButtonText}>Cancelar movimentação</Text>
                              </Pressable>
                            </View>
                          )}

                          {transfer.status === "in_transit" && (
                            <View style={branchStyles.transferActions}>
                              <Pressable style={branchStyles.primaryButton} onPress={() => onUpdateStatus(transfer._id, "received")}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
                                <Text style={branchStyles.primaryButtonText}>Dar entrada na filial</Text>
                              </Pressable>

                              <Pressable style={branchStyles.cancelButton} onPress={() => onCancelTransfer(transfer._id)}>
                                <Ionicons name="close-circle-outline" size={18} color="#991b1b" />
                                <Text style={branchStyles.cancelButtonText}>Cancelar movimentação</Text>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          )}
        </View>

        <View style={branchStyles.emptyFill} />

        <SelectorModal visible={selectModal === "product"} title="Selecionar produto" onClose={() => setSelectModal(null)}>
          {products.map((product) => (
            <Pressable
              key={product._id}
              style={branchStyles.selectorItem}
              onPress={() => {
                onSelectProduct(product._id);
                onChangeProductSearch(`${product.name} - ${product.ean}`);
                setSelectModal(null);
              }}
            >
              <Text style={branchStyles.optionTitle}>{product.name}</Text>
              <Text style={branchStyles.optionMeta}>EAN {product.ean} | Central: {product.quantity}</Text>
            </Pressable>
          ))}
        </SelectorModal>

        <SelectorModal visible={selectModal === "source"} title="Selecionar origem" onClose={() => setSelectModal(null)}>
          {branchOptions
            .filter((branch) => branch.code !== targetBranch?.code)
            .map((branch) => (
              <Pressable
                key={branch.code}
                style={branchStyles.selectorItem}
                onPress={() => {
                  onSelectSourceBranch(branch);
                  onChangeSourceBranchSearch("");
                  setSelectModal(null);
                }}
              >
                <Text style={branchStyles.optionTitle}>{branch.name}</Text>
                <Text style={branchStyles.optionMeta}>Código: {branch.code}</Text>
              </Pressable>
            ))}
        </SelectorModal>

        <SelectorModal visible={selectModal === "target"} title="Selecionar destino" onClose={() => setSelectModal(null)}>
          {branchOptions
            .filter((branch) => branch.code !== sourceBranch.code)
            .map((branch) => (
              <Pressable
                key={branch.code}
                style={branchStyles.selectorItem}
                onPress={() => {
                  onSelectTargetBranch(branch);
                  onChangeTargetBranchSearch("");
                  setSelectModal(null);
                }}
              >
                <Text style={branchStyles.optionTitle}>{branch.name}</Text>
                <Text style={branchStyles.optionMeta}>Código: {branch.code}</Text>
              </Pressable>
            ))}
        </SelectorModal>

        <SelectorModal visible={selectModal === "filterSource"} title="Filtrar origem" onClose={() => setSelectModal(null)}>
          <Pressable
            style={branchStyles.selectorItem}
            onPress={() => {
              setFilterSourceBranch(null);
              setSelectModal(null);
            }}
          >
            <Text style={branchStyles.optionTitle}>Todas as origens</Text>
            <Text style={branchStyles.optionMeta}>Remover filtro de origem</Text>
          </Pressable>
          {branchOptions.map((branch) => (
            <Pressable
              key={branch.code}
              style={branchStyles.selectorItem}
              onPress={() => {
                setFilterSourceBranch(branch);
                setSelectModal(null);
              }}
            >
              <Text style={branchStyles.optionTitle}>{branch.name}</Text>
              <Text style={branchStyles.optionMeta}>Código: {branch.code}</Text>
            </Pressable>
          ))}
        </SelectorModal>

        <SelectorModal visible={selectModal === "filterTarget"} title="Filtrar destino" onClose={() => setSelectModal(null)}>
          <Pressable
            style={branchStyles.selectorItem}
            onPress={() => {
              setFilterTargetBranch(null);
              setSelectModal(null);
            }}
          >
            <Text style={branchStyles.optionTitle}>Todos os destinos</Text>
            <Text style={branchStyles.optionMeta}>Remover filtro de destino</Text>
          </Pressable>
          {branchOptions.map((branch) => (
            <Pressable
              key={branch.code}
              style={branchStyles.selectorItem}
              onPress={() => {
                setFilterTargetBranch(branch);
                setSelectModal(null);
              }}
            >
              <Text style={branchStyles.optionTitle}>{branch.name}</Text>
              <Text style={branchStyles.optionMeta}>Código: {branch.code}</Text>
            </Pressable>
          ))}
        </SelectorModal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function LabeledField({
  label,
  children,
  style
}: {
  label: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[branchStyles.fieldGroup, style]}>
      <Text style={branchStyles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function BranchSelect({
  label,
  muted = false,
  accessibilityLabel,
  style,
  onPress
}: {
  label: string;
  muted?: boolean;
  accessibilityLabel?: string;
  style?: object;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [branchStyles.selectField, style, pressed && branchStyles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={[branchStyles.selectText, muted && branchStyles.placeholderText]} numberOfLines={1}>{label}</Text>
      <Ionicons name="chevron-down-outline" size={18} color="#071426" />
    </Pressable>
  );
}

function formatTransferShortId(id: string) {
  return id.length > 7 ? `TRF-${id.slice(-3).toUpperCase()}` : id;
}

function formatTransferDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 10);
}

function getTransferStatusStyle(status: BranchTransferStatus) {
  if (status === "cancelled") return branchStyles.transferStatusCancelled;
  if (status === "received") return branchStyles.transferStatusReceived;
  if (status === "in_transit") return branchStyles.transferStatusInTransit;
  return branchStyles.transferStatusReserved;
}

const branchStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  scroll: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  content: {
    flexGrow: 1,
    backgroundColor: "#f7f9fc"
  },
  reserveSection: {
    backgroundColor: "#ffffff"
  },
  sectionHeader: {
    minHeight: 42,
    paddingHorizontal: 13,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "#ffffff"
  },
  sectionTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  sectionTitle: {
    flex: 1,
    color: "#020617",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900"
  },
  formBody: {
    gap: 12,
    paddingHorizontal: 13,
    paddingBottom: 13,
    backgroundColor: "#ffffff"
  },
  helperText: {
    marginTop: 1,
    marginBottom: 1,
    color: "#64748b",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500"
  },
  fieldGroup: {
    gap: 6
  },
  fieldLabel: {
    color: "#020617",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500"
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 10
  },
  column: {
    flex: 1,
    minWidth: 0
  },
  textInput: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 0,
    color: "#020617",
    backgroundColor: "#ffffff",
    fontSize: 14,
    fontWeight: "500"
  },
  observationInput: {
    minHeight: 61,
    paddingTop: 11,
    paddingBottom: 9,
    textAlignVertical: "top"
  },
  selectField: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 8,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: "#ffffff"
  },
  selectText: {
    flex: 1,
    minWidth: 0,
    color: "#020617",
    fontSize: 13,
    fontWeight: "500"
  },
  placeholderText: {
    color: "#020617"
  },
  reserveButton: {
    marginTop: 3,
    minHeight: 44,
    borderRadius: 7,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 1
  },
  reserveButtonDisabled: {
    backgroundColor: "#88a9ef"
  },
  reserveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  sectionBreak: {
    height: 12,
    borderTopWidth: 1,
    borderTopColor: "#edf2f7",
    backgroundColor: "#f7f9fc"
  },
  movementsSection: {
    backgroundColor: "#ffffff"
  },
  movementHeader: {
    minHeight: 49,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5edf6",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "#ffffff"
  },
  movementsBody: {
    gap: 10,
    paddingHorizontal: 13,
    paddingTop: 13,
    paddingBottom: 14,
    backgroundColor: "#ffffff"
  },
  movementHelperText: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500"
  },
  movementSearchBox: {
    minHeight: 39,
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 9,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff"
  },
  movementSearchInput: {
    flex: 1,
    minHeight: 37,
    paddingVertical: 0,
    color: "#020617",
    fontSize: 13,
    fontWeight: "500"
  },
  movementFilterRow: {
    flexDirection: "row",
    gap: 9
  },
  movementFilterSelect: {
    flex: 1,
    minHeight: 32,
    borderRadius: 7,
    paddingHorizontal: 12
  },
  emptyFill: {
    flexGrow: 1,
    minHeight: 52,
    backgroundColor: "#f7f9fc"
  },
  optionList: {
    gap: 7
  },
  optionItem: {
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: "#f8fafc"
  },
  selectorItem: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f8fafc"
  },
  optionTitle: {
    color: "#020617",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  optionMeta: {
    marginTop: 3,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700"
  },
  emptyText: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600"
  },
  clearFilterButton: {
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#e2e8f0"
  },
  clearFilterText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "900"
  },
  transferCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.035,
    shadowRadius: 9,
    elevation: 1
  },
  transferTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  transferTitleArea: {
    flex: 1,
    minWidth: 0,
    gap: 5
  },
  transferName: {
    color: "#020617",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  transferRouteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  transferRoute: {
    flex: 1,
    minWidth: 0,
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600"
  },
  routeArrow: {
    color: "#94a3b8",
    fontWeight: "900"
  },
  transferRightArea: {
    minWidth: 56,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6
  },
  transferQuantity: {
    textAlign: "right",
    color: "#020617",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900"
  },
  transferFooterRow: {
    display: "none",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  meta: {
    display: "none",
    flex: 1,
    color: "#64748b",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
  },
  transferExpanded: {
    marginTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#edf2f7",
    paddingTop: 11,
    gap: 12
  },
  transferDetailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10
  },
  transferDetailItem: {
    width: "50%",
    gap: 3
  },
  transferDetailLabel: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700"
  },
  transferDetailValue: {
    color: "#020617",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  transferActionRow: {
    flexDirection: "row",
    gap: 10
  },
  cancelOutlineButton: {
    flex: 1,
    minHeight: 32,
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff"
  },
  cancelOutlineText: {
    color: "#020617",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  transferPrimaryAction: {
    flex: 1,
    minHeight: 32,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 9,
    elevation: 2
  },
  transferPrimaryActionText: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  expandedInfoGrid: {
    display: "none",
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10
  },
  expandedInfoCell: {
    width: "50%",
    gap: 3
  },
  expandedInfoLabel: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700"
  },
  expandedInfoValue: {
    color: "#020617",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  expandedActions: {
    display: "none",
    flexDirection: "row",
    gap: 10
  },
  expandedCancelButton: {
    flex: 1,
    minHeight: 32,
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff"
  },
  expandedCancelText: {
    color: "#020617",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  expandedPrimaryButton: {
    flex: 1,
    minHeight: 32,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 9,
    elevation: 2
  },
  expandedPrimaryText: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  transferIdRow: {
    display: "none",
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#e2e8f0"
  },
  transferIdLabel: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "900"
  },
  transferIdValue: {
    flexShrink: 1,
    color: "#334155",
    fontSize: 12,
    fontWeight: "800"
  },
  transferStatusBadge: {
    alignSelf: "flex-start",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    overflow: "hidden",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900"
  },
  transferStatusReserved: {
    color: "#2563eb",
    backgroundColor: "#dbeafe"
  },
  transferStatusInTransit: {
    color: "#b45309",
    backgroundColor: "#fff4d6"
  },
  transferStatusReceived: {
    color: "#059669",
    backgroundColor: "#dcfce7"
  },
  transferStatusCancelled: {
    color: "#991b1b",
    backgroundColor: "#fee2e2"
  },
  transferHistory: {
    display: "none",
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
    paddingLeft: 8,
    color: "#475569",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  transferActions: {
    display: "none",
    gap: 8
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563eb"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900"
  },
  secondaryButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f8fafc"
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "900"
  },
  cancelButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fee2e2"
  },
  cancelButtonText: {
    color: "#991b1b",
    fontSize: 14,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.82
  }
});
