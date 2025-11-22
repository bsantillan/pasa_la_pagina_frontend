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
import Toast from "react-native-toast-message";

import BottomNavbar from "@/components/ui/BottomNavbar";
import { CustomToast } from "@/components/ui/CustomToast";
import Header from "@/components/ui/Header";
import { Colors } from "@/constants/Colors";
import { IntercambioProvider } from "@/contexts/IntercambioContext";
import { NotificationProvider } from "@/contexts/NotificacionContext";
import { PublicacionProvider } from "@/contexts/PublicacionContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
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
      <Toast
        config={{
          NUEVO_MENSAJE: (props) => (
            <CustomToast
              {...props}
              type="NUEVO_MENSAJE"
              icon={<Ionicons name="chatbubble-outline" size={22} color={Colors.primary} />}
            />
          ),
          SOLICITUD_INTERCAMBIO: (props) => (
            <CustomToast
              {...props}
              type="SOLICITUD_INTERCAMBIO"
              icon={<Ionicons name="repeat-outline" size={22} color={Colors.secondary} />}
            />
          ),
          INTERCAMBIO_ACEPTADO: (props) => (
            <CustomToast
              {...props}
              type="INTERCAMBIO_ACEPTADO"
              icon={<Ionicons name="checkmark-circle-outline" size={22} color={Colors.cta} />}
            />
          ),
          INTERCAMBIO_RECHAZADO: (props) => (
            <CustomToast
              {...props}
              type="INTERCAMBIO_RECHAZADO"
              icon={<Ionicons name="close-circle-outline" size={22} color="#E89E00" />}
            />
          ),
          INTERCAMBIO_CANCELADO: (props) => (
            <CustomToast
              {...props}
              type="INTERCAMBIO_CANCELADO"
              icon={<Ionicons name="ban-outline" size={22} color="#D64545" />}
            />
          ),
          INTERCAMBIO_CONCRETADO: (props) => (
            <CustomToast
              {...props}
              type="INTERCAMBIO_CONCRETADO"
              icon={<Ionicons name="checkmark-done-outline" size={22} color="#205249" />}
            />
          ),
        }}
      />
    </SafeAreaView>
  );
}

