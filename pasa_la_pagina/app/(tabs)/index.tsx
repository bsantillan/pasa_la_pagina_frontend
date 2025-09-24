import { Buscador } from "@/components/ui/Search";
import { useAuth } from "@/contexts/AuthContext";
import { PublicacionContext, PublicacionProvider } from "@/contexts/PublicacionContext"; // ajusta la ruta
import { useContext, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import HomeCategoria from "../(home)/HomeCategoria";
import HomeCerca from "../(home)/HomeCerca";
import HomeRecomendacion from "../(home)/HomeRecomendacion";

function HomeContent() {
  const { logout } = useAuth();
  const context = useContext(PublicacionContext);

  useEffect(() => {
    context?.fetchPublicaciones(); // carga las publicaciones al montar el componente
  }, []);

  if (!context) return <Text>No hay contexto disponible</Text>;
  if (context.loading) return <Text>Cargando publicaciones...</Text>;
  if (context.error) return <Text>Error: {context.error}</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {context.publicaciones.map((pub) => (
        <View key={pub.id} style={styles.card}>
          <Text style={styles.title}>{pub.titulo}</Text>
          <Text>{pub.descripcion}</Text>
          <Text>Precio: {pub.precio ?? "Gratis"}</Text>
          <Text>Tipo: {pub.tipo}</Text>
          <Text>Usuario ID: {pub.usuario_id}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export default function HomeScreen() {
  return (
    <PublicacionProvider>
      <HomeCerca />
      <HomeRecomendacion />
      <HomeCategoria />
      <Buscador onSelect={(pub) => console.log("Seleccionado:", pub)} />
      <HomeContent />
    </PublicacionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },
});
