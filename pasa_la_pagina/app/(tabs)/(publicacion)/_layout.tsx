import { useAuth } from "@/contexts/AuthContext";
import { PublicacionProvider } from "@/contexts/PublicacionContext";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

export default function PublicacionLayout() {
  const { accessToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  if (!accessToken) return null;

  return (
    <View style={styles.container}>
      <PublicacionProvider>
        <Slot />
      </PublicacionProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, // importante para que el contenido ocupe toda la pantalla
});
