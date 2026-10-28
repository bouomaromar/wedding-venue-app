import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ExploreScreen from "../screens/venues/ExploreScreen";
import VenueDetailsScreen from "../screens/venues/VenueDetailsScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import LoadingView from "../components/LoadingView";
import CoupleTabs from "./CoupleTabs";
import OwnerTabs from "./OwnerTabs";
import useAuth from "../store/useAuth";
import { navigationTheme, stackScreenOptions } from "./options";

const Stack = createNativeStackNavigator();

// Reads the session and shows one of three sets of screens:
//   signed out -> login / register / browse as guest
//   couple     -> couple tab bar      (admins too, for now)
//   owner      -> owner tab bar
// Venue details is shared and opens on top of whichever set is showing.
// When `user` changes (login, logout, session expired) React Navigation
// switches sets automatically.
const RootNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingView />;
    }

    return (
        <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator screenOptions={stackScreenOptions}>
                {!user ? (
                    <Stack.Group>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Sign up" }} />
                        <Stack.Screen name="GuestExplore" component={ExploreScreen} options={{ title: "Venues" }} />
                    </Stack.Group>
                ) : user.role === "owner" ? (
                    <Stack.Group>
                        <Stack.Screen name="OwnerHome" component={OwnerTabs} options={{ headerShown: false }} />
                        <Stack.Screen
                            name="VenueForm"
                            component={PlaceholderScreen}
                            options={{ title: "Add venue" }}
                            initialParams={{ title: "Venue form", message: "The create / edit venue form comes next." }}
                        />
                    </Stack.Group>
                ) : (
                    <Stack.Screen name="CoupleHome" component={CoupleTabs} options={{ headerShown: false }} />
                )}

                <Stack.Screen name="VenueDetails" component={VenueDetailsScreen} options={{ title: "" }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
