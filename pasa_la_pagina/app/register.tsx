import PrimaryButton from "@/components/ui/Boton/Primary";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
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

                <TextInput
                  style={styles.input}
                  placeholder="Nombre"
                  value={nombre}
                  onChangeText={setNombre}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Apellido"
                  value={apellido}
                  onChangeText={setApellido}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <PrimaryButton
                  title="Siguiente"
                  onPress={handleNext}
                  styleBtn={{ height: 42, marginTop: 38, width: "100%" }}
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
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                  <TextInput
                    style={styles.input}
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
      </ScrollView>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
    safeArea: {
    flex: 1,
    backgroundColor: Colors.background, // mismo fondo que tu app
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
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
    marginBottom: 38,
    color: "#838589",
    textAlign: "left",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: Colors.background,
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
  },
});
