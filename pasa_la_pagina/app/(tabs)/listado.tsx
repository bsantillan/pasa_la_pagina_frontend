// ListadoScreen.tsx
import FilterModal from "@/components/ui/FilterModal";
import { ProductCard } from "@/components/ui/ProductCard";
import { Colors } from "@/constants/Colors";
import { usePublicacion } from "@/contexts/PublicacionContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ListadoScreen() {
  const {
    publicaciones,
    loading,
    error,
    aplicarFiltros,
    limpiarFiltros,
    buscarPorTexto,
    currentPage,
    totalPages,
    hasMore,
    loadMore,
    resetPagination,
    getUserLocation,
  } = usePublicacion();

  const [localLoading, setLocalLoading] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const cargarInicial = async () => {
      setLocalLoading(true);
      try {
        await limpiarFiltros();
      } catch (err) {
        console.error(err);
      } finally {
        setLocalLoading(false);
      }
    };
    cargarInicial();
  }, [limpiarFiltros]);

  // 👇 Abrir teclado automáticamente
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    const mainTimeout = setTimeout(focusInput, 200);
    const backupTimeout = setTimeout(focusInput, 500);
    return () => {
      clearTimeout(mainTimeout);
      clearTimeout(backupTimeout);
    };
  }, []);

  // 👇 Datos a mostrar = exactamente lo que devuelve el backend
  const dataToShow = publicaciones;

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

  const screenWidth = Dimensions.get("window").width;
  const cardMargin = 8;
  const columns = 2;
  const cardWidth = (screenWidth - cardMargin * (columns * 2 + 1)) / columns;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background }}
      edges={["top"]}
    >
      <View style={{ padding: 8, paddingTop: 8, flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          {/* Botón de volver */}
          <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </Pressable>

          {/* Barra de búsqueda */}
          <TextInput
            ref={inputRef}
            autoFocus={true}
            style={[styles.input, { flex: 1, marginHorizontal: 8 }]}
            placeholder="Buscar publicaciones..."
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (text.trim() === "") {
                limpiarFiltros();
              }
            }}
            onSubmitEditing={() => {
              if (query.trim().length >= 2) {
                buscarPorTexto(query);
              }
            }}
          />
          

          {/* Botón de filtros */}
          <Pressable
            onPress={() => setShowFilters(true)}
            style={{ padding: 8 }}
          >
            <Ionicons name="funnel" size={24} color={Colors.primary} />
          </Pressable>

        </View>

        {/* Modal de filtros */}
        <FilterModal
          visible={showFilters}
          onClose={() => setShowFilters(false)}
        />

        {dataToShow.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No se encontraron publicaciones.
          </Text>
        ) : (
          <FlatList
            data={dataToShow}
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
              if (hasMore && !loading) {
                loadMore();
              }
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
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: Colors.white,
  },
});
