import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import BottomNavbar from "@/components/ui/BottomNavbar";
import Header from "@/components/ui/Header";
import { IntercambioProvider } from "@/contexts/IntercambioContext";
import { PublicacionProvider } from "@/contexts/PublicacionContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    <AuthProvider>
      <IntercambioProvider>
        <PublicacionProvider>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <StatusBar style="auto" />

            <AuthGateLayout />
          </ThemeProvider>
        </PublicacionProvider>
      </IntercambioProvider>
    </AuthProvider>
  );
}

function AuthGateLayout() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const currentSegment = segments[0];
  const hideHeaderInHeader = ["login", "register", "(publicacion)", "chat"];
  const hideHeaderInNavBar = ["login", "register", "chat"];
  const showHeader = !hideHeaderInHeader.includes(currentSegment ?? "");
  const showNavBar = !hideHeaderInNavBar.includes(currentSegment ?? "");

  useEffect(() => {
    if (accessToken) {
      router.replace("/(tabs)");
    }
  }, [accessToken, router]);

  return <MainLayout showHeader={showHeader} showNavBar={showNavBar} />;
}

function MainLayout({ showHeader, showNavBar }: { showHeader: boolean, showNavBar: boolean }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {showHeader && <Header />}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      {showNavBar && <BottomNavbar />}
    </SafeAreaView>
  );
}

