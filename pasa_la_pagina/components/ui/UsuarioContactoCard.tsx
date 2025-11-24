import PrimaryButton from "@/components/ui/Boton/Primary";
import SecondaryButton from "@/components/ui/Boton/Secondary";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type UsuarioContactoProps = {
  nombreUsuario: string;
  tituloPublicacion: string;
  estado: "PENDIENTE" | "CANCELADO" | "CONCRETADO" | string;
  fecha: string;
  onAceptar?: () => void;
  onRechazar?: () => void;
  onClose?: () => void;
  tituloAceptar: string;
  tituloRechazar: string;
};

export const UsuarioContactoCard: React.FC<UsuarioContactoProps> = ({
  nombreUsuario,
  tituloPublicacion,
  estado: _estado,
  fecha: _fecha,
  onAceptar,
  onRechazar,
  tituloAceptar,
  tituloRechazar,
  onClose,
}) => {
  const inicial = nombreUsuario.charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      {onClose && (
        <Pressable
          style={styles.closeButton}
          onPress={onClose}
          accessibilityLabel="Cerrar contacto"
          hitSlop={10}
        >
          <Text style={styles.closeText}>X</Text>
        </Pressable>
      )}

      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{inicial}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.nombre}>{nombreUsuario}</Text>
        <Text style={styles.titulo}>{tituloPublicacion}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <PrimaryButton
          title={tituloAceptar || "Aceptar intercambio"}
          onPress={onAceptar || (() => { })}
          styleBtn={styles.botonAceptar}
          styleTxt={styles.textAceptar}
        />
        <SecondaryButton
          title={tituloRechazar || "Rechazar intercambio"}
          onPress={onRechazar || (() => { })}
          styleBtn={styles.botonRechazar}
          styleTxt={styles.textRechazar}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "90%",
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 26,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    alignItems: "center",
    position: "relative",
  },
  avatarContainer: {
    width: 96,
    height: 96,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 86 / 2,
    backgroundColor: Colors.disabled_secondary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarText: {
    fontFamily: "Roboto",
    fontWeight: "700",
    fontSize: 32,
    lineHeight: 34,
    color: Colors.secondary,
    textAlign: "center",
  },
  infoContainer: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  nombre: {
    fontFamily: "Montserrat",
    fontWeight: "700",
    fontSize: 18,
    color: Colors.text,
  },
  titulo: {
    fontFamily: "Montserrat",
    fontWeight: "400",
    fontSize: 14,
    color: "#6B6B6B",
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    alignSelf: "stretch",
  },
  botonAceptar: {
    width: "100%",
    height: 42,
  },
  textAceptar: {
    fontSize: 15,
    fontWeight: "600",
  },
  botonRechazar: {
    width: "100%",
    height: 42,
  },
  textRechazar: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 1,
    padding: 4,
  },
  closeText: {
    fontSize: 22,
    color: "#4A4A4A",
    lineHeight: 24,
  },
});
