// components/ui/modals/InfoModal.tsx
import { AlertCard } from "@/components/ui/AlertaCard";
import React from "react";
import { Modal, StyleSheet, View } from "react-native";

interface InfoModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    description: React.ReactNode;
    acceptLabel?: string;
}

export default function InfoModal({
    visible,
    onClose,
    title,
    description,
    acceptLabel = "Cerrar",
}: InfoModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <AlertCard
                    title={title}
                    description={description}
                    onAccept={onClose}
                    acceptLabel={acceptLabel}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        right: 0,
        top: 0,
        padding: 4,
        marginRight: 10
    },
    closeText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#999",
    }
});
