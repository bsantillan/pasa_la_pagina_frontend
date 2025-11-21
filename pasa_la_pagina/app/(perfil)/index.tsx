// PerfilScreen.tsx - versión corregida
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "../../components/ui/Avatar";
import { ProductCard } from "../../components/ui/ProductCard";
import { ReviewCard } from "../../components/ui/ReviewCard";
import { Colors } from "../../constants/Colors";
import { usePublicacion } from "../../contexts/PublicacionContext"; // 👈 Solo el hook
import { useUser } from "../../contexts/UserContext";

const filtros = ["Reseñas", "Publicaciones", "Historial"];

export default function PerfilScreen() {
  const { usuario, reseniasRecibidas, reseniasHechas, loading: userLoading } = useUser();
  const { pubsUser, fetchPublicacionesByUsuario, loading, error } = usePublicacion();
  const [selectedFiltro, setSelectedFiltro] = useState(filtros[0]);

  useEffect(() => {
    if (usuario?.id) {
      fetchPublicacionesByUsuario(usuario.id);
    }
  }, [fetchPublicacionesByUsuario, usuario]);

  if (userLoading || loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
  if (error) return <Text style={{ color: "red" }}>Error: {error}</Text>;

  const renderPublicaciones = () => {
    if (!pubsUser.length) {
      return (
        <Text style={{ color: Colors.disabled_primary, textAlign: "center", marginTop: 10 }}>
          No tiene publicaciones aún.
        </Text>
      );
    }

    return pubsUser.map((p) => (
      <View key={p.id} style={styles.row}>
        <ProductCard
          title={p.titulo}
          description={p.descripcion}
          imageUrl={p.fotos_url[0] || ""}
        />
      </View>
    ));
  };

  const renderResenias = () => {
    if (!reseniasRecibidas.length) {
      return <Text style={{ color: Colors.disabled_primary, textAlign: "center", marginTop: 10 }}>No tiene reseñas recibidas aún.</Text>;
    }

    return reseniasRecibidas.map((r) => (
      <ReviewCard
        key={r.id}
        username={r.autorNombre}
        headline={`Valoración: ${r.valoracion}`}
        description={r.descripcion}
        date=""
      />
    ));
  };

  const renderHistorial = () => (
    <View>
      <Text style={styles.historialTitulo}>Reseñas hechas</Text>
      {reseniasHechas.length ? (
        reseniasHechas.map((r) => (
          <ReviewCard
            key={r.id}
            username={r.autorNombre}
            headline={`Valoración: ${r.valoracion}`}
            description={r.descripcion}
            date=""
          />
        ))
      ) : (
        <Text style={{ color: Colors.disabled_primary, textAlign: "center", marginTop: 10 }}>No ha hecho reseñas aún.</Text>
      )}
      <Text style={styles.historialTitulo}>Contactos</Text>
      <Text style={{ color: Colors.disabled_primary, textAlign: "center", marginTop: 10 }}>
        Funcionalidad aún no implementada
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar name={usuario?.nombre || "U"} size={80} />
        <Text style={styles.nombre}>
          {usuario?.nombre} {usuario?.apellido}
        </Text>

        <View style={styles.filtrosContainer}>
          {filtros.map((filtro) => (
            <TouchableOpacity
              key={filtro}
              onPress={() => setSelectedFiltro(filtro)}
              style={[
                styles.filtroBtn,
                selectedFiltro === filtro && styles.filtroBtnActivo,
              ]}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  selectedFiltro === filtro && styles.filtroTextoActivo,
                ]}
              >
                {filtro}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.contenido} showsVerticalScrollIndicator={false}>
        {selectedFiltro === "Publicaciones"
          ? renderPublicaciones()
          : selectedFiltro === "Reseñas"
            ? renderResenias()
            : renderHistorial()}
      </ScrollView>
    </View>
  );
}

// ------------------ ESTILOS ------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", paddingVertical: 16 },
  nombre: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
    color: Colors.text,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 40,
    marginHorizontal: 8
  },
  filtrosContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  filtroBtn: {
    borderRadius: 20,
    backgroundColor: Colors.disabled_primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 4,
  },
  filtroBtnActivo: {
    backgroundColor: Colors.primary,
  },
  filtroTexto: {
    fontSize: 14,
    color: Colors.primary,
  },
  filtroTextoActivo: {
    color: Colors.background,
    fontWeight: "600",
  },
  contenido: { flex: 1, paddingHorizontal: 12 },
  row: {
    marginBottom: 12,
    alignItems: "center",
  },
  historialTitulo: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
    color: Colors.text,
  },
});