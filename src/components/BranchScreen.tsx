import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { BranchOption } from "../types/app";
import { BranchTransfer, BranchTransferStatus, Product } from "../types/product";
import { filterBranches, filterProducts, filterTransfers, formatDateTime, getTransferHistoryText, getTransferStatusLabel } from "../utils/appHelpers";
import { BranchOptionList } from "./BranchOptionList";
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
  const [openSection, setOpenSection] = useState<"reserve" | "movements" | null>(null);
  const [movementIdSearch, setMovementIdSearch] = useState("");
  const [filterSourceBranch, setFilterSourceBranch] = useState<BranchOption | null>(null);
  const [filterTargetBranch, setFilterTargetBranch] = useState<BranchOption | null>(null);
  const [expandedTransferId, setExpandedTransferId] = useState<string | null>(null);
  const selectedProduct = products.find((product) => product._id === selectedProductId);
  const productResults = filterProducts(products, productSearch).slice(0, 6);
  const sourceBranchResults = filterBranches(branchOptions, sourceBranchSearch).filter(
    (branch) => branch.code !== targetBranch?.code
  );
  const targetBranchResults = filterBranches(branchOptions, targetBranchSearch).filter(
    (branch) => branch.code !== sourceBranch.code
  );
  const filteredTransfers = filterTransfers(transfers, movementIdSearch, filterSourceBranch, filterTargetBranch);

  return (
    <KeyboardAvoidingView style={styles.screenBody} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        <View style={styles.branchPanel}>
          <Pressable style={styles.accordionHeader} onPress={() => setOpenSection(openSection === "reserve" ? null : "reserve")}>
            <View style={styles.accordionTitleArea}>
              <Text style={styles.sectionTitle}>Reservar estoque para filial</Text>
              <Text style={styles.sectionSubtitle}>Busque produto e filiais por nome ou código antes de reservar.</Text>
            </View>
            <Ionicons name={openSection === "reserve" ? "chevron-up-outline" : "chevron-down-outline"} size={22} color="#0f766e" />
          </Pressable>

          {openSection === "reserve" && (
            <View style={styles.accordionBody}>

              <Text style={styles.fieldLabel}>Produto</Text>
              <View style={styles.selectInputRow}>
                <TextInput
                  value={productSearch}
                  onChangeText={(value) => {
                    onChangeProductSearch(value);
                    onSelectProduct("");
                  }}
                  placeholder="Buscar produto por nome ou EAN"
                  returnKeyType="search"
                  style={styles.selectInput}
                />
                <Pressable style={styles.selectButton} onPress={() => setSelectModal("product")}>
                  <Ionicons name="list-outline" size={22} color="#0f766e" />
                </Pressable>
              </View>
              {!!productSearch.trim() && !selectedProduct && (
                <View style={styles.branchProductGrid}>
                  {productResults.length === 0 ? (
                    <Text style={styles.mutedText}>Nenhum produto encontrado.</Text>
                  ) : (
                    productResults.map((product) => (
                      <Pressable
                        key={product._id}
                        style={styles.branchProductOption}
                        onPress={() => {
                          onSelectProduct(product._id);
                          onChangeProductSearch(`${product.name} - ${product.ean}`);
                        }}
                      >
                        <Text style={styles.branchProductName}>{product.name}</Text>
                        <Text style={styles.branchProductMeta}>EAN {product.ean} | Central: {product.quantity}</Text>
                      </Pressable>
                    ))
                  )}
                </View>
              )}

              {selectedProduct && <Text style={styles.invoiceKey}>Produto selecionado: {selectedProduct.ean}</Text>}

              <Text style={styles.fieldLabel}>Filial origem</Text>
              <View style={styles.selectInputRow}>
                <TextInput
                  value={sourceBranchSearch || `${sourceBranch.code} - ${sourceBranch.name}`}
                  onChangeText={onChangeSourceBranchSearch}
                  placeholder="Buscar filial origem por nome ou código"
                  returnKeyType="search"
                  style={styles.selectInput}
                />
                <Pressable style={styles.selectButton} onPress={() => setSelectModal("source")}>
                  <Ionicons name="business-outline" size={21} color="#0f766e" />
                </Pressable>
              </View>
              {!!sourceBranchSearch.trim() && (
                <BranchOptionList branches={sourceBranchResults} onSelect={onSelectSourceBranch} onClearSearch={onChangeSourceBranchSearch} />
              )}

              <Text style={styles.fieldLabel}>Filial destino</Text>
              <View style={styles.selectInputRow}>
                <TextInput
                  value={targetBranchSearch || (targetBranch ? `${targetBranch.code} - ${targetBranch.name}` : "")}
                  onChangeText={(value) => {
                    onChangeTargetBranchSearch(value);
                    onSelectTargetBranch(null);
                  }}
                  placeholder="Buscar filial destino por nome ou código"
                  returnKeyType="search"
                  style={styles.selectInput}
                />
                <Pressable style={styles.selectButton} onPress={() => setSelectModal("target")}>
                  <Ionicons name="business-outline" size={21} color="#0f766e" />
                </Pressable>
              </View>
              {!!targetBranchSearch.trim() && (
                <BranchOptionList branches={targetBranchResults} onSelect={onSelectTargetBranch} onClearSearch={onChangeTargetBranchSearch} />
              )}

              <TextInput
                value={quantity}
                onChangeText={onChangeQuantity}
                placeholder="Quantidade"
                keyboardType="decimal-pad"
                returnKeyType="next"
                style={styles.quantityInput}
              />
              <TextInput
                value={lot}
                onChangeText={onChangeLot}
                placeholder="Lote"
                returnKeyType="next"
                style={styles.quantityInput}
              />
              <TextInput
                value={observation}
                onChangeText={onChangeObservation}
                placeholder="Observação da reserva"
                multiline
                returnKeyType="done"
                style={[styles.quantityInput, styles.branchObservationInput]}
              />

              <Pressable style={[styles.primaryButton, loading && styles.disabledButton]} disabled={loading} onPress={onCreateTransfer}>
                <Ionicons name="lock-closed-outline" size={18} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Reservar para filial</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.branchPanel}>
          <Pressable style={styles.accordionHeader} onPress={() => setOpenSection(openSection === "movements" ? null : "movements")}>
            <View style={styles.accordionTitleArea}>
              <Text style={styles.sectionTitle}>{"Movimenta\u00e7\u00f5es entre filiais"}</Text>
              <Text style={styles.sectionSubtitle}>Acompanhe reservado, a caminho e entrada na filial.</Text>
            </View>
            <Ionicons name={openSection === "movements" ? "chevron-up-outline" : "chevron-down-outline"} size={22} color="#0f766e" />
          </Pressable>

          {openSection === "movements" && (
            <View style={styles.accordionBody}>

              <Text style={styles.fieldLabel}>Pesquisar movimentação pelo ID</Text>
              <TextInput
                value={movementIdSearch}
                onChangeText={setMovementIdSearch}
                placeholder="Digite o ID da movimentação"
                returnKeyType="search"
                style={styles.quantityInput}
              />

              <Text style={styles.fieldLabel}>Filtrar filial origem</Text>
              <View style={styles.selectInputRow}>
                <TextInput
                  value={filterSourceBranch ? `${filterSourceBranch.code} - ${filterSourceBranch.name}` : ""}
                  editable={false}
                  placeholder="Todas as origens"
                  style={styles.selectInput}
                />
                <Pressable style={styles.selectButton} onPress={() => setSelectModal("filterSource")}>
                  <Ionicons name="business-outline" size={21} color="#0f766e" />
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>Filtrar filial destino</Text>
              <View style={styles.selectInputRow}>
                <TextInput
                  value={filterTargetBranch ? `${filterTargetBranch.code} - ${filterTargetBranch.name}` : ""}
                  editable={false}
                  placeholder="Todos os destinos"
                  style={styles.selectInput}
                />
                <Pressable style={styles.selectButton} onPress={() => setSelectModal("filterTarget")}>
                  <Ionicons name="business-outline" size={21} color="#0f766e" />
                </Pressable>
              </View>

              {(movementIdSearch || filterSourceBranch || filterTargetBranch) && (
                <Pressable
                  style={styles.clearFilterButton}
                  onPress={() => {
                    setMovementIdSearch("");
                    setFilterSourceBranch(null);
                    setFilterTargetBranch(null);
                  }}
                >
                  <Ionicons name="close-outline" size={18} color="#475569" />
                  <Text style={styles.clearFilterText}>Limpar filtros</Text>
                </Pressable>
              )}

              {filteredTransfers.length === 0 ? (
                <Text style={styles.mutedText}>Nenhuma movimentação de filial ainda.</Text>
              ) : (
                filteredTransfers.map((transfer) => {
                  const isExpanded = expandedTransferId === transfer._id;

                  return (
                    <View key={transfer._id} style={styles.transferCard}>
                      <View style={styles.pendingTopRow}>
                        <View style={styles.pendingTitleArea}>
                          <Text style={styles.pendingName}>{transfer.productName}</Text>
                          <Text style={[styles.transferStatusBadge, getTransferStatusStyle(transfer.status)]}>
                            {getTransferStatusLabel(transfer.status)}
                          </Text>
                        </View>

                        <View style={styles.transferRightArea}>
                          <Text style={styles.quantity}>{transfer.quantity}</Text>
                        </View>
                      </View>
                      <View style={styles.transferFooterRow}>
                        <Text style={styles.meta}>
                          Origem: {transfer.sourceBranch || "Estoque central"}
                        </Text>

                        <Pressable
                          onPress={() => setExpandedTransferId(isExpanded ? null : transfer._id)}
                        >
                          <Ionicons
                            name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
                            size={22}
                            color="#0f766e"
                          />
                        </Pressable>
                      </View>


                      {isExpanded && (
                        <>
                          <View style={styles.transferIdRow}>
                            <Text style={styles.transferIdLabel}>ID:</Text>
                            <Text selectable style={styles.transferIdValue}>
                              {transfer._id}
                            </Text>
                          </View>

                          <Text style={styles.meta}>EAN: {transfer.ean}</Text>

                          {transfer.lot && <Text style={styles.meta}>Lote: {transfer.lot}</Text>}

                          {transfer.history?.map((item, index) => (
                            <Text key={`${item.status}-${index}`} style={styles.transferHistory}>
                              {getTransferHistoryText(transfer, item)} - {formatDateTime(item.createdAt)}
                            </Text>
                          ))}

                          {transfer.status === "reserved" && (
                            <View style={styles.transferActions}>
                              <Pressable style={styles.secondaryButton} onPress={() => onUpdateStatus(transfer._id, "in_transit")}>
                                <Ionicons name="car-outline" size={18} color="#0f766e" />
                                <Text style={styles.secondaryButtonText}>Produto a caminho</Text>
                              </Pressable>

                              <Pressable style={styles.cancelButton} onPress={() => onCancelTransfer(transfer._id)}>
                                <Ionicons name="close-circle-outline" size={18} color="#991b1b" />
                                <Text style={styles.cancelButtonText}>Cancelar movimentação</Text>
                              </Pressable>
                            </View>
                          )}

                          {transfer.status === "in_transit" && (
                            <View style={styles.transferActions}>
                              <Pressable style={styles.primaryButton} onPress={() => onUpdateStatus(transfer._id, "received")}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
                                <Text style={styles.primaryButtonText}>Dar entrada na filial</Text>
                              </Pressable>

                              <Pressable style={styles.cancelButton} onPress={() => onCancelTransfer(transfer._id)}>
                                <Ionicons name="close-circle-outline" size={18} color="#991b1b" />
                                <Text style={styles.cancelButtonText}>Cancelar movimentação</Text>
                              </Pressable>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          )}
        </View>

        <SelectorModal
          visible={selectModal === "product"}
          title="Selecionar produto"
          onClose={() => setSelectModal(null)}
        >
          {products.map((product) => (
            <Pressable
              key={product._id}
              style={styles.selectorItem}
              onPress={() => {
                onSelectProduct(product._id);
                onChangeProductSearch(`${product.name} - ${product.ean}`);
                setSelectModal(null);
              }}
            >
              <Text style={styles.branchProductName}>{product.name}</Text>
              <Text style={styles.branchProductMeta}>EAN {product.ean} | Central: {product.quantity}</Text>
            </Pressable>
          ))}
        </SelectorModal>

        <SelectorModal
          visible={selectModal === "source"}
          title="Selecionar origem"
          onClose={() => setSelectModal(null)}
        >
          {branchOptions
            .filter((branch) => branch.code !== targetBranch?.code)
            .map((branch) => (
              <Pressable
                key={branch.code}
                style={styles.selectorItem}
                onPress={() => {
                  onSelectSourceBranch(branch);
                  onChangeSourceBranchSearch("");
                  setSelectModal(null);
                }}
              >
                <Text style={styles.branchProductName}>{branch.name}</Text>
                <Text style={styles.branchProductMeta}>Código: {branch.code}</Text>
              </Pressable>
            ))}
        </SelectorModal>

        <SelectorModal
          visible={selectModal === "target"}
          title="Selecionar destino"
          onClose={() => setSelectModal(null)}
        >
          {branchOptions
            .filter((branch) => branch.code !== sourceBranch.code)
            .map((branch) => (
              <Pressable
                key={branch.code}
                style={styles.selectorItem}
                onPress={() => {
                  onSelectTargetBranch(branch);
                  onChangeTargetBranchSearch("");
                  setSelectModal(null);
                }}
              >
                <Text style={styles.branchProductName}>{branch.name}</Text>
                <Text style={styles.branchProductMeta}>Código: {branch.code}</Text>
              </Pressable>
            ))}
        </SelectorModal>

        <SelectorModal
          visible={selectModal === "filterSource"}
          title="Filtrar origem"
          onClose={() => setSelectModal(null)}
        >
          <Pressable
            style={styles.selectorItem}
            onPress={() => {
              setFilterSourceBranch(null);
              setSelectModal(null);
            }}
          >
            <Text style={styles.branchProductName}>Todas as origens</Text>
            <Text style={styles.branchProductMeta}>Remover filtro de origem</Text>
          </Pressable>
          {branchOptions.map((branch) => (
            <Pressable
              key={branch.code}
              style={styles.selectorItem}
              onPress={() => {
                setFilterSourceBranch(branch);
                setSelectModal(null);
              }}
            >
              <Text style={styles.branchProductName}>{branch.name}</Text>
              <Text style={styles.branchProductMeta}>Código: {branch.code}</Text>
            </Pressable>
          ))}
        </SelectorModal>

        <SelectorModal
          visible={selectModal === "filterTarget"}
          title="Filtrar destino"
          onClose={() => setSelectModal(null)}
        >
          <Pressable
            style={styles.selectorItem}
            onPress={() => {
              setFilterTargetBranch(null);
              setSelectModal(null);
            }}
          >
            <Text style={styles.branchProductName}>Todos os destinos</Text>
            <Text style={styles.branchProductMeta}>Remover filtro de destino</Text>
          </Pressable>
          {branchOptions.map((branch) => (
            <Pressable
              key={branch.code}
              style={styles.selectorItem}
              onPress={() => {
                setFilterTargetBranch(branch);
                setSelectModal(null);
              }}
            >
              <Text style={styles.branchProductName}>{branch.name}</Text>
              <Text style={styles.branchProductMeta}>Código: {branch.code}</Text>
            </Pressable>
          ))}
        </SelectorModal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getTransferStatusStyle(status: BranchTransferStatus) {
  if (status === "cancelled") return styles.transferStatusCancelled;
  if (status === "received") return styles.transferStatusReceived;
  if (status === "in_transit") return styles.transferStatusInTransit;
  return styles.transferStatusReserved;
}
