// apps/mobile/app/_layout.tsx
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCrashLogs, logCrash } from "@/utils/crashLogger";
import { LogBox } from "react-native";
import { getToken } from "@/utils/authStorage";

LogBox.ignoreLogs([
  "Require cycle:",
  "Non-serializable values were found in the navigation state",
]);

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

// --- Crash Boundary Component ---
export function CrashBoundary({ children }: { children: React.ReactNode }) {
  const routerRef = useRef<ReturnType<typeof useRouter> | null>(null);

  useEffect(() => {
    const originalHandler = (global as any).ErrorUtils?.getGlobalHandler?.();

    (global as any).ErrorUtils?.setGlobalHandler?.(
      async (error: any, isFatal: boolean) => {
        console.error("FATAL_CRASH", error);

        // Log the crash
        await logCrash(error);

        const logs = await getCrashLogs();
        if (logs?.length && routerRef.current) {
          // Navigate safely to crash logs
          try {
            routerRef.current.push("/debug/crash-logs" as any);
          } catch (_) {}
        }

        // Call original handler (still crashes in dev)
        originalHandler?.(error, isFatal);
      },
    );
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const crashQueue = useRef<boolean>(false);
  const checkAuth = async () => {
    try {
      const token = await getToken();
      setHasToken(!!token);
    } catch {
      setHasToken(false);
    } finally {
      setIsAuthLoaded(true);
    }
  };
  // Store router in CrashBoundary
  const routerRef = useRef(router);

  // --- Safe Global crash handler (Queue crashes until router ready) ---
  useEffect(() => {
    const originalHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
    (global as any).ErrorUtils?.setGlobalHandler?.(
      async (error: any, isFatal: boolean) => {
        await logCrash(error);
        originalHandler?.(error, isFatal);

        const logs = await getCrashLogs();
        if (!logs?.length) return;

        // Queue navigation until router ready
        if (segments.length > 0) {
          router.push("/debug/crash-logs" as any);
        } else {
          crashQueue.current = true;
        }
      },
    );
  }, []);

  // --- Process queued crashes ---
  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!segments.length) return; // ⭐ CRITICAL FIX

    const inAuthGroup = segments[0] === "(auth)";

    if (!hasToken && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (hasToken && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [hasToken, isAuthLoaded, segments]);

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

  if (!isAuthLoaded) return null; // Prevent flicker

  return (
    <CrashBoundary>
      <ThemeProvider value={MyCyberTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
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
