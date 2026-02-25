import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCrashLogs, logCrash } from "@/utils/crashLogger";
import { CrashBoundary } from "@/components/CrashBoundary";

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
  const crashQueue = useRef<any[]>([]); // Queue for crashes before router ready

  // --- Safe Global crash handler ---
  useEffect(() => {
    const originalHandler = (global as any).ErrorUtils?.getGlobalHandler?.();

    (global as any).ErrorUtils?.setGlobalHandler?.(
      async (error: any, isFatal: boolean) => {
        logCrash(error);
        originalHandler?.(error, isFatal);

        const logs = await getCrashLogs();
        if (!logs?.length) return;

        // If router is ready, navigate immediately
        if (segments.length > 0) {
          router.push("debug/crash-logs" as any);
        } else {
          // Queue it until router is ready
          crashQueue.current.push(true);
        }
      },
    );
  }, []);

  // Process crash queue once auth check & router ready
  useEffect(() => {
    if (!isAuthLoaded) return;
    if (crashQueue.current.length > 0) {
      router.push("debug/crash-logs" as any);
      crashQueue.current = [];
    }
  }, [isAuthLoaded, segments]);

  // --- Initial Auth Check ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        setHasToken(!!token);
      } catch {
        setHasToken(false);
      } finally {
        setIsAuthLoaded(true);
      }
    };
    checkAuth();
  }, [segments]);

  // --- Navigation Guard ---
  useEffect(() => {
    if (!isAuthLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!hasToken && !inAuthGroup) {
      router.replace("/login");
    } else if (hasToken && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [hasToken, isAuthLoaded, segments]);

  if (!isAuthLoaded) return null;

  return (
    <CrashBoundary>
      <ThemeProvider value={MyCyberTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="debug/crash-logs"
            options={{ presentation: "modal" }}
          />
        </Stack>
      </ThemeProvider>
    </CrashBoundary>
  );
}
