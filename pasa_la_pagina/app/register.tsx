import PrimaryButton from "@/components/ui/Boton/Primary";
import CustomInput from "@/components/ui/CustomInput";
import InfoModal from "@/components/ui/InfoModal";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterScreen() {

  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<{
    nombre?: string;
    apellido?: string;
    email?: string;
    password?: string;
    repeatPassword?: string;
    terminos?: string;
  }>({});
  const [generalError, setGeneralError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  const capitalizeFirstLetter = (text: string) => {
    if (!text) return text;

    const firstChar = text.charAt(0);

    if (/[a-zA-Z]/.test(firstChar)) {
      return firstChar.toUpperCase() + text.slice(1);
    }

    return text;
  };

  const clearErrors = () => {
    setErrors({});
    setGeneralError("");
  };

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleNext = () => {
    const newErrors: any = {};

    if (!nombre) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (nombre.length < 2) {
      newErrors.nombre = "Mínimo 2 caracteres";
    }

    if (!apellido) {
      newErrors.apellido = "El apellido es obligatorio";
    } else if (apellido.length < 2) {
      newErrors.apellido = "Mínimo 2 caracteres";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    clearErrors();
    setStep(2);
  };

  const handleRegister = async () => {
    const newErrors: any = {};

    clearErrors();

    if (!email) {
      newErrors.email = "El email es obligatorio";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Email inválido";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    }

    if (password !== repeatPassword)
      newErrors.repeatPassword = "Las contraseñas no coinciden";

    if (!termsAccepted) {
      newErrors.terminos = "Debes aceptar los términos y condiciones";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await register(nombre, apellido, email, password, termsAccepted);
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

  return (
    <ImageBackground
      source={require("../assets/images/Fondo-Registro.png")} // poné la imagen en assets/images
      style={styles.headerImage}
      resizeMode="cover"
    >
      <View style={styles.form}>
        {step === 1 ? (
          <>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Primero lo primero</Text>

            <CustomInput
              placeholder="Nombre"
              value={nombre}
              autoCapitalize="sentences"
              onChangeText={(text) => {
                setNombre(capitalizeFirstLetter(text));
                setErrors({ nombre: "" });
              }}
              keyboardType="default"
              errorMessage={errors.nombre}
              error={!!errors.nombre}
            />

            <CustomInput
              placeholder="Apellido"
              value={apellido}
              autoCapitalize="sentences"
              onChangeText={(text) => {
                setApellido(capitalizeFirstLetter(text));
                setErrors({ apellido: "" });
              }}
              keyboardType="default"
              errorMessage={errors.apellido}
              error={!!errors.apellido}
            />

            <PrimaryButton
              title="Siguiente"
              onPress={handleNext}
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
            <Text style={styles.title}>Casi terminamos, </Text>
            <Text style={styles.title}>{nombre}</Text>
            <View style={styles.secInput}>
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

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => {
                  setTermsAccepted(!termsAccepted);
                  setErrors({ terminos: "" });
                }}
              >
                <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]} />
                <Text style={styles.termsText}>
                  Acepto los{" "}
                  <Text
                    style={styles.link}
                    onPress={() => setTermsModalVisible(true)}
                  >
                    términos y condiciones
                  </Text>
                </Text>
              </TouchableOpacity>

              {errors.terminos && (
                <Text style={styles.error}>{errors.terminos}</Text>
              )}
            </View>

            {generalError ? <Text style={styles.error}>{generalError}</Text> : null}

            <PrimaryButton
              title="Crear cuenta"
              onPress={handleRegister}
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
      <InfoModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          router.replace("/login");
        }}
        title="Verificación del correo electrónico"
        description={
          <Text>
            Te enviamos un código de verificación al correo:
            {"\n\n"}
            <Text style={{ fontWeight: "600" }}>{email}</Text>.
            {"\n\n"}
            Vas a poder ingresarlo cuando intentes iniciar sesión.
          </Text>
        }
      />

      <InfoModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
        title="Términos y Condiciones"
        description={
          <Text>
            Aquí van tus términos y condiciones.
            {"\n\n"}
            1. No usar la app para actividades ilegales.
            {"\n"}
            2. Respetar a otros usuarios.
            {"\n"}
            3. Nos reservamos el derecho de suspender cuentas.
            {"\n\n"}
            (Acá después podés poner los reales o traerlos del backend)
          </Text>
        }
      />

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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  termsContainer: {
    marginTop: 15,
    width: "100%",
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
    marginRight: 8,
    borderRadius: 3,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  termsText: {
    fontSize: 13,
    color: "#666",
    flexShrink: 1,
  },
});
