import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../../../constants/Colors";

type Props = {
    title: string;
    onPress: (event: GestureResponderEvent) => void;
    styleBtn?: object;
    styleTxt?: object;
    disabled?: boolean;
}

export default function SecondaryButton({ title, onPress, styleBtn, styleTxt, disabled= false }: Props) {
    return (
        <TouchableOpacity style={[styles.button, styleBtn]} onPress={onPress} disabled={disabled}>
            <Text style={[styles.buttonText, styleTxt]}>{title}</Text>
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
