import "../polyfills";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from "react-native";

// 1. Move logic out of global scope where possible
LogBox.ignoreLogs(["Require cycle:", "Non-serializable values"]);

const MyCyberTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#050505",
    card: "#050505",
    text: "#FFFFFF",
    primary: "#00F0FF",
    border: "rgba(0, 240, 255, 0.3)",
  },
};

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // --- Single Auth Check ---
  useEffect(() => {
    async function initAuth() {
      try {
        const token = await AsyncStorage.getItem("userToken");
        setHasToken(!!token);
      } catch (e) {
        setHasToken(false);
      } finally {
        setIsAuthLoaded(true);
      }
    }
    initAuth();
  }, []);

  // --- Consolidated Navigation Guard ---
  useEffect(() => {
    if (!isAuthLoaded) return;

    // segments[0] can be undefined on boot, check carefully
    const inAuthGroup = segments[0] === "(auth)";

    if (!hasToken && !inAuthGroup) {
      // Use the full path to avoid routing errors
      router.replace("/(auth)/login");
    } else if (hasToken && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [hasToken, isAuthLoaded, segments]);

  // If we haven't checked the token, stay on the splash screen
  // This prevents the "flash and crash"
  if (!isAuthLoaded) return null;

  return (
    <ThemeProvider value={MyCyberTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="debug/crash-logs"
          options={{ presentation: "modal" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
