import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Colors } from "../../constants/Colors";

type ProductCardProps = {
    imageUrl: string;
    title: string;
    description: string;
    width?: number;
    height?: number;
    showMoreButton?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
};

export const ProductCard = ({
    imageUrl,
    title,
    description,
    width = 245,
    height = 215,
    showMoreButton = false,
    onEdit,
    onDelete,
}: ProductCardProps) => {
    const [popupVisible, setPopupVisible] = useState(false);

    const closePopup = () => setPopupVisible(false);

    return (
        <View style={[styles.card, { width, height }]}>
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                        {title}
                    </Text>
                    {showMoreButton && (
                        <TouchableOpacity
                            style={styles.moreButton}
                            onPress={() => setPopupVisible(!popupVisible)}
                        >
                            <Ionicons name="ellipsis-vertical" size={20} color="#333" />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
                    {description}
                </Text>
            </View>

            {popupVisible && (
                <TouchableWithoutFeedback onPress={closePopup}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.popupContainer}>
                                {/* Eliminar */}
                                <TouchableOpacity style={styles.popupItem} onPress={onDelete || (() => { })}>
                                    <Text style={[styles.popupText, { color: "#EE7300" }]}>Eliminar</Text>
                                    <Ionicons name="trash-outline" size={22} color="#EE7300" />
                                </TouchableOpacity>
                                {/* Editar */}
                                <TouchableOpacity style={styles.popupItem} onPress={onEdit || (() => { })}>
                                    <Text style={styles.popupText}>Editar</Text>
                                    <Ionicons name="create-outline" size={22} color="#333" />
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            )}
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
        position: "relative",
    },
    image: {
        width: "100%",
        height: 120,
    },
    content: {
        padding: 12,
        flex: 1,
        justifyContent: "flex-start",
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.text,
        flex: 1,
    },
    description: {
        fontSize: 14,
        color: Colors.text,
        marginTop: 4,
    },
    moreButton: {
        marginLeft: 8,
        padding: 4,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    popupContainer: {
        position: "absolute",
        top: 36, // ajusta para que quede sobre los 3 puntitos
        right: 12,
        width: 165,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 8,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        elevation: 5,
        flexDirection: "column",
        gap: 6,
    },
    popupItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#ADBEBB",
    },
    popupText: {
        fontFamily: "Montserrat",
        fontWeight: "600",
        fontSize: 16,
    },
});
