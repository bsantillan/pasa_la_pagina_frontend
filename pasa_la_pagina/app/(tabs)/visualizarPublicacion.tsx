import { AlertCard } from "@/components/ui/AlertaCard";
import PrimaryButton from "@/components/ui/Boton/Primary";
import { FotoCarousel } from "@/components/ui/FotosCarousel";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useIntercambio } from "@/contexts/IntercambioContext";
import { Publicacion } from "@/types/Publicacion";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VisualizarPublicacion() {
  const { id } = useLocalSearchParams();
  const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
  const { getValidAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [verDetalles, setVerDetalles] = useState(false);
  const [userid, setUserid] = useState<number | null>(null);
  const { solicitarIntercambio } = useIntercambio();

  useEffect(() => {
    const fetchPublicacion = async () => {
      setLoading(true);
      try {
        const accessToken = await getValidAccessToken();
        const useridResponse = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}user/me`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const useridData = await useridResponse.json();
        setUserid(useridData.id);

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}publicacion/${id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Error al obtener la publicación: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Datos del fetch:", data); // log de los datos reales
        setPublicacion(data);
      } catch (error) {
        console.error("Error fetching publicacion:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicacion();
  }, [id, getValidAccessToken]);

  const handleContactar = async () => {
    try {
      if (!publicacion?.id) {
        Alert.alert("Error", "ID de la publicación no disponible");
        return;
      }
      await solicitarIntercambio(publicacion.id);
      Alert.alert("Éxito", "Has solicitado el intercambio correctamente");
    } catch (err: any) {
      Alert.alert("Ya enviaste", err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!publicacion) {
    return (
      <View style={styles.center}>
        <Text>No se encontró la publicación</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        {/* Botón de volver */}
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </Pressable>

        {/* Barra de búsqueda */}
        <TouchableOpacity
          onPress={() => router.push(`/listado`)}
          style={[
            styles.input,
            {
              flex: 1,
              marginHorizontal: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
            },
          ]}
        >
          <Text>Buscar publicaciones...</Text>
        </TouchableOpacity>

        {/* Botón de notificaciones */}
        <Pressable
          onPress={() => router.push("/notificaciones")}
          style={{ padding: 8 }}
        >
          <MaterialIcons name="notifications-none" size={24} color="#000" />
        </Pressable>
      </View>
      <ScrollView
        style={styles.containerScroll}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.container}>
          <Text style={styles.titulo}>{publicacion.titulo}</Text>
          <FotoCarousel fotos={publicacion?.url_fotos || []} />

          <Text style={styles.descripcion}>{publicacion.descripcion}</Text>
          <View style={styles.card}>
            <Text style={styles.textCard}>
              {" "}
              Tipo de oferta: {publicacion.tipo_oferta}
            </Text>
            {publicacion.tipo_oferta === "Venta" && (
              <Text style={styles.textCard}>
                Precio:{" "}
                {publicacion.precio ? `$${publicacion.precio}` : "A convenir"}
              </Text>
            )}
            {verDetalles === true && (
              <View>
                {publicacion.tipo_material === "Libro" && (
                  <View>
                    <Text style={styles.textCard}>
                      Autor: {publicacion.autor || "Desconocido"}
                    </Text>
                    <Text style={styles.textCard}>
                      Editorial: {publicacion.editorial || "Desconocida"}
                    </Text>
                    <Text style={styles.textCard}>
                      Genero: {publicacion.genero || "Desconocido"}
                    </Text>
                  </View>
                )}
                {publicacion.tipo_material === "Apunte" && (
                  <View>
                    <Text style={styles.textCard}>
                      Año de elaboración:{" "}
                      {publicacion.anio_elaboracion || "Desconocido"}
                    </Text>
                    <Text style={styles.textCard}>
                      Cantidad de paginas:{" "}
                      {publicacion.cantidad_paginas || "Desconocida"}
                    </Text>
                    <Text style={styles.textCard}>
                      Nivel Educativo:{" "}
                      {publicacion.nivel_educativo || "Desconocido"}
                    </Text>
                    {publicacion.nivel_educativo === "Superior" && (
                      <Text style={styles.textCard}>
                        Carrera: {publicacion.carrera || "Desconocida"}
                      </Text>
                    )}
                    <Text style={styles.textCard}>
                      Institución: {publicacion.institucion || "Desconocida"}
                    </Text>
                    <Text style={styles.textCard}>
                      Sección: {publicacion.seccion || "Desconocida"}
                    </Text>
                    <Text style={styles.textCard}>
                      Materia: {publicacion.materia || "Desconocida"}
                    </Text>
                  </View>
                )}
                <Text style={styles.textCard}>
                  Formato: {publicacion.digital ? "Digital" : "Físico"}
                </Text>
                <Text style={styles.textCard}>
                  Estado: {publicacion.nuevo ? "Nuevo" : "Usado"}
                </Text>

                <Text style={styles.textCard}>
                  Cantidad disponible:{" "}
                  {publicacion.cantidad ?? "No especificada"}
                </Text>
              </View>
            )}
            <PrimaryButton
              title={verDetalles ? "Ocultar detalles" : "Ver detalles"}
              onPress={() => setVerDetalles(!verDetalles)}
              styleBtn={{ marginTop: 12, height: 36 }}
            ></PrimaryButton>
          </View>
        </View>
        <Text style={styles.opiniones}>
          {" "}
          Opiniones sobre el usuario {publicacion.usuario_nombre}
        </Text>
        {/* Falta el listado de opiniones del usuario */}
      </ScrollView>
      {publicacion.usuario_id !== userid && (
        <View>
          <PrimaryButton
            title="Contactar"
            onPress={() => setShowAlert(true)}
            styleBtn={{ marginBottom: 4, height: 36 }}
          ></PrimaryButton>
          <Modal
            visible={showAlert}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAlert(false)}
          >
            <View style={styles.modalBackground}>
              <AlertCard
                title={`Contactar a ${publicacion.usuario_nombre}${publicacion.usuario_apellido}`}
                description={`Vamos a enviar un mensaje predeterminado sobre la publicación "${publicacion.titulo}".`}
                onAccept={() => {
                  setShowAlert(false);
                  handleContactar();
                }}
                onCancel={() => setShowAlert(false)}
              />
            </View>
          </Modal>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 8,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: Colors.white,
  },
  containerScroll: {
    flex: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 20,
    marginTop: 0,
  },
  descripcion: {
    fontSize: 20,
    color: "#5D5D5D",
    marginTop: 20,
    fontWeight: "600",
  },
  card: {
    borderRadius: 24,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 10,
  },
  textCard: {
    fontSize: 14,
    color: "#3C3C43",
    marginBottom: 4,
    fontWeight: "500",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  opiniones: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginTop: 32,
    marginBottom: 26,
  },
});
