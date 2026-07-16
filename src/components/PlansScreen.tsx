import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { AuthUser, BillingCheckoutPayload, PlanDefinition, UserPlan } from "../types/app";
import { MODULE_LABELS } from "../utils/appHelpers";

type PlansScreenProps = {
  user: AuthUser;
  plans: PlanDefinition[];
  loading: boolean;
  onSelectPlan: (payload: BillingCheckoutPayload) => Promise<void>;
};

type BillingForm = Omit<BillingCheckoutPayload, "plan">;

const EMPTY_BILLING_FORM: BillingForm = {
  cpfCnpj: "",
  phoneNumber: "",
  postalCode: "",
  address: "",
  addressNumber: "",
  province: ""
};

export function PlansScreen({ user, plans, loading, onSelectPlan }: PlansScreenProps) {
  const [selectedPaidPlan, setSelectedPaidPlan] = useState<UserPlan | null>(null);
  const [billingForm, setBillingForm] = useState<BillingForm>(EMPTY_BILLING_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedPlan = plans.find((plan) => plan.id === selectedPaidPlan);

  function updateBillingForm(field: keyof BillingForm, value: string) {
    setBillingForm((current) => ({ ...current, [field]: value }));
  }

  function selectPlan(plan: UserPlan) {
    const planDefinition = plans.find((item) => item.id === plan);

    if (plan === "free" || plan === "custom" || (planDefinition?.monthlyPriceCents || 0) <= 0) {
      onSelectPlan({ plan }).catch(() => undefined);
      return;
    }

    setFormError(null);
    setSelectedPaidPlan(plan);
  }

  async function submitPaidPlan() {
    if (!selectedPaidPlan) return;

    const cpfCnpj = onlyDigits(billingForm.cpfCnpj);
    const phoneNumber = onlyDigits(billingForm.phoneNumber);
    const postalCode = onlyDigits(billingForm.postalCode);
    const address = billingForm.address?.trim();
    const addressNumber = billingForm.addressNumber?.trim();
    const province = billingForm.province?.trim();

    if (![11, 14].includes(cpfCnpj.length)) {
      setFormError("Informe um CPF ou CNPJ valido.");
      return;
    }

    if (phoneNumber.length < 10 || phoneNumber.length > 11) {
      setFormError("Informe um telefone com DDD.");
      return;
    }

    if (postalCode.length !== 8) {
      setFormError("Informe um CEP valido.");
      return;
    }

    if (!address || !addressNumber || !province) {
      setFormError("Informe endereco, numero e bairro.");
      return;
    }

    await onSelectPlan({
      plan: selectedPaidPlan,
      cpfCnpj,
      phoneNumber,
      postalCode,
      address,
      addressNumber,
      province
    });
    setSelectedPaidPlan(null);
  }

  return (
    <>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.pendingHeader}>
          <View>
            <Text style={styles.sectionSubtitle}>Seu plano atual e {plans.find((plan) => plan.id === user.plan)?.label || user.plan}.</Text>
          </View>
        </View>

        {plans.map((plan) => {
          const active = plan.id === user.plan;
          const price = plan.monthlyPriceCents === null ? "Sob consulta" : plan.monthlyPriceCents === 0 ? "Gratis" : formatPrice(plan.monthlyPriceCents);
          const buttonLabel = active ? "Plano atual" : plan.id === "custom" ? "Solicitar contato" : plan.id === "free" ? "Mudar para Free" : `Fazer upgrade para ${plan.label}`;

          return (
            <View key={plan.id} style={[styles.planCard, plan.highlighted && styles.planCardHighlighted, active && styles.planCardActive]}>
              <View style={styles.planTopRow}>
                <View style={styles.pendingTitleArea}>
                  <View style={styles.planTitleRow}>
                    <Text style={styles.pendingName}>{plan.label}</Text>
                    {plan.highlighted && <Text style={styles.planBadge}>Mais indicado</Text>}
                  </View>
                  <Text style={styles.meta}>{plan.description}</Text>
                </View>
                <Text style={styles.planPrice}>{price}</Text>
              </View>

              <View style={styles.planModuleGrid}>
                {plan.modules.map((module) => (
                  <View key={module} style={styles.planModulePill}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#3b82f6" />
                    <Text style={styles.planModuleText}>{MODULE_LABELS[module]}</Text>
                  </View>
                ))}
              </View>

              {plan.features.map((feature) => (
                <View key={feature.key} style={styles.planFeatureRow}>
                  <Ionicons name="checkmark-outline" size={17} color="#3b82f6" />
                  <Text style={styles.meta}>{feature.label}</Text>
                </View>
              ))}

              <Pressable
                style={[active ? styles.secondaryButton : styles.primaryButton, loading && styles.disabledButton]}
                disabled={loading || active}
                onPress={() => selectPlan(plan.id)}
              >
                <Ionicons name={active ? "checkmark-circle-outline" : "arrow-up-circle-outline"} size={18} color={active ? "#3b82f6" : "#ffffff"} />
                <Text style={active ? styles.secondaryButtonText : styles.primaryButtonText}>{buttonLabel}</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={Boolean(selectedPaidPlan)} transparent animationType="slide" onRequestClose={() => setSelectedPaidPlan(null)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView style={styles.billingModalKeyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.billingModalSheet}>
            <View style={styles.planTopRow}>
              <View>
                <Text style={styles.pendingName}>Dados de cobranca</Text>
                <Text style={styles.meta}>Plano {selectedPlan?.label}</Text>
              </View>
              <Pressable style={styles.headerIconButton} onPress={() => setSelectedPaidPlan(null)}>
                <Ionicons name="close-outline" size={22} color="#64748b" />
              </Pressable>
            </View>

            {formError && <Text style={styles.errorText}>{formError}</Text>}

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.billingModalFields}>
              <BillingInput label="CPF ou CNPJ" value={billingForm.cpfCnpj || ""} onChangeText={(value) => updateBillingForm("cpfCnpj", value)} keyboardType="number-pad" />
              <BillingInput label="Telefone com DDD" value={billingForm.phoneNumber || ""} onChangeText={(value) => updateBillingForm("phoneNumber", value)} keyboardType="phone-pad" />
              <BillingInput label="CEP" value={billingForm.postalCode || ""} onChangeText={(value) => updateBillingForm("postalCode", value)} keyboardType="number-pad" />
              <BillingInput label="Endereco" value={billingForm.address || ""} onChangeText={(value) => updateBillingForm("address", value)} />
              <BillingInput label="Numero" value={billingForm.addressNumber || ""} onChangeText={(value) => updateBillingForm("addressNumber", value)} />
              <BillingInput label="Bairro" value={billingForm.province || ""} onChangeText={(value) => updateBillingForm("province", value)} />
            </ScrollView>

            <Pressable style={[styles.primaryButton, loading && styles.disabledButton]} disabled={loading} onPress={submitPaidPlan}>
              <Ionicons name="card-outline" size={18} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Abrir checkout</Text>
            </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

type BillingInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "number-pad" | "phone-pad";
};

function BillingInput({ label, value, onChangeText, keyboardType = "default" }: BillingInputProps) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} style={styles.quantityInput} returnKeyType="next" />
    </View>
  );
}

function formatPrice(value: number) {
  return (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  });
}

function onlyDigits(value?: string) {
  return String(value || "").replace(/\D/g, "");
}
