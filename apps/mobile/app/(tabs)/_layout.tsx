import React from "react";
import { Tabs } from "expo-router";
import { Chrome as TabIcon, Settings, Home } from "lucide-react-native";
import { CYBER_THEME } from "@/constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: CYBER_THEME.primary,
        tabBarInactiveTintColor: "#444",
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopWidth: 1,
          borderTopColor: "#222",
          height: 60,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "bold",
          letterSpacing: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "DASHBOARD",
          tabBarIcon: ({ color }) => <Home size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "SETTINGS",
          tabBarIcon: ({ color }) => <Settings size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
