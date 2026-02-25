import AsyncStorage from "@react-native-async-storage/async-storage";

const CRASH_KEY = "APP_CRASH_LOG";

export const logCrash = async (error: any) => {
  try {
    const existing = await AsyncStorage.getItem(CRASH_KEY);
    const logs = existing ? JSON.parse(existing) : [];

    logs.push({
      message: error?.message || "Unknown error",
      stack: error?.stack || "",
      date: new Date().toISOString(),
    });

    await AsyncStorage.setItem(CRASH_KEY, JSON.stringify(logs.slice(-20)));
  } catch {}
};

export const getCrashLogs = async () => {
  const logs = await AsyncStorage.getItem(CRASH_KEY);
  return logs ? JSON.parse(logs) : [];
};

export const clearCrashLogs = () => AsyncStorage.removeItem(CRASH_KEY);
