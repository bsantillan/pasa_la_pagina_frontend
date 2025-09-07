import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";

type ReviewCardProps = {
    username: string;
    headline: string;
    description: string;
    date: string;
};

export const ReviewCard = ({ username, headline, description, date }: ReviewCardProps) => {
    return (
        <View style={styles.card}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.headline}>{headline}</Text>
            <Text style={styles.description}>{description}</Text>

            <View style={styles.footer}>
                <Text style={styles.date}>{date}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginVertical: 6,
    },
    username: {
        fontSize: 14,
        fontWeight: "bold",
        color: Colors.text,
        marginBottom: 6,
    },
    headline: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 10,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    date: {
        fontSize: 12,
        color: Colors.disabled_primary,
    },
});