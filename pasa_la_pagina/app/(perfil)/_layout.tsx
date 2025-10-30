import { PublicacionProvider } from "@/contexts/PublicacionContext";
import { UserProvider } from "@/contexts/UserContext";
import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function PerfilLayout() {
  return (
    <PublicacionProvider>
      <UserProvider>
        <View style={styles.container}>
          <Slot />
        </View>
      </UserProvider>
    </PublicacionProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
