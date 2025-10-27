import { PublicacionCarousel } from "@/components/ui/PublicacionCarousel";
import { Colors } from "@/constants/Colors";
import { usePublicacion } from "@/contexts/PublicacionContext";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ApuntesRecientes() {
  const { publicaciones, loading, error } = usePublicacion();

  const ultimosApuntes = useMemo(() => {
    return (publicaciones ?? [])
      .filter(pub => pub.tipo === "apunte")
      .sort((a, b) => b.id - a.id)
      .slice(0, 10);
  }, [publicaciones]);

  if (loading) return <Text>Cargando...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Apuntes recientes</Text>
      <Text style={styles.sectionDesc}>Últimos apuntes subidos</Text>
      <PublicacionCarousel
        publicaciones={ultimosApuntes}
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
    paddingHorizontal: 16 
  },
  sectionDesc: { 
    fontSize: 14, 
    color: "#666", 
    marginLeft: 26, 
    marginBottom: 8,
  },
});
