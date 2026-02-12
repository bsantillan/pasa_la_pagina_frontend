// components/ui/modals/VerificationModal.tsx
import PrimaryButton from "@/components/ui/Boton/Primary";
import SecondaryButton from "@/components/ui/Boton/Secondary";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Modal, StyleSheet, Text, TextInput, View } from "react-native";

interface VerificationModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    description: React.ReactNode;
    codigo: string;
    setCodigo: (text: string) => void;
    errors: any;
    resendMessage?: string | null;
    loading?: boolean;
    onVerify: () => void;
    onResend: () => void;
}

export default function VerificationModal({
    visible,
    onClose,
    title,
    description,
    codigo,
    setCodigo,
    errors,
    resendMessage,
    loading,
    onVerify,
    onResend,
}: VerificationModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.titleModal}>{title}</Text>

                    <Text style={styles.description}>{description}</Text>

                    <TextInput
                        style={[
                            styles.codeInput,
                            errors?.codigo && styles.codeInputError,
                        ]}
                        placeholder="Código de 6 dígitos"
                        keyboardType="numeric"
                        maxLength={6}
                        value={codigo}
                        onChangeText={setCodigo}
                    />

                    {errors?.codigo && (
                        <Text style={styles.errorText}>{errors.codigo}</Text>
                    )}

                    {resendMessage && (
                        <Text style={styles.resendMessage}>{resendMessage}</Text>
                    )}

                    <View style={styles.buttons}>
                        <SecondaryButton
                            title="Reenviar código"
                            onPress={onResend}
                            disabled={loading}
                        />

                        <PrimaryButton
                            title="Verificar"
                            onPress={onVerify}
                            disabled={loading}
                        />
                    </View>
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
    titleModal: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
        color: Colors.text,
    },
    description: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20,
    },
    codeInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        textAlign: "center",
        letterSpacing: 4,
        marginBottom: 16,
    },
    codeInputError: {
        borderColor: "#ff4444",
        borderWidth: 2,
    },
    errorText: {
        color: "#ff4444",
        fontSize: 12,
        marginTop: -10,
        marginBottom: 12,
        marginLeft: 4,
    },
    buttons: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
        justifyContent: "center",
    },
    resendMessage: {
        marginTop: 6,
        fontSize: 13,
        color: Colors.primary,
        textAlign: "center",
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    }
});