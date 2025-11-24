import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

export default function PerfilLayout() {
   const { accessToken } = useAuth();
      const router = useRouter();
  
      useEffect(() => {
          if (!accessToken) {
              router.replace("/login");
          }
      }, [accessToken, router]);
  
      if (!accessToken) return null;
  return (

    <UserProvider>
      <View style={styles.container}>
        <Slot />
      </View>
    </UserProvider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
});
