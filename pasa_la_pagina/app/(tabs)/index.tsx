// HomeScreen.tsx - versión corregida
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicacion } from "@/contexts/PublicacionContext";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const { accessToken } = useAuth(); // 👈 Añade accessToken
  const { loading, fetchCercaTuyo, error } = usePublicacion();
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // 👇 Solo cargar datos cuando el token esté disponible
  useEffect(() => {
    if (accessToken) {
      fetchCercaTuyo().finally(() => setInitialLoad(false));
    } else {
      setInitialLoad(false);
    }
  }, [accessToken, fetchCercaTuyo]);

  const onRefresh = async () => {
    if (accessToken) {
      setRefreshing(true);
      await fetchCercaTuyo();
      setRefreshing(false);
    }
  };

  // 👇 Mostrar loading mientras se verifica la autenticación
  if (initialLoad) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 👇 Redirigir si no hay token (aunque esto debería manejarse en AuthGate)
  if (!accessToken) {
    router.replace("/login");
    return null;
  }

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

        {/* Mostrar error si lo hay */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error al cargar publicaciones</Text>
            <TouchableOpacity onPress={() => fetchCercaTuyo()}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CercaTuyo />
            <LibrosRecientes />
            <ApuntesRecientes />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background},
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
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
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  retryText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});