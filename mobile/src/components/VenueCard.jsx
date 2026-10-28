import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import StatusBadge from "./StatusBadge";
import { colors, formatPrice, radius, spacing, typography } from "../theme";

// One venue in a list. Set showStatus on the owner's screen to see approval status.
const VenueCard = ({ venue, onPress, showStatus = false }) => (
    <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${venue.name}, ${venue.region}`}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
        {venue.coverUrl ? (
            <Image source={{ uri: venue.coverUrl }} style={styles.cover} accessibilityIgnoresInvertColors />
        ) : (
            <View style={[styles.cover, styles.coverPlaceholder]}>
                <Text style={typography.caption}>No photo yet</Text>
            </View>
        )}

        <View style={styles.body}>
            <View style={styles.titleRow}>
                <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>
                {venue.isFeatured && <Text style={styles.featured}>Featured</Text>}
            </View>

            <Text style={typography.caption}>
                {venue.region} · {venue.capacityMin}–{venue.capacityMax} guests
            </Text>
            <Text style={styles.price}>
                {formatPrice(venue.priceMin)} – {formatPrice(venue.priceMax)}
            </Text>

            {showStatus && <View style={styles.status}><StatusBadge status={venue.status} /></View>}
        </View>
    </Pressable>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
        marginBottom: spacing.lg
    },
    pressed: { opacity: 0.85 },
    cover: { width: "100%", aspectRatio: 16 / 9, backgroundColor: colors.chip },
    coverPlaceholder: { alignItems: "center", justifyContent: "center" },
    body: { padding: spacing.md },
    titleRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.xs },
    name: { ...typography.subheading, flexShrink: 1 },
    featured: {
        marginLeft: spacing.sm,
        fontSize: 11,
        fontWeight: "700",
        color: colors.accent,
        textTransform: "uppercase"
    },
    price: { marginTop: spacing.xs, fontSize: 14, fontWeight: "600", color: colors.primary },
    status: { marginTop: spacing.sm }
});

export default VenueCard;
