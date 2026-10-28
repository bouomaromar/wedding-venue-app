import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ExploreScreen from "../screens/venues/ExploreScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { tabScreenOptions } from "./options";

const Tab = createBottomTabNavigator();

// Tab bar for couples (admins use it too for now: moderation is done through the API).
const CoupleTabs = () => (
    <Tab.Navigator screenOptions={tabScreenOptions}>
        <Tab.Screen
            name="Explore"
            component={ExploreScreen}
            options={{ tabBarIcon: icon("search") }}
        />
        <Tab.Screen
            name="ForYou"
            component={PlaceholderScreen}
            options={{ title: "For You", tabBarIcon: icon("sparkles") }}
            initialParams={{
                title: "Recommendations",
                message: "Venues ranked for your budget, guest count and style will appear here."
            }}
        />
        <Tab.Screen
            name="Favorites"
            component={PlaceholderScreen}
            options={{ tabBarIcon: icon("heart") }}
            initialParams={{ title: "Favorites", message: "Venues you save will appear here." }}
        />
        <Tab.Screen
            name="Bookings"
            component={PlaceholderScreen}
            options={{ tabBarIcon: icon("calendar") }}
            initialParams={{ title: "Your bookings", message: "Your booking requests and their status will appear here." }}
        />
        <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ tabBarIcon: icon("person-circle") }}
        />
    </Tab.Navigator>
);

const icon = (name) => ({ color, size, focused }) => (
    <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />
);

export default CoupleTabs;
