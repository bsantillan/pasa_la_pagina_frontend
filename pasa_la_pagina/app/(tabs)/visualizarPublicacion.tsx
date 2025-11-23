import { AlertCard } from "@/components/ui/AlertaCard";
import { Avatar } from "@/components/ui/Avatar";
import PrimaryButton from "@/components/ui/Boton/Primary";
import { FotoCarousel } from "@/components/ui/FotosCarousel";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useIntercambio } from "@/contexts/IntercambioContext";
import { usePublicacion } from "@/contexts/PublicacionContext";
import { Publicacion } from "@/types/Publicacion";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { CustomMarker } from "../(mapa)";

export default function VisualizarPublicacion() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
  const { getValidAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [verDetalles, setVerDetalles] = useState(false);
  const [userid, setUserid] = useState<number | null>(null);
  const { solicitarIntercambio } = useIntercambio();
  const [modalVisible, setModalVisible] = useState(false);
  const { getUserLocation } = usePublicacion();
  const [modalRegion, setModalRegion] = useState<Region | null>(null);
  const mapRef = useRef<MapView>(null);

  const abrirLink = () => {
    if (publicacion?.url) {
      Linking.openURL(publicacion.url);
    }
  };

  const irAPerfil = () => {
    if (publicacion?.usuario_id) {
      router.push(`/(perfil)/usuario?usuarioId=${publicacion.usuario_id}`);
    }
  };

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
        console.log("Datos del fetch:", data);
        setPublicacion(data);
      } catch (error) {
        console.error("Error fetching publicacion:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicacion();
  }, [id, getValidAccessToken]);

  useEffect(() => {
    if (modalVisible) {
      (async () => {
        const userLoc = await getUserLocation();
        if (userLoc && publicacion?.latitud && publicacion?.longitud) {
          const midLat = (userLoc.latitude + publicacion.latitud) / 2;
          const midLng = (userLoc.longitude + publicacion.longitud) / 2;

          setModalRegion({
            latitude: publicacion.latitud,
            longitude: publicacion.longitud,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      })();
    }
  }, [modalVisible, publicacion]);

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
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.containerScroll}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false} 
      >
        <View>
          <Text style={styles.titulo}>{publicacion.titulo}</Text>
          <FotoCarousel fotos={publicacion?.url_fotos || []} favorito={publicacion.favorito} idPublicacion={publicacion.id} mostrarFavorito={true} />

          <Text style={styles.descripcion}>{publicacion.descripcion}</Text>
          <View style={styles.detallesRow}>
            <Text style={styles.opiniones}>Detalles</Text>

            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Ionicons name="map-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>

              {publicacion.tipo_oferta === "Donacion" && publicacion.digital && publicacion.url && (
                <TouchableOpacity onPress={abrirLink} style={{ marginLeft: 12 }}>
                  <Ionicons name="link-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.textCard}>
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

          {/* Botón para ir al perfil del usuario */}
          <TouchableOpacity style={styles.perfilCard} onPress={irAPerfil}>
            <View style={styles.perfilContent}>
              <Avatar 
                name={`${publicacion.usuario_nombre} ${publicacion.usuario_apellido}`}
                size={48}
              />
              <Text style={styles.perfilNombre}>
                {publicacion.usuario_nombre} {publicacion.usuario_apellido}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      {publicacion.usuario_id !== userid && (
        <View>
          <PrimaryButton
            title="Contactar"
            onPress={() => setShowAlert(true)}
            styleBtn={{ marginBottom: 30, height: 36 }}
          />
          <Modal
            visible={showAlert}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAlert(false)}
          >
            <View style={styles.modalBackground}>
              <AlertCard
                title={`Contactar a ${publicacion.usuario_nombre} ${publicacion.usuario_apellido}`}
                description={`Vamos a enviar un mensaje predeterminado sobre la publicación "${publicacion.titulo}".`}
                onAccept={() => {
                  setShowAlert(false);
                  handleContactar();
                }}
                onCancel={() => setShowAlert(false)}
              />
            </View>
          </Modal>
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalContainer}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            >
              <View style={styles.modalBox}>
                {modalRegion ? (
                  <MapView
                    ref={mapRef}
                    style={{ width: "100%", height: 500, borderRadius: 10 }}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={modalRegion}
                    showsUserLocation
                    showsMyLocationButton={false}
                    showsCompass={false}
                  >
                    {publicacion?.latitud && publicacion?.longitud && (
                      <Marker
                        coordinate={{
                          latitude: publicacion.latitud,
                          longitude: publicacion.longitud,
                        }}
                        anchor={{ x: 0.5, y: 1 }}
                      >
                        <CustomMarker
                          isSelected={true}
                          tipo={publicacion.tipo_material || "apunte"}
                        />
                      </Marker>
                    )}
                  </MapView>
                ) : (
                  <ActivityIndicator size="large" color={Colors.primary} />
                )}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  containerScroll: {
    flex: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 20,
  },
  descripcion: {
    fontSize: 20,
    color: "#5D5D5D",
    marginVertical: 10,
    fontWeight: "600",
  },
  card: {
    borderRadius: 24,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 4,
  },
  textCard: {
    fontSize: 14,
    color: "#3C3C43",
    marginBottom: 4,
    fontWeight: "500",
  },
  perfilCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 24,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 4,
  },
  perfilContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  perfilNombre: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 12,
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
  },
  detallesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "100%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  map: { ...StyleSheet.absoluteFillObject },
});