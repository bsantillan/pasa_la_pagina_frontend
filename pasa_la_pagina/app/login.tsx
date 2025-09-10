import PrimaryButton from "@/components/ui/Boton/Primary";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import useGoogleAuth from "@/hooks/useGoogleAuth";
const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { request, promptAsync } = useGoogleAuth(); 


  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <ImageBackground
          source={require("../assets/images/Fondo-Login.png")}
          style={styles.headerImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["transparent", Colors.background]} // de transparente a fondo
            start={{ x: 0, y: 0.1 }} // empieza en 70% de la altura
            end={{ x: 0, y: 1 }}
            style={styles.gradient}
          />
        </ImageBackground>
      </View>

      <View style={styles.form}>
        <View style={styles.title_div}>
          <Text style={styles.title}>Log in</Text>
          <Text style={styles.subtitle}>Bienvenido</Text>
        </View>
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

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          title="Iniciar sesión"
          onPress={handleLogin}
          style={{ width: "100%", height: 45, marginTop: 38 }}
        />
        <Text style={styles.footerText}>
          ¿No tienes cuenta?{" "}
          <Text style={styles.link} onPress={() => router.push("/register")}>
            Regístrate
          </Text>
        </Text>

        <Text style={styles.orText}>o</Text>

        <TouchableOpacity
          style={styles.googleButton}
          disabled={!request}
          onPress={() => promptAsync()}
        >
          <Text style={styles.googleButtonText}>Login con Google</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerContainer: {
    height: height * 0.55,
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
    alignItems: "center",
    marginLeft: 39,
    marginRight: 39,
  },
  title_div: {
    height: 60,
    width: "100%",
    marginBottom: 38,
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 20,
    marginBottom: 10,
    color: Colors.primary,
    width: "100%",
    textAlign: "left",
    height: 24,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 400,
    marginBottom: 13,
    color: "#838589",
    width: "100%",
    textAlign: "left",
    height: 17,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: Colors.background,
    height: 50,
  },
  footerText: {
    marginTop: 20,
    fontSize: 14,
    color: "#555",
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
  orText: {
    marginVertical: 15,
    color: "#999",
    fontSize: 14,
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
});
