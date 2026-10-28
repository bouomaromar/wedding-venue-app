import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";

// Scrollable form page that moves up when the keyboard opens.
const FormLayout = ({ children, safeArea = false }) => {
    const content = (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );

    // screens without a header need the safe area so content clears the notch
    return safeArea ? <SafeAreaView style={styles.root}>{content}</SafeAreaView> : content;
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, flexGrow: 1 }
});

export default FormLayout;
