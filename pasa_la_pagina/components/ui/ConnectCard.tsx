import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { Avatar } from "./Avatar";
import PrimaryButton from "./Boton/Primary";
import SecondaryButton from "./Boton/Secondary";

type ConnectCardProps = {
    username: string;
    publicationTitle: string;
    onSend: () => void;
    onCancel: () => void;
};

export const ConnectCard = ({
    username,
    publicationTitle,
    onSend,
    onCancel,
}: ConnectCardProps) => {
    return (
        <View style={styles.card}>
            {/* Avatar */}
            <Avatar name={username} size={70} />

            {/* Nombre */}
            <Text style={styles.username}>{username}</Text>

            {/* Mensaje predeterminado */}
            <Text style={styles.messageTitle}>
                Vamos a enviar un mensaje predeterminado:
            </Text>
            <Text style={styles.message}>
                Hola! estoy interesado en <Text style={styles.bold}>{publicationTitle}</Text>
            </Text>

            {/* Botones */}
            <View style={styles.actions}>
                <PrimaryButton title="Enviar mensaje" onPress={onSend} />
                <View style={{ marginTop: 22 }}>
                    <SecondaryButton title="Cancelar" onPress={onCancel} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        paddingTop: 30,
        paddingBottom: 30,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        alignItems: "center",
    },
    username: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.text,
        marginTop: 16,
    },
    messageTitle: {
        fontSize: 14,
        color: Colors.text,
        marginTop: 16,
        textAlign: "center",
    },
    message: {
        fontSize: 14,
        color: Colors.text,
        marginVertical: 12,
        textAlign: "center",
    },
    bold: {
        fontWeight: "bold",
    },
    actions: {
        marginTop: 16,
        width: "100%",
        alignItems: "center",
    },
});