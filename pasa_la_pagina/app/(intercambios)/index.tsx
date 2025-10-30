import PrimaryButton from "@/components/ui/Boton/Primary";
import { SolicitudCard } from "@/components/ui/SolicitudCard";
import { UsuarioContactoCard } from "@/components/ui/UsuarioContactoCard"; // 👈 importa el nuevo componente
import { Colors } from "@/constants/Colors";
import { Intercambio, useIntercambio } from "@/contexts/IntercambioContext";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, View } from "react-native";

export default function Mensajes() {
  const {
    intercambios,
    buscarIntercambios,
    aceptarIntercambio,
    cancelarIntercambio,
    intercambioSeleccionado,
    seleccionarIntercambio,
  } = useIntercambio();
  const [solicitudesVisible, setSolicitudesVisible] = useState(true);

  const cargarIntercambios = async (mostrarSolicitudes: boolean) => {
    try {
      if (mostrarSolicitudes) {
        console.log("entro");
        await buscarIntercambios();
      } else {
        const response = await buscarIntercambios({
          estadosIntercambio: ["PENDIENTE", "ACEPTADO"],
        });
        console.log(response);
      }
    } catch (err: any) {
      console.error("Error al buscar intercambios:", err);
      Alert.alert("Error", "No se pudieron cargar los intercambios.");
    }
  };

  useEffect(() => {
    cargarIntercambios(true);
  }, []);

  const handleAbrirModal = (item: Intercambio) => {
    if (item.estadoIntercambio === "PENDIENTE") {
      seleccionarIntercambio(item);
    }
  };

  const handleCerrarModal = () => seleccionarIntercambio(null);

  const handleAceptar = async () => {
    if (!intercambioSeleccionado) return;
    try {
      await aceptarIntercambio(intercambioSeleccionado.id);
      handleCerrarModal();
      cargarIntercambios(true);
    } catch (err) {
      Alert.alert("Error", "No se pudo aceptar el intercambio.");
    }
  };

  const handleRechazar = async () => {
    if (!intercambioSeleccionado) return;
    try {
      await cancelarIntercambio(intercambioSeleccionado.id);
      handleCerrarModal();
      cargarIntercambios(true);
    } catch (err) {
      Alert.alert("Error", "No se pudo cancelar el intercambio.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Botones superiores */}
      <View style={styles.view_isbn}>
        <PrimaryButton
          styleBtn={styles.styleBtn}
          title="Solicitudes"
          onPress={() => {
            setSolicitudesVisible(true);
            cargarIntercambios(true);
          }}
          selected={solicitudesVisible}
        />
        <PrimaryButton
          styleBtn={styles.styleBtn}
          title="Mensajes"
          onPress={() => {
            setSolicitudesVisible(false);
            cargarIntercambios(false);
          }}
          selected={!solicitudesVisible}
        />
      </View>

      {/* Lista de intercambios */}
      {solicitudesVisible ? (
        <FlatList
          data={intercambios}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ gap: 16 }}
          renderItem={({ item }) => (
            <SolicitudCard
              nombreUsuario={item.usuario}
              tituloPublicacion={item.tituloPublicaicon}
              estado={item.estadoIntercambio}
              fecha={new Date(item.fechaInicio).toLocaleDateString()}
              onPress={() => handleAbrirModal(item)}
              solicitanteConcreto={item.solicitanteConcreto}
              propietarioConcreto={item.propietarioConcreto}
              rolUsuario={item.rolUsuario}
            />
          )}
        />
      ) : (
        <>
          <FlatList
            data={intercambios?.filter(
              (item) =>
                item.estadoIntercambio === "PENDIENTE" ||
                item.estadoIntercambio === "ACEPTADO"
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ gap: 16 }}
            renderItem={({ item }) => (
              <SolicitudCard
                nombreUsuario={item.usuario}
                tituloPublicacion={item.tituloPublicaicon}
                estado={item.estadoIntercambio}
                fecha={new Date(item.fechaInicio).toLocaleDateString()}
                onPress={() => {
                  seleccionarIntercambio(null);
                  router.push({
                    pathname: "/(intercambios)/chat",
                    params: {
                      chatId: item.chatId,
                      usuarioEmail: item.usuarioEmail,
                      tituloPublicacion: item.tituloPublicaicon,
                      intercambioId: item.id,
                    },
                  });
                }}
                mensaje
                solicitanteConcreto={item.solicitanteConcreto}
                propietarioConcreto={item.propietarioConcreto}
                rolUsuario={item.rolUsuario}
              />
            )}
          />
        </>
      )}

      {/* Modal del contacto */}
      <Modal
        visible={!!intercambioSeleccionado}
        transparent
        animationType="fade"
        onRequestClose={handleCerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {intercambioSeleccionado && (
              <UsuarioContactoCard
                nombreUsuario={intercambioSeleccionado.usuario}
                tituloPublicacion={intercambioSeleccionado.tituloPublicaicon}
                estado={intercambioSeleccionado.estadoIntercambio}
                fecha={new Date(
                  intercambioSeleccionado.fechaInicio
                ).toLocaleDateString()}
                onAceptar={handleAceptar}
                onRechazar={handleRechazar}
                tituloAceptar={"Aceptar intercambio"}
                tituloRechazar={"Rechazar intercambio"}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
  },
  view_isbn: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
    gap: 10,
    paddingTop: 60,
  },
  styleBtn: {
    flex: 1,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cerrarBtn: {
    marginTop: 20,
  },
});
