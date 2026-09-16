import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import DiscoverScreen from "../screens/DiscoverScreen";
import SavedScreen from "../screens/SavedScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: "#0d0d0f", borderTopColor: "#1c1c1e" },
          tabBarActiveTintColor: "#6366F1",
          tabBarInactiveTintColor: "#6b7280",
          tabBarIcon: ({ color, size, focused }) => {
            const icons: Record<string, string> = {
              Ontdekken: focused ? "flame" : "flame-outline",
              Opgeslagen: focused ? "heart" : "heart-outline",
              Instellingen: focused ? "settings" : "settings-outline",
            };
            return <Ionicons name={icons[route.name] as any} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Ontdekken" component={DiscoverScreen} />
        <Tab.Screen name="Opgeslagen" component={SavedScreen} />
        <Tab.Screen name="Instellingen" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
