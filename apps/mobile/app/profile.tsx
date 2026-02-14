import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "@/utils/api";
import { CYBER_THEME } from "@/constants/Colors";
import { Camera, Save, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);

    const formData = new FormData();
    const filename = uri.split("/").pop() || "avatar.jpg";

    // React Native requires this specific object structure for FormData
    // @ts-ignore
    formData.append("file", {
      uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
      name: filename,
      type: "image/jpeg", // Force type for consistency
    });

    try {
      // Try removing the leading slash if you have a base URL prefix
      const response = await api.post(
        "http://192.168.0.152:3000/api/auth/upload-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      Alert.alert("SYSTEM_SYNC", "PROFILE_IMAGE_UPDATED");
      // Optionally refresh user data here
    } catch (error: any) {
      console.error("404_DEBUG:", error.config.url); // This will show exactly where it tried to go
      Alert.alert("LINK_ERROR", `CODE_${error.response?.status || "404"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 4. The Back Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={CYBER_THEME.primary} />
          <Text style={styles.backText}>RETURN_TO_DASHBOARD</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topSection}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarFrame}>
          <Image
            source={{ uri: image || "https://via.placeholder.com/150" }}
            style={styles.avatar}
          />
          <View style={styles.cameraIcon}>
            <Camera size={16} color="#000" />
          </View>
        </TouchableOpacity>

        <View style={styles.nameSection}>
          <Text style={styles.firstName}>KYO</Text>
          <Text style={styles.lastName}>KYO</Text>
          <Text style={styles.rank}>RANK: ROOT_ADMIN</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Additional UI elements */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20, paddingTop: 60 },
  topSection: { flexDirection: "row", alignItems: "center", gap: 20 },
  avatarFrame: {
    width: 100,
    height: 100,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: CYBER_THEME.primary,
    padding: 5,
  },
  avatar: { width: "100%", height: "100%" },
  cameraIcon: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: CYBER_THEME.primary,
    padding: 5,
    borderRadius: 10,
  },
  nameSection: { flex: 1 },
  firstName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
  },
  lastName: {
    color: CYBER_THEME.primary,
    fontSize: 24,
    fontWeight: "900",
    marginTop: -5,
  },
  rank: { color: "#666", fontSize: 10, marginTop: 5 },
  divider: { height: 1, backgroundColor: "#222", marginVertical: 30 },

  navHeader: {
    marginBottom: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#222",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  backText: {
    color: CYBER_THEME.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
