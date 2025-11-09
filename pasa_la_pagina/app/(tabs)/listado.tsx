// ListadoScreen.tsx
import { ProductCard } from "@/components/ui/ProductCard";
import { Colors } from "@/constants/Colors";
import { usePublicacion } from "@/contexts/PublicacionContext";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ListadoScreen() {
  const {
    publicaciones,
    loading,
    error,
    cargarinicial,
    hasMore,
    loadMore,
  } = usePublicacion();

  const [localLoading, setLocalLoading] = useState(false);

  // 👇 Inicializar pantalla y abrir modal si viene query
  useEffect(() => {
    const cargarInicial = async () => {
      setLocalLoading(true);
      try {
        await cargarinicial();
      } catch (err) {
        console.error(err);
      } finally {
        setLocalLoading(false);
      }
    };
    cargarInicial();
  }, [cargarinicial]);

  const screenWidth = Dimensions.get("window").width;
  const cardMargin = 8;
  const columns = 2;
  const cardWidth = (screenWidth - cardMargin * (columns * 2 + 1)) / columns;

  if (loading || localLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Cargando publicaciones...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background }}
      edges={["top"]}
    >
      <View style={{ flex: 1, padding: 8, paddingTop: 8 }}>

        {publicaciones.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No se encontraron publicaciones.
          </Text>
        ) : (
          <FlatList
            data={publicaciones}
            keyExtractor={(item) => item.id.toString()}
            numColumns={columns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 12 }}
            renderItem={({ item, index }) => {
              const isLeft = index % columns === 0;
              const isRight = index % columns === 1;
              return (
                <Pressable
                  onPress={() =>
                    router.push(`/(tabs)/visualizarPublicacion?id=${item.id}`)
                  }
                  style={{
                    width: cardWidth,
                    marginLeft: isLeft ? 0 : cardMargin / 2,
                    marginRight: isRight ? 0 : cardMargin / 2,
                    marginBottom: cardMargin,
                  }}
                >
                  <ProductCard
                    imageUrl={item.fotos_url?.[0] ?? ""}
                    title={item.titulo}
                    description={item.descripcion}
                    width={cardWidth}
                  />
                </Pressable>
              );
            }}
            onEndReached={() => {
              if (hasMore && !loading) loadMore();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              hasMore && loading ? (
                <View style={{ padding: 20 }}>
                  <ActivityIndicator size="small" color="#007AFF" />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});