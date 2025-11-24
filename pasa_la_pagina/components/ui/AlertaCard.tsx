import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";
import PrimaryButton from "./Boton/Primary";
import SecondaryButton from "./Boton/Secondary";

type AlertCardProps = {
    title: string;
    description: string;
    onAccept: () => void;
    onCancel?: () => void;
    acceptLabel?: string;
    cancelLabel?: string;
};

export const AlertCard = ({
    title,
    description,
    onAccept,
    onCancel,
    acceptLabel = "Aceptar",
    cancelLabel = "Cancelar",
}: AlertCardProps) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            <View style={styles.actions}>
                {onCancel && (
                    <SecondaryButton
                        onPress={onCancel}
                        title={cancelLabel}
                        styleBtn={{ width: "90%" }}
                    />
                )}
                <PrimaryButton
                    title={acceptLabel}
                    onPress={onAccept}
                    styleBtn={{ width: "90%" }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        padding: 16,
        width: 300,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.text,
    },
    description: {
        fontSize: 14,
        color: Colors.text,
        marginVertical: 8,
    },
    actions: {
        flexDirection: "column",
        justifyContent: "center",
        marginTop: 8,
        gap: 8,
        alignItems: "center",
    },

});