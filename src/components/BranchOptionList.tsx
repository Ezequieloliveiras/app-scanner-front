import { Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { BranchOption } from "../types/app";
export function BranchOptionList({
  branches,
  onSelect,
  onClearSearch
}: {
  branches: BranchOption[];
  onSelect: (branch: BranchOption) => void;
  onClearSearch: (value: string) => void;
}) {
  if (branches.length === 0) {
    return <Text style={styles.mutedText}>Nenhuma filial encontrada.</Text>;
  }

  return (
    <View style={styles.branchProductGrid}>
      {branches.map((branch) => (
        <Pressable
          key={branch.code}
          style={styles.branchProductOption}
          onPress={() => {
            onSelect(branch);
            onClearSearch("");
          }}
        >
          <Text style={styles.branchProductName}>{branch.name}</Text>
          <Text style={styles.branchProductMeta}>Codigo: {branch.code}</Text>
        </Pressable>
      ))}
    </View>
  );
}
