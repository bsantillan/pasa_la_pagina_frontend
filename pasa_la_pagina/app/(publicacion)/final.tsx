import { useAuth } from "@/contexts/AuthContext";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, ScrollView, Image } from "react-native";

export default function FinalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { getValidAccessToken } = useAuth();

  useEffect(() => {
    const fetchPublicacion = async () => {
      try {
        const access = await getValidAccessToken();
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}publicacion/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicacion();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Título */}
      <Text style={styles.title}>{data?.titulo}</Text>

      {/* Carrusel de imágenes */}
      {data?.fotos_url?.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
        >
          {data.fotos_url.map((uri: string, index: number) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      {/* Descripción */}
      <Text style={styles.subtitle}>{data?.descripcion}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  carousel: {
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 150,
    marginRight: 10,
    borderRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
  },
});
