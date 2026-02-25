import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { getCrashLogs } from "@/utils/crashLogger";

export default function CrashLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    getCrashLogs().then(setLogs);
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#000", padding: 20 }}>
      {logs.map((l, i) => (
        <Text key={i} style={{ color: "#0ff", marginBottom: 20 }}>
          {l.date}
          {"\n"}
          {l.message}
          {"\n"}
          {l.stack}
        </Text>
      ))}
    </ScrollView>
  );
}
