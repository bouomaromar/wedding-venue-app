import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import FormLayout from "../../components/FormLayout";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import Chip from "../../components/Chip";
import ErrorMessage from "../../components/ErrorMessage";
import useForm from "../../hooks/useForm";
import useAsyncAction from "../../hooks/useAsyncAction";
import useAuth from "../../store/useAuth";
import { colors, spacing, typography } from "../../theme";

const ROLE_OPTIONS = [
    { value: "couple", label: "We're getting married" },
    { value: "owner", label: "I own a venue" }
];

const RegisterScreen = () => {
    const { register } = useAuth();
    const { form, handleChange } = useForm({
        role: "couple",
        name: "",
        email: "",
        phone: "",
        password: "",
        companyName: ""
    });
    const [error, setError] = useState("");
    const { run, pending } = useAsyncAction(setError);
    const isOwner = form.role === "owner";

    const handleSubmit = () => {
        // quick checks for instant feedback; the API validates everything again
        if (!form.name.trim() || !form.email.trim()) {
            setError("Name and email are required");
            return;
        }
        if (form.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        if (isOwner && !form.companyName.trim()) {
            setError("Company name is required for venue owners");
            return;
        }

        run(() => register({
            role: form.role,
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            phone: form.phone.trim() || undefined,
            companyName: isOwner ? form.companyName.trim() : undefined
        }));
    };

    return (
        <FormLayout>
            <Text style={styles.title}>Create your account</Text>

            <Text style={styles.label}>I am signing up because…</Text>
            <View style={styles.roles}>
                {ROLE_OPTIONS.map((option) => (
                    <Chip
                        key={option.value}
                        label={option.label}
                        selected={form.role === option.value}
                        onPress={() => handleChange("role")(option.value)}
                    />
                ))}
            </View>

            <ErrorMessage message={error} />

            <TextField label={isOwner ? "Your name" : "Your names (e.g. Rami & Lara)"} value={form.name} onChangeText={handleChange("name")} autoComplete="name" />
            {isOwner && (
                <TextField label="Company / venue business name" value={form.companyName} onChangeText={handleChange("companyName")} />
            )}
            <TextField
                label="Email"
                value={form.email}
                onChangeText={handleChange("email")}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
            />
            <TextField
                label="Phone (optional)"
                value={form.phone}
                onChangeText={handleChange("phone")}
                keyboardType="phone-pad"
                autoComplete="tel"
                placeholder="+961 …"
            />
            <TextField
                label="Password (at least 8 characters)"
                value={form.password}
                onChangeText={handleChange("password")}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
            />

            <Button title="Create account" onPress={handleSubmit} loading={pending} />
        </FormLayout>
    );
};

const styles = StyleSheet.create({
    title: { ...typography.heading, marginBottom: spacing.lg },
    label: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: spacing.sm },
    roles: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.md }
});

export default RegisterScreen;
