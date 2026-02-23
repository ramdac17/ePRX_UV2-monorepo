import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import api from "@/utils/api";
import { CYBER_THEME } from "@/constants/Colors";
import { Activity, ChevronRight } from "lucide-react-native";
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
      const res = await api.get("/activities");
      console.log("HISTORY_DATA_RECEIVED:", res.data);
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
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/activity-detail" as any,
          params: { id: item.id },
        })
      }
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()} //{" "}
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text style={styles.titleText}>
            {item.title || "UNNAMED_MISSION"}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>DIST</Text>
          <Text style={styles.statValue}>
            {parseFloat(item.distance).toFixed(2)}km
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>PACE</Text>
          <Text style={styles.statValue}>{item.pace || "0.00"}</Text>
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
      {/* Header Section */}
      <View style={styles.header}>
        <Activity color={CYBER_THEME.primary} size={24} />
        <Text style={styles.headerTitle}>MISSION_LOGS</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={CYBER_THEME.primary} size="large" />
          <Text style={styles.loadingText}>FETCHING_LOGS...</Text>
        </View>
      ) : activities.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>NO_DATA_FOUND. START_TRAINING.</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  list: {
    flex: 1, // Crucial for scrolling
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dateText: {
    color: "#444",
    fontSize: 10,
    fontWeight: "bold",
  },
  titleText: {
    color: CYBER_THEME.primary,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
    textTransform: "uppercase",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stat: {
    alignItems: "flex-start",
  },
  statLabel: {
    color: "#666",
    fontSize: 9,
    fontWeight: "bold",
  },
  statValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: CYBER_THEME.primary,
    marginTop: 10,
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#333",
    fontWeight: "bold",
  },
});
