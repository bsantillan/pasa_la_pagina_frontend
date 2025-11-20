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
import { Colors } from "@/constants/Colors";
import { IntercambioProvider } from "@/contexts/IntercambioContext";
import { NotificationProvider } from "@/contexts/NotificacionContext";
import { PublicacionProvider } from "@/contexts/PublicacionContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect } from "react";
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
          <NotificationProvider>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <StatusBar style="auto" />

              <AuthGateLayout />
            </ThemeProvider>
          </NotificationProvider>
        </PublicacionProvider>
      </IntercambioProvider>
    </AuthProvider>
  );
}

function AuthGateLayout() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const currentPath = segments.join("/");

  const isRootIndex = currentPath === "";

  const hideHeaderPaths = ["login", "register", "(publicacion)", "chat", "index"];
  const hideNavbarPaths = ["login", "register", "chat"];
  const showHeader = !isRootIndex && !hideHeaderPaths.some((path) => currentPath.includes(path));
  const showNavBar = !isRootIndex && !hideNavbarPaths.some((path) => currentPath.includes(path));

  useEffect(() => {
    if (accessToken) {
      router.replace("/(tabs)");
    }
  }, [accessToken, router]);

  return <MainLayout showHeader={showHeader} showNavBar={showNavBar} />;
}

function MainLayout({ showHeader, showNavBar }: { showHeader: boolean, showNavBar: boolean }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {showHeader && <Header />}
      <Slot />
      {showNavBar && <BottomNavbar />}
    </SafeAreaView>
  );
}

