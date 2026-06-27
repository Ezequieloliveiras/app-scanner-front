import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { AuthUser, PlanDefinition, UserPlan } from "../types/app";
import { MODULE_LABELS } from "../utils/appHelpers";

type PlansScreenProps = {
  user: AuthUser;
  plans: PlanDefinition[];
  loading: boolean;
  onSelectPlan: (plan: UserPlan) => Promise<void>;
};

export function PlansScreen({ user, plans, loading, onSelectPlan }: PlansScreenProps) {
  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
      <View style={styles.pendingHeader}>
        <View>
          <Text style={styles.sectionSubtitle}>Seu plano atual é {plans.find((plan) => plan.id === user.plan)?.label || user.plan}.</Text>
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
              onPress={() => onSelectPlan(plan.id)}
            >
              <Ionicons name={active ? "checkmark-circle-outline" : "arrow-up-circle-outline"} size={18} color={active ? "#3b82f6" : "#ffffff"} />
              <Text style={active ? styles.secondaryButtonText : styles.primaryButtonText}>{buttonLabel}</Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

function formatPrice(value: number) {
  return (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  });
}
