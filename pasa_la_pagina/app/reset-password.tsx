import { AlertCard } from "@/components/ui/AlertaCard";
import PrimaryButton from "@/components/ui/Boton/Primary";
import SecondaryButton from "@/components/ui/Boton/Secondary";
import CustomInput from "@/components/ui/CustomInput";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ImageBackground,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function ResetPasswordScreen() {

    const router = useRouter();
    const { verificarEmail, passwordReset, requestPasswordReset, reenviarVerificacion } = useAuth();
    const [verificationSuccess, setVerificationSuccess] = useState(false);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [codigo, setCodigo] = useState("");
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        repeatPassword?: string;
        codigo?: string;
    }>({});
    const [generalError, setGeneralError] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalResetPasswordVisible, setModalResetPasswordVisible] = useState(false);
    const [resendMessage, setResendMessage] = useState<string | null>(null);

    useEffect(() => {
        const restoreFlow = async () => {
            const saved = await AsyncStorage.getItem("reset_password_flow");
            if (!saved) return;

            const parsed = JSON.parse(saved);

            const FIFTEEN_MIN = 15 * 60 * 1000;
            const isExpired = Date.now() - parsed.sentAt > FIFTEEN_MIN;

            if (isExpired) {
                await AsyncStorage.removeItem("reset_password_flow");
                return;
            }

            if (parsed.step === "CODE") {
                setEmail(parsed.email);
                setModalVisible(true);
            }
        };

        restoreFlow();
    }, []);

    const clearErrors = () => {
        setErrors({});
        setGeneralError("");
    };

    const isValidEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSendCodigo = async () => {
        const newErrors: any = {};

        clearErrors();

        if (!email) {
            newErrors.email = "El email es obligatorio";
        } else if (!isValidEmail(email)) {
            newErrors.email = "Email inválido";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        clearErrors();

        try {
            await requestPasswordReset(email);

            await AsyncStorage.setItem(
                "reset_password_flow",
                JSON.stringify({
                    step: "CODE",
                    email,
                    sentAt: Date.now()
                })
            );

            setModalVisible(true);
        } catch (err: any) {
            console.log(err);
            const data = err?.data;

            if (data?.errors) {
                setErrors(data.errors);
                return;
            }

            if (data?.error) {
                setGeneralError(data.error);
                return;
            }

            setGeneralError("Error inesperado. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        const newErrors: any = {};

        clearErrors();

        if (!codigo) {
            newErrors.codigo = "El codigo es obligatorio";
        } else if (codigo.length != 6) {
            newErrors.codigo = "El codigo debe tener 6 digitos";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await verificarEmail(email, codigo, "RESET_PASSWORD");

            setVerificationSuccess(true);

            setTimeout(async () => {
                await AsyncStorage.removeItem("reset_password_flow");
                setVerificationSuccess(false);
                setModalVisible(false);
                setCodigo("");
                setStep(2);
            }, 2000);

        } catch (error: any) {
            console.log(error);

            const data = error?.data;

            if (data?.errors) {
                setErrors(data.errors);
                return;
            }

        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        setLoading(true);

        try {
            await reenviarVerificacion(email, "RESET_PASSWORD" );

            setResendMessage(
                "Te reenviamos el código. Revisá tu bandeja de entrada y la carpeta de spam."
            );
        } catch (error: any) {
            console.log(error);

            const data = error?.data;

            if (data?.errors) {
                setErrors(data.errors);
                return;
            }

            setResendMessage(null);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        const newErrors: any = {};

        clearErrors();

        if (!password) {
            newErrors.password = "La contraseña es obligatoria";
        } else if (password.length < 8) {
            newErrors.password = "Mínimo 8 caracteres";
        }

        if (password !== repeatPassword)
            newErrors.repeatPassword = "Las contraseñas no coinciden";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        clearErrors();

        try {
            await passwordReset(email, password);

            await AsyncStorage.removeItem("reset_password_flow");

            setModalResetPasswordVisible(true);

        } catch (err: any) {
            console.log(err);
            const data = err?.data;

            if (data?.errors) {
                setErrors(data.errors);
                return;
            }

            if (data?.error) {
                setGeneralError(data.error);
                return;
            }

            setGeneralError("Error inesperado. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        clearErrors();
        setCodigo("");
        setResendMessage(null);
        setVerificationSuccess(false);
        setModalVisible(false);
    }

    return (
        <ImageBackground
            source={require("../assets/images/Fondo-Registro.png")} // poné la imagen en assets/images
            style={styles.headerImage}
            resizeMode="cover"
        >
            <View style={styles.form}>
                {step === 1 ? (
                    <>
                        <Text style={styles.title}>Restablece tu contraseña</Text>
                        <Text style={styles.subtitle}>Primero lo primero</Text>

                        <CustomInput
                            placeholder="Email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrors({ email: "" })
                            }}
                            keyboardType="email-address"
                            errorMessage={errors.email}
                            error={!!errors.email}
                        />

                        <PrimaryButton
                            title="Enviar Codigo"
                            onPress={handleSendCodigo}
                            styleBtn={{ height: 42, marginTop: 15, width: "100%" }}
                        />

                        <Text style={styles.footerText}>
                            ¿Ya tienes cuenta?{" "}
                            <Text style={styles.link} onPress={() => router.push("/login")}>
                                Inicia sesión
                            </Text>
                        </Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.title}>Casi terminamos</Text>

                        <View style={styles.secInput}>

                            <CustomInput
                                placeholder="Contraseña"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setErrors({ password: "" })
                                }}
                                secureTextEntry
                                errorMessage={errors.password}
                                error={!!errors.password}
                            />

                            <CustomInput
                                placeholder="Repetir contraseña"
                                value={repeatPassword}
                                onChangeText={(text) => {
                                    setRepeatPassword(text);
                                    setErrors({ repeatPassword: "" })
                                }}
                                secureTextEntry
                                errorMessage={errors.repeatPassword}
                                error={!!errors.repeatPassword}
                            />

                        </View>

                        {generalError ? <Text style={styles.error}>{generalError}</Text> : null}

                        <PrimaryButton
                            title="Restablecer Contraseña"
                            onPress={handleUpdatePassword}
                            styleBtn={{ height: 42, marginTop: 38, width: "100%" }}
                        />

                        {loading ? <ActivityIndicator color="#fff" size="small" /> : null}

                        <Text style={styles.footerText}>
                            ¿Ya tienes cuenta?{" "}
                            <Text style={styles.link} onPress={() => router.push("/login")}>
                                Inicia sesión
                            </Text>
                        </Text>
                    </>
                )}
            </View>
            <Modal
                animationType="fade"
                transparent
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>

                        {verificationSuccess ? (
                            <>
                                <Text style={styles.titleModal}>
                                    ¡Codigo verificado!
                                </Text>

                                <Text style={styles.description}>
                                    Podras cambiar tu contraseña.
                                    {"\n\n"}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.titleModal}>
                                    Restablecer contraseña
                                </Text>

                                <Text style={styles.description}>
                                    Te enviamos un código de verificación al correo{" "}
                                    <Text style={{ fontWeight: "900" }}>{email}</Text>.
                                    {"\n\n"}
                                    Ingresá el código para restablecer la contraseña.
                                </Text>

                                <TextInput
                                    style={[
                                        styles.codeInput,
                                        errors.codigo && styles.codeInputError,
                                    ]}
                                    placeholder="Código de 6 dígitos"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    value={codigo}
                                    placeholderTextColor={errors.codigo ? "#ff6b6b" : "#999"}
                                    onChangeText={(text) => {
                                        setCodigo(text);
                                        setErrors({});
                                        setResendMessage(null);
                                    }}
                                />

                                {errors.codigo && (
                                    <Text style={styles.errorText}>{errors.codigo}</Text>
                                )}

                                {resendMessage && (
                                    <Text style={styles.resendMessage}>{resendMessage}</Text>
                                )}

                                <View style={styles.buttons}>
                                    <SecondaryButton
                                        title="Reenviar código"
                                        onPress={handleResendEmail}
                                        disabled={loading}
                                    />

                                    <PrimaryButton
                                        title="Verificar código"
                                        onPress={handleVerifyCode}
                                        disabled={loading}
                                    />
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal
                visible={modalResetPasswordVisible}
                transparent
                animationType="fade"
                onRequestClose={() => { setModalResetPasswordVisible(false); router.replace("/login"); }}
            >
                <View style={styles.modalBackground}>
                    <AlertCard
                        title={`Restablecimiento de la contraseña`}
                        description={
                            <Text>
                                Se restablecio correctamente la contraseña de:
                                {"\n\n"}
                                <Text style={{ fontWeight: "600" }}>{email}</Text>.
                                {"\n\n"}
                                Inicia sesión nuevamente.
                            </Text>
                        } onAccept={() => {
                            setModalResetPasswordVisible(false); router.replace("/login")
                        }}
                        acceptLabel="Cerrar"
                    />
                </View>
            </Modal>
        </ImageBackground>
    );

}

const styles = StyleSheet.create({
    headerImage: {
        width: "100%",
        height: "100%",
    },
    form: {
        flex: 1,
        padding: 20,
        alignItems: "stretch",
        marginLeft: 39,
        marginRight: 39,
        justifyContent: "center",
    },
    title: {
        width: "100%",
        fontSize: 24,
        fontWeight: "600",
        lineHeight: 20,
        marginBottom: 10,
        color: Colors.primary,
        textAlign: "left",
    },
    subtitle: {
        width: "100%",
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 17,
        marginBottom: 30,
        color: "#838589",
        textAlign: "left",
    },
    secInput: {
        marginTop: 38,
        width: "100%",
    },
    footerText: {
        marginTop: 20,
        fontSize: 14,
        fontWeight: 400,
        color: "#838589",
        textAlign: "center",
        width: "100%",
    },
    link: {
        color: Colors.cta,
        fontWeight: "400",
        textDecorationLine: "underline",
    },
    error: {
        color: "red",
        marginBottom: 10,
        textAlign: "center",
        width: "100%",
    },
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
    },
});
