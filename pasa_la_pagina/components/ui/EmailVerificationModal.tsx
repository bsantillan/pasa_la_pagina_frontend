import PrimaryButton from "@/components/ui/Boton/Primary";
import SecondaryButton from "@/components/ui/Boton/Secondary";
import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
    visible: boolean;
    email: string;
    code: string;
    loading?: boolean;
    onChangeCode: (text: string) => void;
    onConfirm: () => void;
    onClose: () => void;
}

export default function EmailVerificationModal({
    visible,
    email,
    code,
    loading = false,
    onChangeCode,
    onConfirm,
    onClose
}: Props) {
    const [errors, setErrors] = useState<{
        codigo?: string;
    }>({});
    const [generalError, setGeneralError] = useState("");

    const handleResendEmail = async () => {
        try {
            setErrors({ codigo: "a" })
        } catch {
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Tu email aún no está verificado</Text>

                    <Text style={styles.description}>
                        Para poder continuar, necesitás verificar tu correo{" "}
                        <Text style={{ fontWeight: "900" }}>{email}</Text>.
                        {"\n\n"}
                        Ingresá el código de verificación.
                        {"\n"}
                        Revisá tu bandeja de entrada y spam.
                    </Text>

                    <TextInput
                        style={[
                            styles.codeInput,
                            errors.codigo && styles.codeInputError,
                        ]}
                        placeholder="Código de 6 dígitos"
                        keyboardType="numeric"
                        maxLength={6}
                        value={code}
                        placeholderTextColor={errors.codigo ? "#ff6b6b" : "#999"}
                        onChangeText={onChangeCode}
                    />
                    {errors.codigo && (
                        <Text style={styles.errorText}>{errors.codigo}</Text>
                    )}

                    <View style={styles.buttons}>
                        <SecondaryButton
                            title="Reenviar código"
                            onPress={handleResendEmail}
                            disabled={loading}
                        />

                        <PrimaryButton
                            title="Verificar"
                            onPress={onConfirm}
                            disabled={loading || code.length !== 6}
                        />
                    </View>

                    {loading && (
                        <View style={{ marginTop: 12 }}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                        </View>
                    )}
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
    },
    title: {
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
});

