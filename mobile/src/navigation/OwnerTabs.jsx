import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import MyVenuesScreen from "../screens/owner/MyVenuesScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { tabScreenOptions } from "./options";

const Tab = createBottomTabNavigator();

// Tab bar for venue owners.
const OwnerTabs = () => (
    <Tab.Navigator screenOptions={tabScreenOptions}>
        <Tab.Screen
            name="MyVenues"
            component={MyVenuesScreen}
            options={{ title: "My Venues", tabBarIcon: icon("business") }}
        />
        <Tab.Screen
            name="Requests"
            component={PlaceholderScreen}
            options={{ title: "Requests", tabBarIcon: icon("mail") }}
            initialParams={{
                title: "Booking requests",
                message: "Requests from couples for your venues will appear here to confirm or decline."
            }}
        />
        <Tab.Screen
            name="Calendar"
            component={PlaceholderScreen}
            options={{ title: "Blocked Dates", tabBarIcon: icon("calendar") }}
            initialParams={{ title: "Blocked dates", message: "Block dates when a venue isn't available." }}
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

export default OwnerTabs;
