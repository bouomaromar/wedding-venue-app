import { StyleSheet, View } from "react-native";
import EmptyState from "../components/EmptyState";
import { colors } from "../theme";

// Stands in for screens that aren't built yet, so the navigation is complete.
// Replace each one with the real screen as the module is built.
const PlaceholderScreen = ({ route }) => (
    <View style={styles.screen}>
        <EmptyState
            title={route.params?.title ?? "Coming soon"}
            message={route.params?.message ?? "This part of the app is being built."}
        />
    </View>
);

const styles = StyleSheet.create({
    screen: { flex: 1, justifyContent: "center", backgroundColor: colors.background }
});

export default PlaceholderScreen;
