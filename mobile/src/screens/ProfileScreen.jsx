import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";
import useAsyncAction from "../hooks/useAsyncAction";
import useAuth from "../store/useAuth";
import { colors, radius, spacing, typography } from "../theme";

const ROLE_LABELS = { couple: "Couple", owner: "Venue owner", admin: "Admin" };

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const [error, setError] = useState("");
    const { run, pending } = useAsyncAction(setError);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <View style={styles.card}>
                <Text style={typography.heading}>{user.name}</Text>
                <Text style={styles.role}>{ROLE_LABELS[user.role] ?? user.role}</Text>
                <Row label="Email" value={user.email} />
                {user.phone ? <Row label="Phone" value={user.phone} /> : null}
                {user.ownerProfile ? <Row label="Company" value={user.ownerProfile.companyName} /> : null}
            </View>

            <ErrorMessage message={error} />
            <Button title="Sign out" variant="secondary" onPress={() => run(logout)} loading={pending} />
        </ScrollView>
    );
};

const Row = ({ label, value }) => (
    <View style={styles.row}>
        <Text style={typography.caption}>{label}</Text>
        <Text style={typography.body}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl
    },
    role: { fontSize: 13, fontWeight: "700", color: colors.accent, marginTop: spacing.xs, marginBottom: spacing.md },
    row: { marginTop: spacing.md }
});

export default ProfileScreen;
