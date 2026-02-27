import * as SecureStore from "expo-secure-store";

const CRASH_LOG_KEY = "eprx_crash_logs";

export async function logCrash(error: any) {
  try {
    const oldLogs = await getCrashLogs();
    const timestamp = new Date().toISOString();
    const newLog = {
      timestamp,
      message: error?.message || String(error),
      stack: error?.stack || "No stack available",
    };

    // Keep only last 50 crashes
    const updatedLogs = [newLog, ...(oldLogs || [])].slice(0, 50);
    await SecureStore.setItemAsync(CRASH_LOG_KEY, JSON.stringify(updatedLogs));
  } catch (e) {
    console.error("CRASH_LOGGING_FAILED", e);
  }
}

export async function getCrashLogs() {
  try {
    const logsStr = await SecureStore.getItemAsync(CRASH_LOG_KEY);
    return logsStr ? JSON.parse(logsStr) : [];
  } catch (e) {
    console.error("CRASH_LOG_RETRIEVAL_FAILED", e);
    return [];
  }
}

export async function clearCrashLogs() {
  try {
    await SecureStore.deleteItemAsync(CRASH_LOG_KEY);
  } catch (e) {
    console.error("CRASH_LOG_CLEAR_FAILED", e);
  }
}
