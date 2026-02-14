import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { getToken } from "@/utils/auth";

const MyCyberTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#050505",
    card: "#050505",
    text: "#FFFFFF",
    primary: "#00F0FF", // Neon Cyan
    border: "rgba(0, 240, 255, 0.3)",
  },
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      const inAuthGroup = segments[0] === "(auth)";

      if (!token && !inAuthGroup) {
        // No token and trying to access tabs? Go to Login.
        router.replace("/login");
      } else if (token && inAuthGroup) {
        // Has token and at login? Go to Dashboard.
        router.replace("/(tabs)");
      }
      setIsReady(true);
    };

    checkAuth();
  }, [segments]);

  if (!isReady) return null; // Or a Cyberpunk loading spinner

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" options={{ animation: "fade" }} />
      <Stack.Screen name="(tabs)" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
