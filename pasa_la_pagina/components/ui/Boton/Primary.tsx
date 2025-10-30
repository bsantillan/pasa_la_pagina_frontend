import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../../../constants/Colors";

type Props = {
    title: string;
    onPress: (event: GestureResponderEvent) => void;
    styleBtn?: object;
    styleTxt?: object;
    disabled?: boolean;
    selected?: boolean; 
};

export default function PrimaryButton({
    title,
    onPress,
    styleBtn,
    styleTxt,
    disabled = false,
    selected = false, 
}: Props) {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                selected ? styles.defaultButton : styles.selectedButton, 
                styleBtn,
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text
                style={[
                    styles.buttonText,
                    selected ? styles.defaultButton : styles.buttonText, // ✅ también podés cambiar el color del texto
                    styleTxt,
                ]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
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
    defaultButton: {
        backgroundColor: Colors.primary,
    },
    selectedButton: {
        backgroundColor: Colors.disabled_primary,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    selectedText: {
        color: Colors.primary,
    },
});
