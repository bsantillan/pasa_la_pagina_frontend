import PrimaryButton from "@/components/ui/Boton/Primary";
import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

export default function PortadaScreen() {
    const router = useRouter();
    
    return (
        <ImageBackground
            source={require("../assets/images/Fondo-Portada.png")}
            resizeMode="stretch"
            style={styles.background}
        >
            <View style={styles.overlay}>
                <PrimaryButton
                    title="Iniciar sesión"
                    onPress={() => router.push("/login")}
                />
                <PrimaryButton
                    title="Crear cuenta"
                    onPress={() => router.push("/register")}
                />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: "50%",
    gap: 10
  },
});
