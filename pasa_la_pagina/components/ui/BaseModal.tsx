// components/ui/modals/BaseModal.tsx
import { Colors } from "@/constants/Colors";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BaseModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    showCloseButton?: boolean;
}

export default function BaseModal({
    visible,
    onClose,
    children,
    showCloseButton = false,
}: BaseModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {showCloseButton && (
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    )}

                    {children}
                </View>
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
    modalContent: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 20,
        width: "90%",
        maxWidth: 400,
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