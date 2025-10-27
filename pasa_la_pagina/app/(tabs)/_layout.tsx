import BottomNavbar from "@/components/ui/BottomNavbar";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { PublicacionProvider } from "@/contexts/PublicacionContext";
import { Slot, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const { accessToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  if (!accessToken) return null;

  return (
    <PublicacionProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: Colors.background }]}
        edges={["top", "bottom"]}
      >
        <View style={{ flex: 1 }}>
          <Slot />
          <BottomNavbar />
        </View>
      </SafeAreaView>
    </PublicacionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
