import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicacion } from "@/contexts/PublicacionContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ApuntesRecientes from "../home/homeApunte";
import CercaTuyo from "../home/homeCercaTuyo";
import LibrosRecientes from "../home/homeLibro";

export default function HomeScreen() {
  const { logout } = useAuth();
  const { loading, fetchCercaTuyo } = usePublicacion();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCercaTuyo(); // fetch inicial solo una vez
  }, [fetchCercaTuyo]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCercaTuyo();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
          />
        }
      >
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#999"
                style={{ marginRight: 8 }}
              />
              <TouchableOpacity
                onPress={()=> router.push(`/listado`)}
                style={{width: "100%"}}
              >
                <Text>Buscar publicaciones...</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Secciones */}

        <CercaTuyo />
        <LibrosRecientes />
        <ApuntesRecientes />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  logoutButton: { marginLeft: 12, padding: 8, borderRadius: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 40,
  },
  input: { flex: 1, height: "100%" },
});
