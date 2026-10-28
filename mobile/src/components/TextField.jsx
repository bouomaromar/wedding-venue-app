import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing } from "../theme";

// Labelled text input. Any extra props go to the TextInput
// (secureTextEntry, keyboardType, autoComplete...).
const TextField = ({ label, style, ...inputProps }) => (
    <View style={[styles.field, style]}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={label}
            {...inputProps}
        />
    </View>
);

const styles = StyleSheet.create({
    field: { marginBottom: spacing.lg },
    label: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: spacing.xs },
    input: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        fontSize: 16,
        color: colors.text
    }
});

export default TextField;
