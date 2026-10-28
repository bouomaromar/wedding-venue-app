// One place for colours, spacing and type, so every screen looks the same.

export const colors = {
    background: "#FBF8F4",   // warm ivory
    surface: "#FFFFFF",
    text: "#1F1A17",
    textMuted: "#6B625C",
    border: "#E8E1D9",
    primary: "#7A2E46",      // rosewood
    primaryPressed: "#5E2236",
    onPrimary: "#FFFFFF",
    accent: "#B08D57",       // champagne gold
    chip: "#F3ECE4",
    danger: "#B3261E",
    dangerBackground: "#FDECEA",
    success: "#2E7D32",
    successBackground: "#E8F5E9",
    warning: "#8A5A00",
    warningBackground: "#FFF4E0"
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32
};

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999
};

export const typography = {
    title: { fontSize: 26, fontWeight: "700", color: colors.text },
    heading: { fontSize: 20, fontWeight: "700", color: colors.text },
    subheading: { fontSize: 16, fontWeight: "600", color: colors.text },
    body: { fontSize: 15, color: colors.text, lineHeight: 22 },
    caption: { fontSize: 13, color: colors.textMuted }
};

// formats 15000 as "$15,000"
export const formatPrice = (value) => `$${Number(value).toLocaleString("en-US")}`;
