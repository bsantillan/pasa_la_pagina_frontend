import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../../../constants/Colors";

type Props = {
    title: string;
    onPress: (event: GestureResponderEvent) => void;
    styleBtn?: object;
    styleTxt?: object;
}

export default function PrimaryButton({ title, onPress, styleBtn, styleTxt }: Props) {
    return (
        <TouchableOpacity style={[styles.button, styleBtn]} onPress={onPress}>
            <Text style={[styles.buttonText, styleTxt]}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 4,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
});