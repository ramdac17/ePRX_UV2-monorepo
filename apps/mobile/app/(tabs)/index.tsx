import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  Platform,
  TouchableOpacity,
  Image,
  View, // Use standard View
  Text, // Use standard Text
} from "react-native";
import api from "@/utils/api"; // Use your interceptor, not raw axios
import { CreateFeedbackDto } from "@repo/types";
import { CYBER_THEME } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { User } from "lucide-react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function TabOneScreen() {
  const [user, setUser] = useState<any>(null); // FIXED: Added missing user state
  const [status, setStatus] = useState<string>("SCANNING_NETWORK...");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch User Profile for the Avatar
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUser(res.data);
      } catch (e) {
        console.error("PROFILE_FETCH_ERROR", e);
      }
    };

    // Check System Status
    if (!API_URL) {
      setStatus("CONFIG_ERROR: ENV_MISSING");
    } else {
      api
        .get(`/status`)
        .then((res: any) => {
          const version = res.data?.version || "1.0.0";
          setStatus(`CORE_ONLINE_V${version}`);
        })
        .catch(() => setStatus("CORE_OFFLINE"));
    }

    fetchProfile();
  }, []);

  const sendFeedback = async () => {
    if (!name || !message) {
      Alert.alert("SYSTEM_ERROR", "DATA_FIELDS_EMPTY");
      return;
    }

    setIsSending(true);
    try {
      const payload: CreateFeedbackDto = { name, message };
      await api.post(`/status/feedback`, payload);
      Alert.alert("LINK_ESTABLISHED", "FEEDBACK_SENT_TO_CORE");
      setMessage("");
    } catch (err) {
      Alert.alert("UPLINK_ERROR", "TRANSMISSION_FAILED");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{ backgroundColor: "#000" }} // Force black for Cyberpunk feel
    >
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={styles.avatarContainer}
          >
            {user?.image ? (
              <Image
                source={{ uri: `${API_URL}${user.image}` }}
                style={styles.avatarCircle}
              />
            ) : (
              <View style={[styles.avatarCircle, styles.avatarPlaceholder]}>
                <User color={CYBER_THEME.primary} size={24} />
              </View>
            )}
          </TouchableOpacity>

          <View>
            <Text style={styles.glitchText}>SYSTEM_DASHBOARD</Text>
            <Text style={styles.subTitle}>
              PROJECT_VISTA // {user?.firstName?.toUpperCase() || "OPERATIVE"}
            </Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: status.includes("ONLINE")
                  ? "#00ff00"
                  : "#ff0000",
              },
            ]}
          />
          <Text style={styles.statusText}>{status}</Text>
        </View>

        {/* Dashboard Card */}
        <View style={styles.glassCard}>
          <Text style={styles.label}>TRANSMIT_FEEDBACK</Text>

          <TextInput
            style={styles.input}
            placeholder="OPERATOR_NAME"
            placeholderTextColor="#444"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            placeholder="ENCODE_MESSAGE..."
            placeholderTextColor="#444"
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <Pressable
            onPress={sendFeedback}
            disabled={isSending}
            style={({ pressed }) => [
              styles.button,
              (pressed || isSending) && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.buttonText}>
              {isSending ? "UPLOADING..." : "EXECUTE_TRANSMISSION"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SECURE_NODE: {API_URL?.replace("http://", "")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10, // Reduced to make room for status badge
    gap: 15,
  },
  glitchText: {
    color: CYBER_THEME.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  subTitle: {
    color: "#666",
    fontSize: 10,
    fontWeight: "bold",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#222",
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  statusText: {
    fontSize: 9,
    color: "#aaa",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  glassCard: {
    backgroundColor: "#0a0a0a",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#222",
  },
  label: {
    color: CYBER_THEME.primary,
    fontSize: 10,
    marginBottom: 15,
    letterSpacing: 2,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  button: {
    backgroundColor: CYBER_THEME.primary,
    padding: 18,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "#000", fontWeight: "900", letterSpacing: 1 },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: { color: "#333", fontSize: 10, fontFamily: "monospace" },
  avatarContainer: {
    borderWidth: 1,
    borderColor: CYBER_THEME.primary,
    padding: 2,
    borderRadius: 25,
  },
  avatarCircle: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
});
