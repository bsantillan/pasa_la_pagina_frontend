import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";

type ProductCardProps = {
    imageUrl: string;
    title: string;
    description: string;
    width?: number;   // opcional
    height?: number;  // opcional
};

export const ProductCard = ({
    imageUrl,
    title,
    description,
    width = 245,  // valor por defecto
    height = 215, // valor por defecto
}: ProductCardProps) => {
    return (
        <View style={[styles.card, { width, height }]}>
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                    {title}
                </Text>
                <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
                    {description}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        margin: 8,
    },
    image: {
        width: "100%",
        height: 120, // podés hacer que esto también dependa de `height` si querés
    },
    content: {
        padding: 12,
        flex: 1,
        justifyContent: "flex-start",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.text,
    },
    description: {
        fontSize: 14,
        color: Colors.text,
        marginTop: 4,
    },
});
