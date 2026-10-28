import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

// Shows an error with an optional retry action; renders nothing when there's no error.
const ErrorMessage = ({ message, onRetry }) => {
    if (!message) {
        return null;
    }

    return (
        <View style={styles.box} accessibilityRole="alert">
            <Text style={styles.text}>{message}</Text>
            {onRetry && (
                <Text style={styles.retry} onPress={onRetry} accessibilityRole="button">
                    Try again
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    box: {
        backgroundColor: colors.dangerBackground,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.lg
    },
    text: { color: colors.danger, fontSize: 14, lineHeight: 20 },
    retry: { color: colors.danger, fontWeight: "700", marginTop: spacing.sm }
});

export default ErrorMessage;
