import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "../theme";

const LoadingView = () => (
    <View style={styles.container} accessibilityLabel="Loading">
        <ActivityIndicator size="large" color={colors.primary} />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }
});

export default LoadingView;
