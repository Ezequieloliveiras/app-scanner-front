import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { primaryShadow, softShadow, styles as legacyStyles } from "../styles/appStyles";
import { AuthUser, BillingCheckoutPayload, PlanDefinition, UserPlan } from "../types/app";
import { PLAN_ORDER } from "../utils/appHelpers";
import { styles as appHeaderStyles } from "./AppHeader.styles";

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

const PLAN_DESCRIPTIONS: Partial<Record<UserPlan, string>> = {
  free: "Para começar a organizar seu estoque.",
  basic: "Para equipes pequenas de recebimento.",
  premium: "Para operações com múltiplas filiais.",
  pro: "Para distribuidoras e redes.",
  custom: "Solução sob medida para sua operação."
};

const FALLBACK_FEATURES: Partial<Record<UserPlan, string[]>> = {
  free: ["1 usuário", "Scanner de NF-e", "Consulta de produtos", "Histórico básico"],
  basic: ["3 usuários", "Scanner de NF-e", "Solicitações de retirada", "Histórico completo", "Notificações push"],
  premium: [
    "10 usuários",
    "Todos os módulos",
    "Gestão de filiais",
    "Dashboard analítico",
    "Certificado digital",
    "Gerenciamento de acessos"
  ],
  pro: ["Usuários ilimitados", "Todos os módulos", "Múltiplos certificados", "Suporte prioritário", "API de integração", "Relatórios avançados"],
  custom: ["Tudo do Pro", "Integração personalizada", "SLA dedicado", "Treinamento da equipe", "Implantação assistida"]
};

const CUSTOM_PLAN_FALLBACK: PlanDefinition = {
  id: "custom",
  label: "Personalizado",
  description: PLAN_DESCRIPTIONS.custom || "",
  monthlyPriceCents: null,
  maxManagedUsers: null,
  modules: [],
  features: (FALLBACK_FEATURES.custom || []).map((label, index) => ({ key: `custom-${index}`, label })),
  contactRequired: true
};

export function PlansScreen({ user, plans, loading, onSelectPlan }: PlansScreenProps) {
  const [selectedPaidPlan, setSelectedPaidPlan] = useState<UserPlan | null>(null);
  const [pendingPlan, setPendingPlan] = useState<UserPlan | null>(null);
  const [billingForm, setBillingForm] = useState<BillingForm>(EMPTY_BILLING_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedPlan = plans.find((plan) => plan.id === selectedPaidPlan);
  const currentPlan = plans.find((plan) => plan.id === user.plan);
  const displayPlans = getDisplayPlans(plans, loading);

  function updateBillingForm(field: keyof BillingForm, value: string) {
    setBillingForm((current) => ({ ...current, [field]: value }));
  }

  function selectPlan(plan: UserPlan) {
    const planDefinition = plans.find((item) => item.id === plan);

    if (plan === "free" || plan === "custom" || (planDefinition?.monthlyPriceCents || 0) <= 0) {
      setPendingPlan(plan);
      onSelectPlan({ plan })
        .catch(() => undefined)
        .finally(() => setPendingPlan(null));
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

    setPendingPlan(selectedPaidPlan);

    try {
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
    } finally {
      setPendingPlan(null);
    }
  }

  return (
    <>
      <ScrollView
        style={planStyles.scrollArea}
        contentContainerStyle={planStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CurrentPlanSummary label={currentPlan?.label || user.plan} />

        {loading && displayPlans.length === 0 && (
          <View style={planStyles.loadingCard}>
            <ActivityIndicator color="#2563eb" />
          </View>
        )}

        {displayPlans.map((plan) => (
          plan.id === "custom" ? (
            <CustomPlanCard
              key={plan.id}
              plan={plan}
              active={plan.id === user.plan}
              busy={loading || pendingPlan === plan.id}
              pending={pendingPlan === plan.id}
              onPress={() => selectPlan(plan.id)}
            />
          ) : (
            <PlanCard
              key={plan.id}
              plan={plan}
              active={plan.id === user.plan}
              busy={loading || pendingPlan === plan.id}
              pending={pendingPlan === plan.id}
              onPress={() => selectPlan(plan.id)}
            />
          )
        ))}
      </ScrollView>

      <Modal visible={Boolean(selectedPaidPlan)} transparent animationType="slide" onRequestClose={() => setSelectedPaidPlan(null)}>
        <View style={legacyStyles.modalOverlay}>
          <KeyboardAvoidingView style={legacyStyles.billingModalKeyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={legacyStyles.billingModalSheet}>
            <View style={legacyStyles.planTopRow}>
              <View>
                <Text style={legacyStyles.pendingName}>Dados de cobranca</Text>
                <Text style={legacyStyles.meta}>Plano {selectedPlan?.label}</Text>
              </View>
              <Pressable style={appHeaderStyles.headerIconButton} onPress={() => setSelectedPaidPlan(null)}>
                <Ionicons name="close-outline" size={22} color="#64748b" />
              </Pressable>
            </View>

            {formError && <Text style={legacyStyles.errorText}>{formError}</Text>}

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={legacyStyles.billingModalFields}>
              <BillingInput label="CPF ou CNPJ" value={billingForm.cpfCnpj || ""} onChangeText={(value) => updateBillingForm("cpfCnpj", value)} keyboardType="number-pad" />
              <BillingInput label="Telefone com DDD" value={billingForm.phoneNumber || ""} onChangeText={(value) => updateBillingForm("phoneNumber", value)} keyboardType="phone-pad" />
              <BillingInput label="CEP" value={billingForm.postalCode || ""} onChangeText={(value) => updateBillingForm("postalCode", value)} keyboardType="number-pad" />
              <BillingInput label="Endereco" value={billingForm.address || ""} onChangeText={(value) => updateBillingForm("address", value)} />
              <BillingInput label="Numero" value={billingForm.addressNumber || ""} onChangeText={(value) => updateBillingForm("addressNumber", value)} />
              <BillingInput label="Bairro" value={billingForm.province || ""} onChangeText={(value) => updateBillingForm("province", value)} />
            </ScrollView>

            <Pressable style={[legacyStyles.primaryButton, loading && legacyStyles.disabledButton]} disabled={loading} onPress={submitPaidPlan}>
              {pendingPlan === selectedPaidPlan ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Ionicons name="card-outline" size={18} color="#ffffff" />
              )}
              <Text style={legacyStyles.primaryButtonText}>Abrir checkout</Text>
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
      <Text style={legacyStyles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} style={legacyStyles.quantityInput} returnKeyType="next" />
    </View>
  );
}

function CurrentPlanSummary({ label }: { label: string }) {
  return (
    <View style={planStyles.currentSummary}>
      <Text style={planStyles.currentSummaryCaption}>Seu plano atual é</Text>
      <Text style={planStyles.currentSummaryName}>{label}</Text>
    </View>
  );
}

function PlanCard({
  plan,
  active,
  busy,
  pending,
  onPress
}: {
  plan: PlanDefinition;
  active: boolean;
  busy: boolean;
  pending: boolean;
  onPress: () => void;
}) {
  const recommended = plan.highlighted || plan.id === "premium";
  const isCustom = plan.id === "custom";
  const buttonLabel = getButtonLabel(plan, active);
  const price = getPriceDisplay(plan);
  const features = getPlanFeatures(plan);
  const disabled = busy || active;

  return (
    <View
      style={[planStyles.card, recommended && planStyles.recommendedCard]}
      accessibilityLabel={`Plano ${plan.label}`}
    >
      {recommended && <RecommendedPlanBanner />}

      <View style={planStyles.cardBody}>
        <View style={planStyles.planTopRow}>
          <View style={planStyles.planTitleArea}>
            <Text style={planStyles.planName}>{plan.label}</Text>
            <Text style={planStyles.planDescription}>{getPlanDescription(plan)}</Text>
          </View>

          <View style={planStyles.priceArea}>
            <Text style={[planStyles.planPrice, isCustom && planStyles.consultPrice]}>{price.value}</Text>
            {price.suffix && <Text style={planStyles.priceSuffix}>{price.suffix}</Text>}
          </View>
        </View>

        <View style={planStyles.featuresList}>
          {features.map((feature) => (
            <PlanFeatureItem key={feature} label={feature} />
          ))}
        </View>

        <Pressable
          style={[
            planStyles.planButton,
            active ? planStyles.currentPlanButton : isCustom || plan.id === "free" ? planStyles.outlineButton : planStyles.upgradeButton,
            disabled && !active && planStyles.disabledButton
          ]}
          disabled={disabled}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
          accessibilityState={{ disabled }}
        >
          {pending ? (
            <ActivityIndicator color={isCustom || plan.id === "free" ? "#071426" : "#ffffff"} />
          ) : isCustom ? (
            <Ionicons name="call-outline" size={13} color="#071426" />
          ) : null}
          <Text style={[planStyles.buttonText, active ? planStyles.currentPlanButtonText : isCustom || plan.id === "free" ? planStyles.outlineButtonText : planStyles.upgradeButtonText]}>
            {buttonLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function CustomPlanCard({
  plan,
  active,
  busy,
  pending,
  onPress
}: {
  plan: PlanDefinition;
  active: boolean;
  busy: boolean;
  pending: boolean;
  onPress: () => void;
}) {
  return <PlanCard plan={plan} active={active} busy={busy} pending={pending} onPress={onPress} />;
}

function RecommendedPlanBanner() {
  return (
    <View style={planStyles.recommendedBanner}>
      <Ionicons name="star" size={10} color="#ffffff" />
      <Text style={planStyles.recommendedText}>Mais indicado</Text>
    </View>
  );
}

function PlanFeatureItem({ label }: { label: string }) {
  return (
    <View style={planStyles.featureRow}>
      <Ionicons name="checkmark-outline" size={12} color="#16A34A" style={planStyles.featureIcon} />
      <Text style={planStyles.featureText}>{label}</Text>
    </View>
  );
}

function getButtonLabel(plan: PlanDefinition, active: boolean) {
  if (active) return "Plano atual";
  if (plan.id === "custom") return "Solicitar contato";
  if (plan.id === "free") return "Mudar para Free";
  return `Fazer upgrade para ${plan.label}`;
}

function getPriceDisplay(plan: PlanDefinition) {
  if (plan.monthlyPriceCents === null) return { value: "Sob consulta", suffix: null };
  if (plan.monthlyPriceCents === 0) return { value: "Grátis", suffix: null };
  return { value: formatPrice(plan.monthlyPriceCents), suffix: "/mês" };
}

function getPlanDescription(plan: PlanDefinition) {
  return plan.description || PLAN_DESCRIPTIONS[plan.id] || "";
}

function getPlanFeatures(plan: PlanDefinition) {
  const realFeatures = plan.features.map((feature) => feature.label).filter(Boolean);
  return realFeatures.length > 0 ? realFeatures : FALLBACK_FEATURES[plan.id] || [];
}

function getDisplayPlans(plans: PlanDefinition[], loading: boolean) {
  const orderedPlans = PLAN_ORDER.map((planId) => plans.find((plan) => plan.id === planId)).filter(
    (plan): plan is PlanDefinition => Boolean(plan)
  );

  if (loading && orderedPlans.length === 0) {
    return orderedPlans;
  }

  return orderedPlans.some((plan) => plan.id === "custom") ? orderedPlans : [...orderedPlans, CUSTOM_PLAN_FALLBACK];
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

const planStyles = StyleSheet.create({
  scrollArea: {
    flex: 1,
    backgroundColor: "#F7F9FC"
  },
  scrollContent: {
    paddingTop: 10,
    paddingHorizontal: 9,
    paddingBottom: 26
  },
  currentSummary: {
    marginBottom: 13
  },
  currentSummaryCaption: {
    color: "#64748B",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "500"
  },
  currentSummaryName: {
    marginTop: 1,
    color: "#020617",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900"
  },
  loadingCard: {
    minHeight: 80,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    ...softShadow
  },
  card: {
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    ...softShadow
  },
  recommendedCard: {
    borderColor: "#DCE3EE"
  },
  recommendedBanner: {
    minHeight: 22,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2563EB"
  },
  recommendedText: {
    color: "#FFFFFF",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900"
  },
  cardBody: {
    paddingHorizontal: 13,
    paddingTop: 13,
    paddingBottom: 13
  },
  planTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10
  },
  planTitleArea: {
    flex: 1,
    minWidth: 0
  },
  planName: {
    color: "#020617",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900"
  },
  planDescription: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "500"
  },
  priceArea: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    minWidth: 86
  },
  planPrice: {
    color: "#020617",
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "900",
    textAlign: "right"
  },
  consultPrice: {
    paddingTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  priceSuffix: {
    marginTop: 1,
    color: "#64748B",
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "500",
    textAlign: "right"
  },
  featuresList: {
    marginTop: 11,
    gap: 7
  },
  featureRow: {
    minHeight: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7
  },
  featureIcon: {
    marginTop: 1
  },
  featureText: {
    flex: 1,
    color: "#1E293B",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "500"
  },
  planButton: {
    width: "100%",
    minHeight: 40,
    marginTop: 13,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7
  },
  upgradeButton: {
    backgroundColor: "#2563EB",
    ...primaryShadow
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#DCE3EE",
    backgroundColor: "#FFFFFF"
  },
  currentPlanButton: {
    backgroundColor: "#F1F5F9"
  },
  disabledButton: {
    opacity: 0.72
  },
  buttonText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    textAlign: "center"
  },
  upgradeButtonText: {
    color: "#FFFFFF"
  },
  outlineButtonText: {
    color: "#071426"
  },
  currentPlanButtonText: {
    color: "#64748B"
  }
});
