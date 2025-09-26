import { Buscador } from "@/components/ui/Search";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { PublicacionProvider } from "@/contexts/PublicacionContext";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CercaTuyo from "../home/homeCercaTuyo";
import NovedadesRecientes from "../home/homeRecomendacion";

export default function HomeScreen() {
  const { logout } = useAuth();

  return (
    <PublicacionProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <Buscador onSelect={(pub) => console.log("Seleccionado:", pub)} />
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Secciones */}
        <CercaTuyo />
        <NovedadesRecientes />

      </ScrollView>
      </SafeAreaView>
    </PublicacionProvider>
  );
}

const styles = StyleSheet.create({
    safeArea: {
    flex: 1,
    backgroundColor: Colors.white
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  logoutButton: {
  marginLeft: 12,
  padding: 8, 
  borderRadius: 8,
},
  logoutText: {
    color: Colors.white,
    fontWeight: "bold",
  },
  buttonWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
});
