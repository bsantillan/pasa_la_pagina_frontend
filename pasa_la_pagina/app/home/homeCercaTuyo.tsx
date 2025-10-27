import { PublicacionCarousel } from "@/components/ui/PublicacionCarousel";
import { Colors } from "@/constants/Colors";
import { usePublicacion } from "@/contexts/PublicacionContext";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function CercaTuyo() {
  const { publicaciones, loading, error } = usePublicacion();

  if (loading) return <Text style={styles.loading}>Cargando...</Text>;
  if (error) return <Text style={styles.error}>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Cerca tuyo</Text>
      <Text style={styles.sectionDesc}>Publicaciones que se encuentran cerca tuyo</Text>
      <PublicacionCarousel
        publicaciones={publicaciones}
        onSelect={(pub) => router.push(`/(tabs)/visualizarPublicacion?id=${pub.id}`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
    marginLeft: 8,
    paddingHorizontal: 16,
  },
  sectionDesc: { fontSize: 14, color: "#666", marginLeft: 26, marginBottom: 8 },
  loading: { textAlign: "center", marginVertical: 16 },
  error: { textAlign: "center", marginVertical: 16, color: "red" },
});
