import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import BottomNavbar from "@/components/ui/BottomNavbar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect } from "react";

function AuthGate() {
  const { accessToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (accessToken) {
      router.replace("/(tabs)");
    }
  }, [accessToken, router]);

  return <Slot />;

}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }


  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthGate />
        <StatusBar style="auto" />
        <BottomNavbar />
      </ThemeProvider>
    </AuthProvider>
  );
}
