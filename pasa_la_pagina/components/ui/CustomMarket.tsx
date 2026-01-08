import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type Props = {
    isSelected: boolean;
    tipo: string;
};

export const CustomMarker = React.memo(function CustomMarker({
    isSelected,
    tipo,
}: Props) {
    return isSelected ? (
        <SelectedMarker tipo={tipo} />
    ) : (
        <UnselectedMarker tipo={tipo} />
    );
});
const SelectedMarker = React.memo(({ tipo }: { tipo: string }) => {
    return (
        <View style={styles.markerContainer}>
            <View style={[styles.marker, styles.markerSelected]}>
                <Ionicons
                    name={tipo === "apunte" ? "document-text" : "book"}
                    size={14}
                    color={Colors.white}
                />
            </View>
            <View style={[styles.markerArrow, styles.markerArrowSelected]} />
        </View>
    );
});

const UnselectedMarker = React.memo(({ tipo }: { tipo: string }) => {
    return (
        <View style={styles.markerContainer}>
            <View style={styles.marker}>
                <Ionicons
                    name={tipo === "apunte" ? "document-text" : "book"}
                    size={14}
                    color={Colors.white}
                />
            </View>
            <View style={styles.markerArrow} />
        </View>
    );
});

const styles = StyleSheet.create({
    markerContainer: {
        alignItems: "center",
        width: 40,
        height: 52, 
    },
    marker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.white,
        backgroundColor: Colors.primary,
        elevation: 5,
    },
    markerSelected: {
        backgroundColor: Colors.cta,
    },
    markerArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: Colors.primary,
        marginTop: -4,
    },
    markerArrowSelected: {
        borderTopColor: Colors.cta,
    },
});