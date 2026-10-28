import { useLayoutEffect } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Button from "../../components/Button";
import Chip from "../../components/Chip";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingView from "../../components/LoadingView";
import StatusBadge from "../../components/StatusBadge";
import { useVenue } from "../../hooks/useVenues";
import useAuth from "../../store/useAuth";
import { colors, formatPrice, radius, spacing, typography } from "../../theme";

// Shared by guests, couples and owners (pushed on top of any tab).
const VenueDetailsScreen = ({ route, navigation }) => {
    const { id, name } = route.params;
    const { user } = useAuth();
    const { data: venue, loading, error, reload } = useVenue(id);

    useLayoutEffect(() => {
        navigation.setOptions({ title: venue?.name ?? name ?? "Venue" });
    }, [navigation, venue?.name, name]);

    if (loading) {
        return <LoadingView />;
    }

    if (error || !venue) {
        return (
            <View style={styles.padded}>
                <ErrorMessage message={error || "Venue not found"} onRetry={reload} />
            </View>
        );
    }

    const photos = venue.media.filter((item) => item.type === "photo");
    const hasTour = venue.media.some((item) => item.type === "360" || item.type === "splat");
    const isCouple = user?.role === "couple";

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            {photos[0] ? (
                <Image source={{ uri: photos[0].url }} style={styles.cover} accessibilityIgnoresInvertColors />
            ) : (
                <View style={[styles.cover, styles.coverPlaceholder]}>
                    <Text style={typography.caption}>No photos yet</Text>
                </View>
            )}

            <View style={styles.padded}>
                {venue.status !== "approved" && <View style={styles.badge}><StatusBadge status={venue.status} /></View>}

                <Text style={typography.title}>{venue.name}</Text>
                <Text style={styles.location}>
                    {venue.region}{venue.address ? ` · ${venue.address}` : ""}
                </Text>

                <View style={styles.facts}>
                    <Fact label="Guests" value={`${venue.capacityMin}–${venue.capacityMax}`} />
                    <Fact label="Price" value={`${formatPrice(venue.priceMin)}+`} />
                    <Fact
                        label="Rating"
                        value={venue.ratingCount > 0 ? `${venue.ratingAvg.toFixed(1)} ★ (${venue.ratingCount})` : "New"}
                    />
                </View>

                <Text style={styles.priceRange}>
                    Typical event price: {formatPrice(venue.priceMin)} – {formatPrice(venue.priceMax)}
                </Text>

                {venue.description ? <Text style={styles.description}>{venue.description}</Text> : null}

                {venue.styles.length > 0 && (
                    <Section title="Style">
                        <View style={styles.chips}>
                            {venue.styles.map((style) => <Chip key={style.id} label={style.name} />)}
                        </View>
                    </Section>
                )}

                {venue.amenities.length > 0 && (
                    <Section title="Amenities">
                        <View style={styles.chips}>
                            {venue.amenities.map((amenity) => <Chip key={amenity.id} label={amenity.name} />)}
                        </View>
                    </Section>
                )}

                <Section title="Contact">
                    <Text style={typography.body}>{venue.owner.companyName}</Text>
                    {venue.owner.contactPhone ? <Text style={typography.caption}>{venue.owner.contactPhone}</Text> : null}
                    <Text style={typography.caption}>{venue.owner.contactEmail}</Text>
                </Section>

                {/* placeholders for the next modules: tours and bookings */}
                <View style={styles.actions}>
                    <Button
                        title={hasTour ? "Virtual tour (coming soon)" : "No virtual tour yet"}
                        variant="secondary"
                        disabled
                    />
                    {isCouple && <Button title="Request this venue (coming soon)" disabled style={styles.gap} />}
                    {!user && <Text style={styles.hint}>Sign in to request a booking.</Text>}
                </View>
            </View>
        </ScrollView>
    );
};

const Fact = ({ label, value }) => (
    <View style={styles.fact}>
        <Text style={typography.caption}>{label}</Text>
        <Text style={styles.factValue}>{value}</Text>
    </View>
);

const Section = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: spacing.xxl },
    padded: { padding: spacing.lg },
    cover: { width: "100%", aspectRatio: 4 / 3, backgroundColor: colors.chip },
    coverPlaceholder: { alignItems: "center", justifyContent: "center" },
    badge: { marginBottom: spacing.sm },
    location: { ...typography.caption, marginTop: spacing.xs },
    facts: {
        flexDirection: "row",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        marginTop: spacing.lg,
        paddingVertical: spacing.md
    },
    fact: { flex: 1, alignItems: "center" },
    factValue: { ...typography.subheading, marginTop: 2 },
    priceRange: { ...typography.caption, marginTop: spacing.sm },
    description: { ...typography.body, marginTop: spacing.lg },
    section: { marginTop: spacing.xl },
    sectionTitle: { ...typography.subheading, marginBottom: spacing.sm },
    chips: { flexDirection: "row", flexWrap: "wrap" },
    actions: { marginTop: spacing.xl },
    gap: { marginTop: spacing.sm },
    hint: { ...typography.caption, textAlign: "center", marginTop: spacing.md }
});

export default VenueDetailsScreen;
