import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import VenueCard from "../../components/VenueCard";
import Chip from "../../components/Chip";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";
import useFetch from "../../hooks/useFetch";
import { useVenues } from "../../hooks/useVenues";
import { getRegions } from "../../api/lookupApi";
import { colors, radius, spacing, typography } from "../../theme";

const SEARCH_DELAY_MS = 400;

// Browse and filter approved venues. Used by couples and by guests.
const ExploreScreen = ({ navigation }) => {
    const [searchText, setSearchText] = useState("");
    const [search, setSearch] = useState("");
    const [region, setRegion] = useState(null);
    const { data: regions } = useFetch(getRegions, []);

    // wait until typing pauses before searching, instead of one request per letter
    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchText.trim()), SEARCH_DELAY_MS);
        return () => clearTimeout(timer);
    }, [searchText]);

    const filters = useMemo(() => ({ search, region }), [search, region]);
    const { items, total, loading, refreshing, loadingMore, error, refresh, loadMore } = useVenues(filters);

    const header = (
        <View>
            <TextInput
                style={styles.search}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search venues by name"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Search venues by name"
                returnKeyType="search"
                clearButtonMode="while-editing"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
                <Chip label="All regions" selected={!region} onPress={() => setRegion(null)} />
                {regions.map((name) => (
                    <Chip key={name} label={name} selected={region === name} onPress={() => setRegion(name)} />
                ))}
            </ScrollView>
            <ErrorMessage message={error} onRetry={refresh} />
            {!loading && !error && (
                <Text style={styles.count}>{total} {total === 1 ? "venue" : "venues"}</Text>
            )}
        </View>
    );

    return (
        <FlatList
            style={styles.list}
            contentContainerStyle={styles.content}
            data={loading ? [] : items}
            keyExtractor={(venue) => venue.id}
            renderItem={({ item }) => (
                <VenueCard venue={item} onPress={() => navigation.navigate("VenueDetails", { id: item.id, name: item.name })} />
            )}
            ListHeaderComponent={header}
            ListEmptyComponent={
                loading ? <LoadingView /> : !error && (
                    <EmptyState title="No venues match" message="Try another region or a different search." />
                )
            }
            ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={styles.footer} /> : null}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
            keyboardShouldPersistTaps="handled"
        />
    );
};

const styles = StyleSheet.create({
    list: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    search: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        fontSize: 16,
        color: colors.text
    },
    chips: { marginTop: spacing.md, marginBottom: spacing.sm },
    count: { ...typography.caption, marginBottom: spacing.md },
    footer: { marginVertical: spacing.lg }
});

export default ExploreScreen;
