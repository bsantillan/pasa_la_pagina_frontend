import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";

type AvatarProps = {
    name: string;
    size?: number;
};

export const Avatar = ({ name, size = 60 }: AvatarProps) => {
    const initial = name.charAt(0).toUpperCase();

    return (
        <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={[styles.initial, { fontSize: size / 2 }]}>{initial}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    circle: {
        backgroundColor: Colors.disabled_secondary,
        alignItems: "center",
        justifyContent: "center",
    },
    initial: {
        color: Colors.secondary,
        fontWeight: "bold",
    },
});
