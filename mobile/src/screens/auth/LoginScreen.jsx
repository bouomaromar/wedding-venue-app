import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import FormLayout from "../../components/FormLayout";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import useForm from "../../hooks/useForm";
import useAsyncAction from "../../hooks/useAsyncAction";
import useAuth from "../../store/useAuth";
import { colors, spacing, typography } from "../../theme";

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const { form, handleChange } = useForm({ email: "", password: "" });
    const [error, setError] = useState("");
    const { run, pending } = useAsyncAction(setError);

    const handleSubmit = () => {
        if (!form.email.trim() || !form.password) {
            setError("Enter your email and password");
            return;
        }
        // on success the navigator switches to the signed-in tabs by itself
        run(() => login(form.email, form.password));
    };

    return (
        <FormLayout safeArea>
            <View style={styles.header}>
                <Text style={styles.brand}>Wedding Venues</Text>
                <Text style={typography.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Sign in to book venues and save your favorites.</Text>
            </View>

            <ErrorMessage message={error} />

            <TextField
                label="Email"
                value={form.email}
                onChangeText={handleChange("email")}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="next"
            />
            <TextField
                label="Password"
                value={form.password}
                onChangeText={handleChange("password")}
                secureTextEntry
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
            />

            <Button title="Sign in" onPress={handleSubmit} loading={pending} />
            <Button title="Create an account" variant="link" onPress={() => navigation.navigate("Register")} style={styles.gap} />

            <View style={styles.divider} />
            <Button title="Browse venues as a guest" variant="secondary" onPress={() => navigation.navigate("GuestExplore")} />
        </FormLayout>
    );
};

const styles = StyleSheet.create({
    header: { marginTop: spacing.xxl, marginBottom: spacing.xl },
    brand: { fontSize: 13, fontWeight: "700", color: colors.accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: spacing.sm },
    subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
    gap: { marginTop: spacing.sm },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xl }
});

export default LoginScreen;
