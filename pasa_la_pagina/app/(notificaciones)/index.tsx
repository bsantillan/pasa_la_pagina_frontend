import { Colors } from "@/constants/Colors";
import { Notificacion, useNotifications } from "@/contexts/NotificacionContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotificacionesScreen() {
  const { notificaciones, fetchNotifications, deleteNotification } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    fetchNotifications(0, 20);
  }, []);

  const handleOpenNotification = async (noti: Notificacion) => {
    // 1. Guardamos el id antes de navegar
    const id = noti.id;

    // 2. Redirecciones
    if (noti.intercambio_id && !noti.chat_id) {
      router.push(`/(intercambios)`);
    } else if (noti.chat_id) {
      router.push({
        pathname: "/(intercambios)/chat",
        params: {
          chatId: noti.chat_id,
        },
      });
    } else {
      console.log("Notificación sin destino");
    }

    // 3. Eliminamos la notificación tras un pequeño delay
    setTimeout(() => {
      deleteNotification(id);
    }, 300); // 300 ms → da tiempo a que la pantalla cambie sin romper nada
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* --- No hay notificaciones --- */}
      {notificaciones.length === 0 && (
        <Text style={styles.noDataText}>No tienes notificaciones por ahora</Text>
      )}

      {/* --- Lista de notificaciones --- */}
      {notificaciones.map((noti, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => handleOpenNotification(noti)}
        >

          <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteNotification(noti.id)}>
            <Ionicons name="trash-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <View style={noti.intercambio_id ? styles.cardContent : styles.cardContentSmall}>

            {noti.intercambio_id && (
              <Text style={styles.subtitle}>{noti.titulo}</Text>
            )}

            <View style={styles.textGroup}>
              <Text style={styles.username}>{noti.usuario}</Text>

              <Text style={styles.label}>Mensaje:</Text>
              <Text style={styles.message}>{noti.mensaje}</Text>
            </View>

            <View style={styles.secondaryInfo}>
              <Text style={styles.dateLabel}>Fecha</Text>
              <Text style={styles.dateValue}>
                {new Date(noti.fecha).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 16,
    backgroundColor: Colors.background,
  },

  noDataText: {
    marginTop: 40,
    fontSize: 16,
    color: Colors.disabled_text,
    fontFamily: "Montserrat",
    textAlign: "center",
  },

  deleteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 6,
    zIndex: 10,
  },

  /* === UNA SOLA CARD QUE SE ADAPTA === */
  card: {
    alignSelf: "stretch",   // Usa TODA la fila disponible
    marginHorizontal: 25,   // márgenes laterales
    padding: 16,
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  /* === DOS TIPOS DE LAYOUT INTERNO === */

  cardContent: {
    gap: 16,   // Cuando la tarjeta tiene intercambio_id
  },

  cardContentSmall: {
    gap: 12,   // Cuando NO tiene intercambio_id
  },

  /* === Textos === */

  subtitle: {
    fontFamily: "Montserrat",
    fontWeight: "700",
    fontSize: 13,
    color: Colors.text,
  },

  textGroup: {
    gap: 8,
  },

  username: {
    fontFamily: "Montserrat",
    fontSize: 13,
    fontWeight: "500",
    color: Colors.disabled_text,
  },

  label: {
    fontFamily: "Roboto",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.25,
    color: Colors.text,
  },

  message: {
    fontFamily: "Montserrat",
    fontSize: 13,
    fontWeight: "500",
    color: Colors.disabled_text,
  },

  secondaryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },

  dateLabel: {
    fontFamily: "Montserrat",
    fontSize: 13,
    color: Colors.text,
    fontWeight: "700",
  },

  dateValue: {
    fontFamily: "Montserrat",
    fontSize: 13,
    color: Colors.disabled_text,
  },
});


