import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import VenueCard from "../../components/VenueCard";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";
import { useMyVenues } from "../../hooks/useVenues";
import { colors, spacing, typography } from "../../theme";

// The owner's own venues in every status (pending ones are only visible here).
const MyVenuesScreen = ({ navigation }) => {
    const { items, total, loading, refreshing, loadingMore, error, refresh, loadMore } = useMyVenues();

    // reload when coming back to this tab (e.g. after adding a venue), but not on first open
    const firstFocus = useRef(true);
    useFocusEffect(useCallback(() => {
        if (firstFocus.current) {
            firstFocus.current = false;
            return;
        }
        refresh();
    }, [refresh]));

    const addVenue = () => navigation.navigate("VenueForm");

    return (
        <FlatList
            style={styles.list}
            contentContainerStyle={styles.content}
            data={loading ? [] : items}
            keyExtractor={(venue) => venue.id}
            renderItem={({ item }) => (
                <VenueCard
                    venue={item}
                    showStatus
                    onPress={() => navigation.navigate("VenueDetails", { id: item.id, name: item.name })}
                />
            )}
            ListHeaderComponent={
                <>
                    <ErrorMessage message={error} onRetry={refresh} />
                    {!loading && total > 0 && (
                        <>
                            <Button title="Add a venue" onPress={addVenue} style={styles.add} />
                            <Text style={styles.hint}>New venues are reviewed by an admin before couples can see them.</Text>
                        </>
                    )}
                </>
            }
            ListEmptyComponent={
                loading ? <LoadingView /> : !error && (
                    <EmptyState title="No venues yet" message="Add your first venue. Couples will see it once an admin approves it.">
                        <Button title="Add a venue" onPress={addVenue} />
                    </EmptyState>
                )
            }
            ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={styles.footer} /> : null}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
        />
    );
};

const styles = StyleSheet.create({
    list: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    add: { marginBottom: spacing.sm },
    hint: { ...typography.caption, marginBottom: spacing.lg },
    footer: { marginVertical: spacing.lg }
});

export default MyVenuesScreen;
