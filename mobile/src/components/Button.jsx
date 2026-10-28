import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../theme";

// variant: "primary" (filled) | "secondary" (outlined) | "link" (text only)
const Button = ({ title, onPress, variant = "primary", loading = false, disabled = false, style }) => {
    const isDisabled = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            style={({ pressed }) => [
                styles.base,
                styles[variant],
                pressed && variant === "primary" && styles.primaryPressed,
                pressed && variant !== "primary" && styles.pressed,
                isDisabled && styles.disabled,
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === "primary" ? colors.onPrimary : colors.primary} />
            ) : (
                <Text style={[styles.label, variant === "primary" ? styles.primaryLabel : styles.otherLabel]}>{title}</Text>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    base: {
        minHeight: 48,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        alignItems: "center",
        justifyContent: "center"
    },
    primary: { backgroundColor: colors.primary },
    primaryPressed: { backgroundColor: colors.primaryPressed },
    secondary: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface },
    link: { minHeight: 40, backgroundColor: "transparent" },
    pressed: { opacity: 0.6 },
    disabled: { opacity: 0.5 },
    label: { fontSize: 16, fontWeight: "600" },
    primaryLabel: { color: colors.onPrimary },
    otherLabel: { color: colors.primary }
});

export default Button;
