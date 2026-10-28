import { DefaultTheme } from "@react-navigation/native";
import { colors } from "../theme";

// React Navigation theme built from our colours (headers, tab bar, backgrounds).
export const navigationTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border
    }
};

export const stackScreenOptions = {
    headerTintColor: colors.primary,
    headerTitleStyle: { color: colors.text },
    headerBackButtonDisplayMode: "minimal"
};

export const tabScreenOptions = {
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    headerTitleStyle: { color: colors.text }
};
