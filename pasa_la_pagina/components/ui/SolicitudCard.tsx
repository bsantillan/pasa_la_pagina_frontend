import { Colors } from "@/constants/Colors";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IntercambioCardProps = {
  nombreUsuario: string;
  tituloPublicacion: string;
  estado?: "PENDIENTE" | "CANCELADO" | "CONCRETADO" | string;
  fecha: string;
  mensaje?: boolean; // 👈 nuevo prop opcional
  onPress?: () => void;
};

export const SolicitudCard: React.FC<IntercambioCardProps> = ({
  nombreUsuario,
  tituloPublicacion,
  estado,
  fecha,
  mensaje = false,
  onPress,
}) => {
  const inicial = nombreUsuario.charAt(0).toUpperCase();

  const colorEstado = () => {
    switch (estado) {
      case "PENDIENTE":
        return "#FFAF00";
      case "CANCELADO":
        return "#EE7300";
      case "CONCRETADO":
        return "#333333";
      default:
        return Colors.cta;
    }
  };

  const isClickable = estado === "PENDIENTE" || mensaje;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && isClickable && { opacity: 0.8 },
      ]}
      onPress={isClickable ? onPress : undefined}
      disabled={!isClickable}
    >
      {/* Círculo con inicial */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{inicial}</Text>
        </View>
      </View>

      {/* Texto adaptable */}
      <View style={styles.textContainer}>
        <Text style={styles.nombreUsuario} numberOfLines={1} ellipsizeMode="tail">
          {nombreUsuario}
        </Text>
        <Text style={styles.tituloPublicacion} numberOfLines={1} ellipsizeMode="tail">
          {tituloPublicacion}
        </Text>
      </View>

      {/* Estado + fecha o solo fecha centrada */}
      <View style={[styles.infoContainer, mensaje && styles.infoContainerMensaje]}>
        {!mensaje && (
          <Text style={[styles.estado, { color: colorEstado() }]}>{estado}</Text>
        )}
        <Text style={[styles.fecha, mensaje && styles.fechaMensaje]}>{fecha}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    paddingHorizontal: 16,
    height: 73,
  },
  avatarContainer: {
    width: 46,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarCircle: {
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
    backgroundColor: Colors.disabled_secondary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarText: {
    fontFamily: "Roboto",
    fontWeight: "700",
    fontSize: 22,
    color: Colors.secondary,
    textAlign: "center",
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    marginRight: 16,
  },
  nombreUsuario: {
    fontFamily: "Montserrat",
    fontWeight: "700",
    fontSize: 16,
    color: Colors.text,
  },
  tituloPublicacion: {
    fontFamily: "Montserrat",
    fontWeight: "500",
    fontSize: 13,
    color: "#49454F",
  },
  infoContainer: {
    width: 90,
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoContainerMensaje: {
    justifyContent: "center", 
  },
  estado: {
    fontFamily: "Montserrat",
    fontWeight: "500",
    fontSize: 13,
    textAlign: "right",
  },
  fecha: {
    fontFamily: "Montserrat",
    fontWeight: "500",
    fontSize: 13,
    color: Colors.primary,
    textAlign: "right",
  },
  fechaMensaje: {
    textAlign: "center", 
  },
});
