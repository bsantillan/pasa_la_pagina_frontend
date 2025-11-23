import PrimaryButton from "@/components/ui/Boton/Primary";
import CustomInput from "@/components/ui/CustomInput";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterScreen() {

  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep] = useState(1);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleNext = () => {
    if (!nombre || !apellido) {
      setError("Completa todos los campos");
      return;
    }
    if (nombre.length < 2 || apellido.length < 2) {
      setError("El nombre o apellido deben tener al menos dos caracteres");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleRegister = async () => {
    if (!email || !password || !repeatPassword) {
      setError("Completa todos los campos");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Introduce un email válido");
      return;
    }

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      await register(nombre, apellido, email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
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
              onChangeText={setNombre}
              keyboardType="default"
            />
            <CustomInput
              placeholder="Apellido"
              value={apellido}
              onChangeText={setApellido}
              keyboardType="default"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

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
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <CustomInput
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <CustomInput
                placeholder="Repetir contraseña"
                value={repeatPassword}
                onChangeText={setRepeatPassword}
                secureTextEntry
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>

            <PrimaryButton
              title="Crear cuenta"
              onPress={handleRegister}
              styleBtn={{ height: 42, marginTop: 38, width: "100%" }}
            />

            <Text style={styles.footerText}>
              ¿Ya tienes cuenta?{" "}
              <Text style={styles.link} onPress={() => router.push("/login")}>
                Inicia sesión
              </Text>
            </Text>
          </>
        )}
      </View>
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
    justifyContent: "center",
    marginRight: 39,
    marginLeft: 39,
    alignItems: "center",
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
});
