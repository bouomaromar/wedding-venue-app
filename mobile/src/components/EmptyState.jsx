import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";

const EmptyState = ({ title, message, children }) => (
    <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: { alignItems: "center", paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
    title: { ...typography.subheading, textAlign: "center", marginBottom: spacing.sm },
    message: { ...typography.caption, textAlign: "center", lineHeight: 20, marginBottom: spacing.lg, color: colors.textMuted }
});

export default EmptyState;
