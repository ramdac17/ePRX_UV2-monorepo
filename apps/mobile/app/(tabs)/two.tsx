import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { CYBER_THEME } from "@/constants/Colors";
import { removeToken } from "@/utils/authStorage";

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "TERMINATE_SESSION",
      "Are you sure you want to de-authorize this device?",
      [
        { text: "CANCEL", style: "cancel" },
        {
          text: "LOGOUT",
          style: "destructive",
          onPress: async () => {
            await removeToken(); // Clear the JWT
            router.replace("/(auth)/login"); // Send back to login
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SYSTEM_SETTINGS</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SECURITY_PROTOCOLS</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>TERMINATE_SESSION</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>ePRX UV1 v1.0.0-STABLE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    color: CYBER_THEME.primary,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 40,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingVertical: 20,
  },
  sectionLabel: {
    color: "#666",
    fontSize: 12,
    marginBottom: 15,
    letterSpacing: 1,
  },
  dangerButton: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderWidth: 1,
    borderColor: "#ff4444",
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#ff4444",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  version: {
    color: "#333",
    fontSize: 10,
  },
});
