import { Ionicons } from "@expo/vector-icons";
import { useState, type ComponentProps } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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
  canManageBranches,
  onSelectProduct,
  onChangeProductSearch,
  onSelectSourceBranch,
  onChangeSourceBranchSearch,
  onSelectTargetBranch,
  onChangeTargetBranchSearch,
  onChangeQuantity,
  onChangeLot,
  onChangeObservation,
  onCreateBranch,
  onUpdateBranch,
  onDeleteBranch,
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
  canManageBranches: boolean;
  onSelectProduct: (productId: string) => void;
  onChangeProductSearch: (value: string) => void;
  onSelectSourceBranch: (branch: BranchOption) => void;
  onChangeSourceBranchSearch: (value: string) => void;
  onSelectTargetBranch: (branch: BranchOption | null) => void;
  onChangeTargetBranchSearch: (value: string) => void;
  onChangeQuantity: (value: string) => void;
  onChangeLot: (value: string) => void;
  onChangeObservation: (value: string) => void;
  onCreateBranch: (branch: BranchOption) => Promise<void>;
  onUpdateBranch: (branch: BranchOption, nextBranch: BranchOption) => Promise<void>;
  onDeleteBranch: (branch: BranchOption) => Promise<void>;
  onCreateTransfer: () => void;
  onUpdateStatus: (id: string, status: Exclude<BranchTransferStatus, "reserved">) => void;
  onCancelTransfer: (id: string) => void;
}) {
  const [selectModal, setSelectModal] = useState<"product" | "source" | "target" | "filterSource" | "filterTarget" | "createBranch" | null>(null);
  const [reserveExpanded, setReserveExpanded] = useState(false);
  const [managementExpanded, setManagementExpanded] = useState(false);
  const [movementsExpanded, setMovementsExpanded] = useState(false);
  const [movementIdSearch, setMovementIdSearch] = useState("");
  const [filterSourceBranch, setFilterSourceBranch] = useState<BranchOption | null>(null);
  const [filterTargetBranch, setFilterTargetBranch] = useState<BranchOption | null>(null);
  const [expandedTransferId, setExpandedTransferId] = useState<string | null>(null);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCode, setNewBranchCode] = useState("");
  const [branchFormError, setBranchFormError] = useState<string | null>(null);
  const [editingBranch, setEditingBranch] = useState<BranchOption | null>(null);

  const selectedProduct = products.find((product) => product._id === selectedProductId);
  const productResults = filterProducts(products, productSearch).slice(0, 6);
  const filteredTransfers = filterTransfers(transfers, movementIdSearch, filterSourceBranch, filterTargetBranch);
  const quantityNumber = Number(quantity.replace(",", "."));
  const canReserve = Boolean(selectedProduct && targetBranch && Number.isFinite(quantityNumber) && quantityNumber > 0 && !loading);
  const sourceLabel = sourceBranchSearch || `${sourceBranch.code} - ${sourceBranch.name}`;
  const targetLabel = targetBranchSearch || (targetBranch ? `${targetBranch.code} - ${targetBranch.name}` : "Selecionar");
  const manageableBranches = branchOptions.filter((branch) => branch.code !== "CENTRAL");
  const registeredBranchCount = manageableBranches.length;
  const branchPreviewName = newBranchName.trim() || "Nome da filial";
  const branchPreviewCode = normalizeBranchCode(newBranchCode || newBranchName) || "CODIGO";

  function openCreateBranch() {
    if (!canManageBranches) return;
    setEditingBranch(null);
    setNewBranchName("");
    setNewBranchCode("");
    setBranchFormError(null);
    setSelectModal("createBranch");
  }

  function openEditBranch(branch: BranchOption) {
    if (!canManageBranches) return;
    setEditingBranch(branch);
    setNewBranchName(branch.name);
    setNewBranchCode(branch.code);
    setBranchFormError(null);
    setSelectModal("createBranch");
  }

  function closeBranchForm() {
    setEditingBranch(null);
    setNewBranchName("");
    setNewBranchCode("");
    setBranchFormError(null);
    setSelectModal(null);
  }

  async function submitNewBranch() {
    if (!canManageBranches) return;

    const name = newBranchName.trim();
    const code = normalizeBranchCode(newBranchCode || name);
    const duplicated = branchOptions.some(
      (branch) =>
        branch.code !== editingBranch?.code &&
        (normalizeBranchCode(branch.code) === code || normalizeBranchName(branch.name) === normalizeBranchName(name))
    );

    if (name.length < 2) {
      setBranchFormError("Informe o nome da filial.");
      return;
    }

    if (code.length < 2) {
      setBranchFormError("Informe um codigo valido.");
      return;
    }

    if (duplicated) {
      setBranchFormError("Ja existe uma filial com esse nome ou codigo.");
      return;
    }

    const branch = { code, name };
    try {
      if (editingBranch) {
        await onUpdateBranch(editingBranch, branch);
      } else {
        await onCreateBranch(branch);
        onSelectTargetBranch(branch);
        onChangeTargetBranchSearch("");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel salvar a filial.";
      setBranchFormError(message);
      return;
    }

    setEditingBranch(null);
    setNewBranchName("");
    setNewBranchCode("");
    setBranchFormError(null);
    setSelectModal(null);
  }

  function confirmDeleteBranch(branch: BranchOption) {
    if (!canManageBranches) return;

    Alert.alert(
      "Excluir filial?",
      `A filial ${branch.name} saira das proximas movimentacoes. Historico ja criado continua aparecendo nas movimentacoes.`,
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            onDeleteBranch(branch).catch((err) => {
              const message = err instanceof Error ? err.message : "Nao foi possivel excluir a filial.";
              setBranchFormError(message);
            });
          }
        }
      ]
    );
  }

  return (
    <KeyboardAvoidingView style={branchStyles.root} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={branchStyles.scroll}
        contentContainerStyle={branchStyles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        <View style={branchStyles.reserveSection}>
          <AccordionHeader
            title="Reservar estoque para filial"
            subtitle="Produto, origem, destino e quantidade"
            icon="cube-outline"
            expanded={reserveExpanded}
            onPress={() => setReserveExpanded((current) => !current)}
            accessibilityLabel={reserveExpanded ? "Fechar reserva de estoque" : "Abrir reserva de estoque"}
          />

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

        {canManageBranches && (
          <>
            <View style={branchStyles.sectionBreak} />

            <View style={branchStyles.managementSection}>
              <AccordionHeader
                title="Gerenciar filiais"
                subtitle={`${registeredBranchCount} ${registeredBranchCount === 1 ? "filial cadastrada" : "filiais cadastradas"}`}
                icon="business-outline"
                expanded={managementExpanded}
                onPress={() => setManagementExpanded((current) => !current)}
                accessibilityLabel={managementExpanded ? "Fechar gerenciamento de filiais" : "Abrir gerenciamento de filiais"}
              />

              {managementExpanded && (
                <View style={branchStyles.managementBody}>
                  <View style={branchStyles.managementIntroRow}>
                    <View style={branchStyles.branchManagerTextArea}>
                      <Text style={branchStyles.branchManagerTitle}>Filiais cadastradas</Text>
                      <Text style={branchStyles.branchManagerMeta}>
                        {registeredBranchCount} {registeredBranchCount === 1 ? "filial disponivel" : "filiais disponiveis"} para movimentacao.
                      </Text>
                    </View>

                    <Pressable
                      style={({ pressed }) => [branchStyles.addBranchButton, loading && branchStyles.actionDisabled, pressed && !loading && branchStyles.pressed]}
                      onPress={openCreateBranch}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityLabel="Criar nova filial"
                      accessibilityState={{ disabled: loading }}
                    >
                      <Ionicons name="add-circle-outline" size={17} color="#2563eb" />
                      <Text style={branchStyles.addBranchButtonText}>Nova filial</Text>
                    </Pressable>
                  </View>

                  {manageableBranches.length === 0 ? (
                    <Text style={branchStyles.emptyText}>Nenhuma filial cadastrada.</Text>
                  ) : (
                    manageableBranches.map((branch) => (
                      <View key={branch.code} style={branchStyles.branchManagementItem}>
                        <View style={branchStyles.branchManagementTextArea}>
                          <Text style={branchStyles.optionTitle}>{branch.name}</Text>
                          <Text style={branchStyles.optionMeta}>Código: {branch.code}</Text>
                        </View>

                        <View style={branchStyles.branchActionRow}>
                          <Pressable
                            style={({ pressed }) => [branchStyles.iconActionButton, loading && branchStyles.actionDisabled, pressed && !loading && branchStyles.pressed]}
                            onPress={() => openEditBranch(branch)}
                            disabled={loading}
                            accessibilityRole="button"
                            accessibilityLabel={`Editar filial ${branch.name}`}
                            accessibilityState={{ disabled: loading }}
                          >
                            <Ionicons name="create-outline" size={18} color="#2563eb" />
                          </Pressable>

                          <Pressable
                            style={({ pressed }) => [branchStyles.iconDangerButton, loading && branchStyles.actionDisabled, pressed && !loading && branchStyles.pressed]}
                            onPress={() => confirmDeleteBranch(branch)}
                            disabled={loading}
                            accessibilityRole="button"
                            accessibilityLabel={`Excluir filial ${branch.name}`}
                            accessibilityState={{ disabled: loading }}
                          >
                            <Ionicons name="trash-outline" size={18} color="#991b1b" />
                          </Pressable>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          </>
        )}

        <View style={branchStyles.sectionBreak} />

        <View style={branchStyles.movementsSection}>
          <Pressable
            style={({ pressed }) => [branchStyles.movementHeader, movementsExpanded && branchStyles.sectionHeaderActive, pressed && branchStyles.pressed]}
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

        <SelectorModal
          visible={selectModal === "createBranch"}
          title={editingBranch ? "Editar filial" : "Nova filial"}
          subtitle="Informe nome e código para usar nas movimentações."
          onClose={closeBranchForm}
        >
          <View style={branchStyles.createBranchForm}>
            <View style={branchStyles.branchPreviewCard}>
              <View style={branchStyles.branchPreviewIcon}>
                <Ionicons name="business-outline" size={19} color="#2563eb" />
              </View>
              <View style={branchStyles.branchPreviewTextArea}>
                <Text style={branchStyles.branchPreviewName} numberOfLines={1}>{branchPreviewName}</Text>
                <Text style={branchStyles.branchPreviewCode} numberOfLines={1}>Código: {branchPreviewCode}</Text>
              </View>
            </View>

            <BranchFormInput
              label="Nome da filial"
              icon="storefront-outline"
              value={newBranchName}
              onChangeText={(value) => {
                setNewBranchName(value);
                if (!newBranchCode.trim()) {
                  setNewBranchCode(normalizeBranchCode(value));
                }
                setBranchFormError(null);
              }}
              placeholder="Ex: Filial Praia do Canto"
              accessibilityLabel="Nome da filial"
            />

            <BranchFormInput
              label="Código"
              icon="barcode-outline"
              value={newBranchCode}
              onChangeText={(value) => {
                setNewBranchCode(normalizeBranchCode(value));
                setBranchFormError(null);
              }}
              placeholder="Ex: FILIAL-PRAIA"
              autoCapitalize="characters"
              autoCorrect={false}
              accessibilityLabel="Código da filial"
            />

            {branchFormError && <Text style={branchStyles.formErrorText}>{branchFormError}</Text>}

            <Pressable
              style={({ pressed }) => [branchStyles.createBranchButton, loading && branchStyles.createBranchButtonDisabled, pressed && !loading && branchStyles.pressed]}
              onPress={submitNewBranch}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Salvar filial"
              accessibilityState={{ disabled: loading }}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={17} color="#ffffff" />
              )}
              <Text style={branchStyles.createBranchButtonText}>{loading ? "Salvando..." : editingBranch ? "Salvar alterações" : "Salvar filial"}</Text>
            </Pressable>
          </View>
        </SelectorModal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AccordionHeader({
  title,
  subtitle,
  icon,
  expanded,
  accessibilityLabel,
  onPress
}: {
  title: string;
  subtitle: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  expanded: boolean;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [branchStyles.sectionHeader, expanded && branchStyles.sectionHeaderActive, pressed && branchStyles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ expanded }}
    >
      <View style={branchStyles.headerIconBadge}>
        <Ionicons name={icon} size={17} color="#2563eb" />
      </View>

      <View style={branchStyles.headerTextArea}>
        <Text style={branchStyles.sectionTitle} numberOfLines={1}>{title}</Text>
        <Text style={branchStyles.sectionSubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>

      <View style={[branchStyles.chevronBadge, expanded && branchStyles.chevronBadgeActive]}>
        <Ionicons name={expanded ? "chevron-up-outline" : "chevron-down-outline"} size={17} color={expanded ? "#2563eb" : "#64748b"} />
      </View>
    </Pressable>
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

function BranchFormInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  autoCapitalize = "sentences",
  autoCorrect = true
}: {
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  autoCapitalize?: ComponentProps<typeof TextInput>["autoCapitalize"];
  autoCorrect?: boolean;
}) {
  return (
    <View style={branchStyles.branchFormField}>
      <Text style={branchStyles.branchFormLabel}>{label}</Text>
      <View style={branchStyles.branchFormInputShell}>
        <View style={branchStyles.branchFormInputIcon}>
          <Ionicons name={icon} size={17} color="#64748b" />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          returnKeyType="next"
          style={branchStyles.branchFormInput}
          accessibilityLabel={accessibilityLabel}
        />
      </View>
    </View>
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

function normalizeBranchCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
}

function normalizeBranchName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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
    backgroundColor: "#f7f9fc"
  },
  sectionHeader: {
    minHeight: 64,
    marginHorizontal: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#dfe7f2",
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1
  },
  sectionHeaderActive: {
    borderColor: "#bfdbfe",
    backgroundColor: "#f8fbff"
  },
  headerIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff"
  },
  headerTextArea: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  sectionTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  sectionTitle: {
    color: "#020617",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  sectionSubtitle: {
    color: "#64748b",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600"
  },
  chevronBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9"
  },
  chevronBadgeActive: {
    backgroundColor: "#dbeafe"
  },
  formBody: {
    gap: 12,
    marginHorizontal: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#dfe7f2",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingTop: 13,
    paddingBottom: 13,
    backgroundColor: "#ffffff"
  },
  branchManagerTextArea: {
    flex: 1,
    minWidth: 0
  },
  branchManagerTitle: {
    color: "#020617",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900"
  },
  branchManagerMeta: {
    marginTop: 2,
    color: "#64748b",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600"
  },
  addBranchButton: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 7,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#eff6ff"
  },
  addBranchButtonText: {
    color: "#2563eb",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  actionDisabled: {
    opacity: 0.55
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
    height: 2,
    backgroundColor: "#f7f9fc"
  },
  movementsSection: {
    backgroundColor: "#f7f9fc"
  },
  managementSection: {
    backgroundColor: "#f7f9fc"
  },
  movementHeader: {
    minHeight: 64,
    marginHorizontal: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#dfe7f2",
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1
  },
  movementsBody: {
    gap: 10,
    marginHorizontal: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#dfe7f2",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingTop: 13,
    paddingBottom: 14,
    backgroundColor: "#ffffff"
  },
  managementBody: {
    gap: 10,
    marginHorizontal: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#dfe7f2",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingTop: 13,
    paddingBottom: 14,
    backgroundColor: "#ffffff"
  },
  managementIntroRow: {
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "#f8fafc"
  },
  branchManagementItem: {
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "#ffffff"
  },
  branchManagementTextArea: {
    flex: 1,
    minWidth: 0
  },
  branchActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  iconActionButton: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff"
  },
  iconDangerButton: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2"
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
  createBranchForm: {
    width: "100%",
    gap: 16,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 8
  },
  branchPreviewCard: {
    minHeight: 74,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#eff6ff"
  },
  branchPreviewIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff"
  },
  branchPreviewTextArea: {
    flex: 1,
    minWidth: 0
  },
  branchPreviewName: {
    color: "#020617",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900"
  },
  branchPreviewCode: {
    marginTop: 3,
    color: "#2563eb",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800"
  },
  branchFormField: {
    gap: 7
  },
  branchFormLabel: {
    color: "#020617",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800"
  },
  branchFormInputShell: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ffffff"
  },
  branchFormInputIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9"
  },
  branchFormInput: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 0,
    color: "#020617",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "600"
  },
  formErrorText: {
    color: "#991b1b",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  createBranchButton: {
    minHeight: 52,
    marginTop: 4,
    borderRadius: 12,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#2563eb"
  },
  createBranchButtonDisabled: {
    backgroundColor: "#88a9ef"
  },
  createBranchButtonText: {
    color: "#ffffff",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900"
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
