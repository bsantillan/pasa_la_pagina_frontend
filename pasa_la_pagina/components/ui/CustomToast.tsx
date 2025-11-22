import { Colors } from "@/constants/Colors";
import { TipoNotificacion, useNotifications } from "@/contexts/NotificacionContext";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast, { ToastConfigParams } from "react-native-toast-message";

type CustomToastProps = ToastConfigParams<any> & {
    type: TipoNotificacion;
    icon?: React.ReactNode;
};

export const CustomToast = ({ text1, text2, type, icon, props }: CustomToastProps) => {
    const colors: Record<string, string> = {
        NUEVO_MENSAJE: Colors.primary,
        SOLICITUD_INTERCAMBIO: Colors.secondary,
        INTERCAMBIO_ACEPTADO: Colors.cta,
        INTERCAMBIO_RECHAZADO: "#E89E00",
        INTERCAMBIO_CANCELADO: "#D64545",
        INTERCAMBIO_CONCRETADO: "#205249",
    };

    const { handleNotificationNavigation } = useNotifications();

    const color = colors[type];
    const noti = props?.notificacion;

    const onPress = () => {
        if (noti) {
            Toast.hide();              // 👈 Cierra el toast inmediatamente
            setTimeout(() => {
                handleNotificationNavigation(noti);  // Luego navega
            }, 100);                   // pequeño delay para que no se "tranque"
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
        >
            <View style={[styles.container, { borderColor: color }]}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}

                <View style={styles.textContainer}>
                    {text1 && <Text style={[styles.title, { color }]}>{text1}</Text>}
                    {text2 && <Text style={styles.message}>{text2}</Text>}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "95%",
        padding: 15,
        borderRadius: 12,
        marginTop: 5,
        alignSelf: "center",
        minHeight: 30,
        backgroundColor: "#fff",
        borderWidth: 2,
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        marginRight: 12,
        justifyContent: "flex-start",
        alignItems: "center",
    },
    textContainer: {
        flex: 1,
        flexDirection: "column",
    },
    title: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 3,
    },
    message: {
        fontSize: 14,
        flexWrap: "wrap",
        color: Colors.text
    },
});
