import PrimaryButton from "@/components/ui/Boton/Primary";
import CustomInput from "@/components/ui/CustomInput";
import { Colors } from "@/constants/Colors";
import * as Google from "expo-auth-session/providers/google";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from "../contexts/AuthContext";
const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setLoading(true); // activar loading
    try {
      await loginWithGoogle(idToken);
      router.replace("/(tabs)");
    } catch (error: any) {
      setError(error.message);
      Alert.alert(
        "Error",
        error.message || "Ocurrió un error al iniciar sesión con Google"
      );
    } finally {
      setLoading(false); // desactivar loading
    }
  };
  const handleLogin = async () => {
    setLoading(true); // activar loading
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      setError("Contraseña o email invalidos");
    } finally {
      setLoading(false); // desactivar loading
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1}}
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
          <Text style={styles.title}>Log in</Text>
          <Text style={styles.subtitle}>Bienvenido</Text>
        </View>

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

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          title="Iniciar sesión"
          onPress={handleLogin}
          styleBtn={{ width: "100%", height: 45, marginTop: 15 }}
          disabled={loading}
        />

        {loading ? <ActivityIndicator color="#fff" size="small" /> : null}

        <Text style={styles.footerText}>
          ¿No tienes cuenta?{" "}
          <Text style={styles.link} onPress={() => router.push("/register")}>
            Regístrate
          </Text>
        </Text>

        <Text style={styles.orText}>o</Text>

        <TouchableOpacity
          style={styles.googleButton}
          disabled={!request || loading}
          onPress={() => promptAsync()}
        >
          <Text style={styles.googleButtonText}>Login con Google</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerContainer: {
    height: height * 0.45,
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
