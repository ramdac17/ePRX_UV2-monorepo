import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import api from "@/utils/api";
import { CYBER_THEME } from "@/constants/Colors";
import { Activity, ChevronRight, Clock, MapPin } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function ActivityHistoryScreen() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get("/activities"); // Ensure your backend has this GET route
      setActivities(res.data);
    } catch (error) {
      console.error("HISTORY_FETCH_ERROR", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({ pathname: "/activity-detail", params: { id: item.id } })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()} //{" "}
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        <Text style={styles.titleText}>{item.title || "UNNAMED_MISSION"}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>DIST</Text>
          <Text style={styles.statValue}>{item.distance}km</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>PACE</Text>
          <Text style={styles.statValue}>{item.pace}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>TIME</Text>
          <Text style={styles.statValue}>
            {Math.floor(item.duration / 60)}m
          </Text>
        </View>
        <ChevronRight color={CYBER_THEME.primary} size={20} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Activity color={CYBER_THEME.primary} size={24} />
        <Text style={styles.headerTitle}>MISSION_LOGS</Text>
      </View>

      {activities.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>NO_DATA_FOUND. START_TRAINING.</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2,
  },
  listContent: { padding: 20 },
  card: {
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  cardHeader: { marginBottom: 10 },
  dateText: { color: "#444", fontSize: 10, fontWeight: "bold" },
  titleText: {
    color: CYBER_THEME.primary,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stat: { alignItems: "flex-start" },
  statLabel: { color: "#666", fontSize: 9, fontWeight: "bold" },
  statValue: { color: "#fff", fontSize: 16, fontWeight: "900" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#333", fontWeight: "bold" },
});
