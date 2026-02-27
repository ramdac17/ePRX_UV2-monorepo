// apps/mobile/app/debug/crash-logs.tsx
import { ScrollView, Text, View, StyleSheet, Button } from "react-native";
import { useEffect, useState } from "react";
import { getCrashLogs, clearCrashLogs } from "@/utils/crashLogger";

export default function CrashLogsScreen() {
  const [logs, setLogs] = useState<string[]>([]);

  // Load crash logs on mount
  useEffect(() => {
    const loadLogs = async () => {
      const savedLogs = await getCrashLogs();
      setLogs(savedLogs || []);
    };
    loadLogs();
  }, []);

  const clearLogs = async () => {
    await clearCrashLogs();
    setLogs([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crash Logs</Text>

      {logs.length === 0 ? (
        <Text style={styles.empty}>No crashes logged.</Text>
      ) : (
        <ScrollView style={styles.scroll}>
          {logs.map((log, idx) => (
            <View key={idx} style={styles.logBox}>
              <Text style={styles.logText}>{log}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <Button title="Clear Logs" onPress={clearLogs} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    padding: 16,
  },
  title: {
    color: "#00F0FF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  empty: {
    color: "#FFFFFF",
    fontSize: 16,
    fontStyle: "italic",
  },
  scroll: {
    flex: 1,
    marginBottom: 16,
  },
  logBox: {
    backgroundColor: "#111111",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  logText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "monospace",
  },
});
