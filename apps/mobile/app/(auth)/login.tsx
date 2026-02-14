import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { CYBER_THEME } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import axios from "axios";
import { saveToken } from "@/utils/auth";
import { storeToken } from "@/utils/authStorage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.toLowerCase().trim(),
        password,
      });

      // 1. Extract the token explicitly
      const token = response.data.access_token;

      // 2. ONLY call storeToken if we have a valid string
      if (token && typeof token === "string") {
        await storeToken(token);
        // Ensure there are NO other calls to storeToken() or SecureStore here!

        console.log("ePRX_UV1_SESSION_ESTABLISHED");
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("AUTH_SEQUENCE_INTERRUPTED", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
        <View style={styles.header}>
          <Text style={styles.logoText}>
            ePRX <Text style={{ color: CYBER_THEME.primary }}>UV1</Text>
          </Text>
          <Text style={styles.subtitle}>
            {isLoading ? "VERIFYING_CREDENTIALS..." : "AUTHENTICATION_REQUIRED"}
          </Text>
        </View>

        <View style={styles.glassCard}>
          <Text style={styles.label}>CREDENTIAL_ID</Text>
          <TextInput
            style={styles.input}
            placeholder="USER@SYSTEM.IO"
            placeholderTextColor="#444"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            editable={!isLoading}
          />

          <Text style={styles.label}>ACCESS_CODE</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#444"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              (pressed || isLoading) && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "PROCESSING..." : "INITIALIZE_LOGIN"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryLink}
            onPress={() => router.push("/register")} // Prep for next step
          >
            <Text style={styles.secondaryText}>NEW_USER? [REGISTER_ENTRY]</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    flex: 1,
    backgroundColor: CYBER_THEME.background,
    padding: 25,
    justifyContent: "center",
  },
  glowTop: {
    position: "absolute",
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    backgroundColor: CYBER_THEME.primary,
    borderRadius: 150,
    opacity: 0.1,
  },

  glowBottom: {
    position: "absolute",
    bottom: -120,
    right: -80,
    width: 300,
    height: 300,
    backgroundColor: CYBER_THEME.accent, // Neon Magenta
    borderRadius: 150,
    opacity: 0.15,
    zIndex: -1,
  },

  header: { backgroundColor: "transparent", marginBottom: 40 },
  logoText: {
    fontSize: 42,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
  },
  subtitle: {
    color: CYBER_THEME.primary,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 5,
  },
  glassCard: {
    backgroundColor: CYBER_THEME.card,
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: CYBER_THEME.border,
    shadowColor: CYBER_THEME.primary,
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  label: {
    color: CYBER_THEME.textMuted,
    fontSize: 10,
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "#000",
    color: CYBER_THEME.primary,
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#222",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  button: {
    backgroundColor: CYBER_THEME.primary,
    padding: 18,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    shadowColor: CYBER_THEME.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonText: { color: "#000", fontWeight: "900", letterSpacing: 1 },
  secondaryLink: {
    marginTop: 20,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  secondaryText: { color: CYBER_THEME.textMuted, fontSize: 11 },
});
