import BaseModal from "@/components/ui/BaseModal";
import PrimaryButton from "@/components/ui/Boton/Primary";
import SecondaryButton from "@/components/ui/Boton/Secondary";
import CustomInput from "@/components/ui/CustomInput";
import { Colors } from "@/constants/Colors";
import * as Google from "expo-auth-session/providers/google";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from "../contexts/AuthContext";
const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle, verificarEmail, reenviarVerificacion } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    email_verificado?: string;
    codigo?: string;
    cuenta_verificada?: string
  }>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const clearErrors = () => {
    setErrors({});
    setGeneralError("");
  };

  const closeModal = () => {
    clearErrors();
    setCodigo("");
    setResendMessage(null);
    setAlreadyVerified(false);
    setVerificationSuccess(false);
    setModalVisible(false);
  }

  const openModal = () => {
    clearErrors();
    setCodigo("");
    setResendMessage(null);
    setModalVisible(true);
  }

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleGoogleLogin = async (idToken: string) => {
    setLoading(true); // activar loading
    try {
      await loginWithGoogle(idToken);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log(error);

      const data = error?.data;

      if (data?.error) {
        setGeneralError(data.error);
        return;
      }
      setGeneralError("Error inesperado. Intenta nuevamente.");
    } finally {
      setLoading(false); // desactivar loading
    }
  };

  const handleLogin = async () => {
    const newErrors: any = {};

    clearErrors();

    if (!email) {
      newErrors.email = "El email es obligatorio";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Email inválido";
    }

    if (!password) newErrors.password = "La contraseña es obligatoria";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      console.log(err);
      const data = err?.data;

      if (data?.errors) {
        setErrors(data.errors);
        data.errors.email_verificado ? openModal() : setModalVisible(false);
        return;
      }

      if (data?.error) {
        setGeneralError(data.error);
        return;
      }

      setGeneralError("Error inesperado. Intenta nuevamente.");

    } finally {
      setLoading(false); // desactivar loading
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
      await verificarEmail(email, codigo, "VERIFY_EMAIL");

      setVerificationSuccess(true);

      setTimeout(async () => {
        await login(email, password);
        setVerificationSuccess(false);
        setModalVisible(false);
        setCodigo("");
      }, 2000);

    } catch (error: any) {
      console.log(error);

      const data = error?.data;

      if (data?.errors) {
        setErrors(data.errors);

        if (data.errors.cuenta_verificada) {
          setAlreadyVerified(true);
          setModalVisible(true);

          setTimeout(() => {
            setModalVisible(false);
            setAlreadyVerified(false);
          }, 2500);
        }
        return;
      }

    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);

    try {
      await reenviarVerificacion(email, "VERIFY_EMAIL");

      setResendMessage(
        "Te reenviamos el código. Revisá tu bandeja de entrada y la carpeta de spam."
      );
    } catch (error: any) {
      console.log(error);

      const data = error?.data;

      if (data?.errors) {
        setErrors(data.errors);

        if (data.errors.cuenta_verificada) {
          setAlreadyVerified(true);
          setModalVisible(true);

          setTimeout(() => {
            setModalVisible(false);
            setAlreadyVerified(false);
          }, 2500);
        }
        return;
      }

      setResendMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false} // oculta la barra de scroll vertical
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerContainer}>
        <ImageBackground
          source={require("../assets/images/Fondo-Login.png")}
          style={styles.headerImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["transparent", Colors.background]}
            start={{ x: 0, y: 0.1 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradient}
          />
        </ImageBackground>
      </View>

      <View style={styles.form}>
        <View style={styles.title_div}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.subtitle}>Bienvenido</Text>
        </View>

        <CustomInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors({ email: "" });
          }}
          keyboardType="email-address"
          error={!!errors.email}
          errorMessage={errors.email}
        />

        <CustomInput
          placeholder="Contraseña"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors({ password: "" });
          }}
          secureTextEntry
          error={!!errors.password}
          errorMessage={errors.password}
        />

        {generalError ? <Text style={styles.error}>{generalError}</Text> : null}

        <PrimaryButton
          title="Iniciar sesión"
          onPress={handleLogin}
          styleBtn={{ width: "100%", height: 45, marginTop: 15 }}
          disabled={loading}
        />

        {loading ? <ActivityIndicator color="#fff" size="small" /> : null}

        <Text style={styles.footerText}>
          ¿Olvidaste tu contraseña?{" "}
          <Text
            style={styles.link}
            onPress={() => router.push("/reset-password")}
          >
            Restablécela
          </Text>
        </Text>

        <TouchableOpacity
          style={styles.googleButton}
          disabled={!request || loading}
          onPress={() => promptAsync()}
        >
          <Text style={styles.googleButtonText}>Login con Google</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          ¿No tienes cuenta?{" "}
          <Text style={styles.link} onPress={() => router.push("/register")}>
            Regístrate
          </Text>
        </Text>

      </View>
      <BaseModal visible={modalVisible} onClose={closeModal} showCloseButton>
        {alreadyVerified ? (
          <>
            <Text style={styles.titleModal}>
              Tu cuenta ya está verificada
            </Text>

            <Text style={styles.description}>
              Este correo ya fue verificado correctamente.
              {"\n\n"}
              Iniciá sesión para continuar.
            </Text>

            <ActivityIndicator
              style={{ marginTop: 20 }}
              size="small"
              color={Colors.primary}
            />
          </>
        ) : verificationSuccess ? (
          <>
            <Text style={styles.titleModal}>
              ¡Email verificado con éxito!
            </Text>

            <Text style={styles.description}>
              Tu correo fue verificado correctamente.
              {"\n\n"}
              En unos segundos vas a ingresar automáticamente.
            </Text>

          </>
        ) : (
          <>
            <Text style={styles.titleModal}>Tu email aún no está verificado</Text>

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
                title="Verificar"
                onPress={handleVerifyCode}
                disabled={loading}
              />
            </View>
          </>
        )}
      </BaseModal>

    </KeyboardAwareScrollView >
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerContainer: {
    height: height * 0.40,
    width: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "40%",
    width: "100%",
  },
  form: {
    flex: 1,
    padding: 20,
    alignItems: "stretch",
    marginLeft: 39,
    marginRight: 39,
  },
  title_div: {
    width: "100%",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 20,
    marginBottom: 10,
    color: Colors.primary,
    width: "100%",
    textAlign: "left",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 400,
    color: "#838589",
    width: "100%",
    textAlign: "left",
  },
  footerText: {
    marginVertical: 15,
    fontSize: 14,
    color: "#555",
    textAlign: "center",
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
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: Colors.white,
  },
  googleButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
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

});
