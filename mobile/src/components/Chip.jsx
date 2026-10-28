import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../theme";

// A small rounded label. Pass onPress to make it a selectable filter chip.
const Chip = ({ label, selected = false, onPress }) => (
    <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? "button" : "text"}
        accessibilityState={onPress ? { selected } : undefined}
        style={[styles.chip, selected && styles.selected]}
    >
        <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    chip: {
        backgroundColor: colors.chip,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginRight: spacing.sm,
        marginBottom: spacing.sm
    },
    selected: { backgroundColor: colors.primary },
    label: { fontSize: 13, color: colors.text },
    selectedLabel: { color: colors.onPrimary, fontWeight: "600" }
});

export default Chip;
