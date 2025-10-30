import PrimaryButton from "@/components/ui/Boton/Primary";
import SecondaryButton from "@/components/ui/Boton/Secondary";
import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type UsuarioContactoProps = {
  nombreUsuario: string;
  tituloPublicacion: string;
  estado: "PENDIENTE" | "CANCELADO" | "CONCRETADO" | string;
  fecha: string;
  onAceptar?: () => void;
  onRechazar?: () => void;
  tituloAceptar: string;   
  tituloRechazar: string; 
};

export const UsuarioContactoCard: React.FC<UsuarioContactoProps> = ({
  nombreUsuario,
  tituloPublicacion,
  estado,
  fecha,
  onAceptar,
  onRechazar,
  tituloAceptar,
  tituloRechazar
}) => {
  const inicial = nombreUsuario.charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      {/* CABECERA */}
      <View style={styles.header}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{inicial}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.nombre}>{nombreUsuario}</Text>
          <Text style={styles.titulo}>{tituloPublicacion}</Text>
        </View>

        {/* Estado + Fecha */}
        <View style={styles.estadoContainer}>
          <Text
            style={[
              styles.estado,
              estado === "PENDIENTE"
                ? { color: Colors.secondary }
                : estado === "CANCELADO"
                  ? { color: Colors.cta }
                  : { color: Colors.text },
            ]}
          >
            {estado}
          </Text>
          <Text style={styles.fecha}>{fecha}</Text>
        </View>
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
    width: 378,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 8,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    width: 350,
  },
  avatarContainer: {
    width: 46,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "500",
    fontSize: 20,
    lineHeight: 23,
    color: Colors.secondary,
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
    width: 203,
  },
  nombre: {
    fontFamily: "Montserrat",
    fontWeight: "700",
    fontSize: 16,
    color: Colors.text,
  },
  titulo: {
    fontFamily: "Montserrat",
    fontWeight: "500",
    fontSize: 13,
    color: "#49454F",
  },
  estadoContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
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
  buttonsContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    alignSelf: "center",
  },
  botonAceptar: {
    width: 285,
    height: 32,
  },
  textAceptar: {
    fontSize: 14,
    fontWeight: "500",
  },
  botonRechazar: {
    width: 285,
    height: 32,
  },
  textRechazar: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.secondary,
  },
});
