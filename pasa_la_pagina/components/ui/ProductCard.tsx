import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";

type ProductCardProps = {
    imageUrl: string;
    title: string;
    description: string;
};

export const ProductCard = ({ imageUrl, title, description }: ProductCardProps) => {
    return (
        <View style={styles.card}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        width: 248,
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    image: {
        width: "100%",
        height: 120,
    },
    content: {
        padding: 12,
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