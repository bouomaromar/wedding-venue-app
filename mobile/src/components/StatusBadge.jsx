import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

// Venue approval status (pending / approved / rejected). Bookings can reuse it later.
const STATUS_STYLES = {
    approved: { label: "Approved", color: colors.success, background: colors.successBackground },
    pending: { label: "Pending review", color: colors.warning, background: colors.warningBackground },
    rejected: { label: "Rejected", color: colors.danger, background: colors.dangerBackground }
};

const StatusBadge = ({ status }) => {
    const look = STATUS_STYLES[status] ?? { label: status, color: colors.textMuted, background: colors.chip };

    return (
        <View style={[styles.badge, { backgroundColor: look.background }]}>
            <Text style={[styles.label, { color: look.color }]}>{look.label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        alignSelf: "flex-start",
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2
    },
    label: { fontSize: 12, fontWeight: "700" }
});

export default StatusBadge;
