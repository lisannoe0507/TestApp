import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import DiscoverScreen from "../screens/DiscoverScreen";
import SavedScreen from "../screens/SavedScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { colors, fontFamily } from "../theme";

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.brand,
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontFamily: fontFamily.medium, fontSize: 11 },
          tabBarIcon: ({ color, size, focused }) => {
            const icons: Record<string, string> = {
              Ontdekken: focused ? "git-branch" : "git-branch-outline",
              Opgeslagen: focused ? "bookmark" : "bookmark-outline",
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
