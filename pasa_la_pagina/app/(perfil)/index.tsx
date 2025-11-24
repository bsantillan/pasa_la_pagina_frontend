// PerfilScreen.tsx - versión corregida
import ReviewModal from "@/components/ui/ReviewModal";
import { SolicitudCard } from "@/components/ui/SolicitudCard";
import { useAuth } from "@/contexts/AuthContext";
import { useIntercambio } from "@/contexts/IntercambioContext";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar } from "../../components/ui/Avatar";
import { ProductCard } from "../../components/ui/ProductCard";
import { ReviewCard } from "../../components/ui/ReviewCard";
import { Colors } from "../../constants/Colors";
import { usePublicacion } from "../../contexts/PublicacionContext"; // 👈 Solo el hook
import { useUser } from "../../contexts/UserContext";

const filtros = ["Reseñas", "Publicaciones", "Historial", "Favoritos"];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export default function PerfilScreen() {
  const {
    reseniasRecibidas,
    reseniasHechas,
    fetchReseniasHechas,
    fetchReseniasRecibidas,
    loading: userLoading,
    eliminarPublicacion
  } = useUser();
  const {
    pubsUser,
    pubFavoritas,
    fetchPublicacionesByUsuario,
    recuperarFavoritos,
    loading,
    error,
  } = usePublicacion();
  const [selectedFiltro, setSelectedFiltro] = useState(filtros[0]);
  const { user, getValidAccessToken } = useAuth();
  const {
    getIntercambiosReseñables,
    loading: loadingIntercambio,
    intercambiosReseñables,
  } = useIntercambio();
  const [showReseñaModal, setShowReseñaModal] = useState(false);
  const [selectedIntercambio, setSelectedIntercambio] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          await fetchPublicacionesByUsuario(user.id);
          await recuperarFavoritos();
          await fetchReseniasHechas();
          await fetchReseniasRecibidas();
          await getIntercambiosReseñables();
        } catch (err) {
          console.error("Error al cargar datos del usuario:", err);
        }
      }
    };
    fetchData().catch((err) => console.error(err));
  }, [user?.id]);

  if (userLoading || loading || loadingIntercambio)
    return <ActivityIndicator style={{ marginTop: 20 }} />;
  if (error) return <Text style={{ color: "red" }}>Error: {error}</Text>;

  const intercambiosPorEstado = {
    esperaReseña:
      intercambiosReseñables?.filter(
        (i) =>
          (i.estado === "CONCRETADO" || i.estado === "CANCELADO") &&
          i.esReseñable === true // Aún no han dejado reseña ambos
      ) || [],
    exitoso:
      intercambiosReseñables?.filter(
        (i) => i.estado === "CONCRETADO" && i.esReseñable === false // Ambos concretaron
      ) || [],
    noExitoso:
      intercambiosReseñables?.filter(
        (i) => i.estado === "CANCELADO" && i.esReseñable === false
      ) || [],
  };

  const handleEnviarReseña = async (
    rating: number,
    feedback: string
  ): Promise<void> => {
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error("No hay token válido");

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}resenia`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descripcion: feedback.trim() || "Sin comentarios",
          valoracion: rating,
          intercambioId: selectedIntercambio?.id,
          reseniadoId: selectedIntercambio?.usuarioId,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error al enviar reseña: ${res.status} - ${text}`);
      }

      await getIntercambiosReseñables();
      await fetchReseniasHechas();
      setShowReseñaModal(false);
      setSelectedIntercambio(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleReseñaEnviada = () => {
    // Callback cuando se envía la reseña
    setShowReseñaModal(false);
    setSelectedIntercambio(null);
  };

  const renderPublicaciones = () => {
    if (!pubsUser.length) {
      return (
        <Text
          style={{
            color: Colors.disabled_primary,
            textAlign: "center",
            marginTop: 10,
          }}
        >
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
          showMoreButton={true}
          onEdit={() => {
            console.log("Editar publicación", p.id);
          }}
          onDelete={async () => {
            const confirmado = await eliminarPublicacion(p.id);
            if (confirmado) {
              fetchPublicacionesByUsuario(user!.id);
            } else {
              console.log("No se pudo eliminar la publicación");
            }
          }}
        />
      </View>
    ));
  };

  const renderFavoritos = () => {
    if (!pubFavoritas.length) {
      return (
        <Text
          style={{
            color: Colors.disabled_primary,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          No tiene favoritos aún.
        </Text>
      );
    }

    return pubFavoritas.map((p) => (
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
      return (
        <Text
          style={{
            color: Colors.disabled_primary,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          No tiene reseñas recibidas aún.
        </Text>
      );
    }

    return reseniasRecibidas.map((r) => (
      <ReviewCard
        key={r.id}
        username={r.usuarioNombre}
        headline={`Valoración: ${r.valoracion}`}
        description={r.descripcion}
        date={r.fecha}
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
            username={r.usuarioNombre}
            headline={`Valoración: ${r.valoracion}`}
            description={r.descripcion}
            date=""
          />
        ))
      ) : (
        <Text
          style={{
            color: Colors.disabled_primary,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          No ha hecho reseñas aún.
        </Text>
      )}
      <Text style={styles.historialTitulo}>Intercambios</Text>
      {/* Espera de reseña */}
      <Text style={styles.historialSubTitle}>Espera de reseña</Text>
      {intercambiosPorEstado.esperaReseña.length === 0 ? (
        <Text
          style={{
            color: Colors.disabled_primary,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          No hay intercambios en espera de reseña.
        </Text>
      ) : (
        <>
          {intercambiosPorEstado.esperaReseña.map((i) => (
            <View key={i.id} style={styles.cardSeparator}>
              <SolicitudCard
                nombreUsuario={i.nombre + " " + i.apellido}
                tituloPublicacion={i.tituloPublicacion}
                estado={i.estado}
                fecha={formatDate(i.fechaInicio)}
                perfilClickeable={true}
                onPress={() => {
                  setSelectedIntercambio(i);
                  setShowReseñaModal(true);
                }}
              />
            </View>
          ))}
        </>
      )}

      <Text
        style={styles.historialSubTitle}
      >
        Exitosos
      </Text>

      {/* Exitoso */}
      {intercambiosPorEstado.exitoso.length === 0 ? (
        <Text
          style={{
            color: Colors.disabled_primary,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          No hay intercambios exitosos.
        </Text>
      ) : (
        <>
          {intercambiosPorEstado.exitoso.map((i) => (
            <View key={i.id} style={styles.cardSeparator}>
              <SolicitudCard
                nombreUsuario={i.nombre + " " + i.apellido}
                tituloPublicacion={i.tituloPublicacion}
                estado={i.estado}
                fecha={formatDate(i.fechaInicio)}
              />
            </View>
          ))}
        </>
      )}

      {/* No exitoso */}
      <Text
        style={styles.historialSubTitle}
      >
        No exitosos
      </Text>
      {intercambiosPorEstado.noExitoso.length === 0 ? (
        <Text
          style={{
            color: Colors.disabled_primary,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          No hay intercambios no exitosos.
        </Text>
      ) : (
        <>
          {intercambiosPorEstado.noExitoso.map((i) => (
            <View key={i.id} style={styles.cardSeparator}>
              <SolicitudCard
                nombreUsuario={i.nombre + " " + i.apellido}
                tituloPublicacion={i.tituloPublicacion}
                estado={i.estado}
                fecha={formatDate(i.fechaInicio)}
              />
            </View>
          ))}
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar name={user?.nombre || "U"} size={80} />
        <Text style={styles.nombre}>
          {user?.nombre} {user?.apellido}
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
          : selectedFiltro === "Historial"
          ? renderHistorial()
          : renderFavoritos()}
      </ScrollView>
      <ReviewModal
        visible={showReseñaModal}
        onClose={() => setShowReseñaModal(false)}
        onEnviarReseña={handleEnviarReseña}
        onReseñaEnviada={handleReseñaEnviada}
      />
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
    marginHorizontal: 8,
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
  contenido: {
    flex: 1,
    paddingHorizontal: 12,
    marginBottom: 25,
    paddingBottom: 20,
  },
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
  cardSeparator: {
    marginBottom: 10,
  },
  historialSubTitle: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "left",
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    marginLeft: 4,
  },
});
