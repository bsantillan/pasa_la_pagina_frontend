import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../../../constants/Colors";

type Props = {
    title: string;
    onPress: (event: GestureResponderEvent) => void;
}

export default function SecondaryButton({ title, onPress }: Props) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
}

    const styles = StyleSheet.create({
    button: {
        backgroundColor: "transparent",
        paddingVertical: 4,
        paddingHorizontal: 30,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: Colors.secondary,
        alignItems: "center",
    },
    buttonText: {
        color: Colors.secondary,
        fontSize: 16,
        fontWeight: "600",
    },
    });
