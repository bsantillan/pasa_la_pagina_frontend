import { UserProvider } from "@/contexts/UserContext";
import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function PerfilLayout() {
  return (
    
      <UserProvider>
        <View style={styles.container}>
          <Slot />
        </View>
      </UserProvider>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
