import PrimaryButton from "@/components/ui/Boton/Primary";
import { Buscador } from "@/components/ui/Search";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { PublicacionProvider } from "@/contexts/PublicacionContext";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import CercaTuyo from "../home/homeCercaTuyo";

// Secciones


export default function HomeScreen() {
  const { logout } = useAuth();

  return (
    <PublicacionProvider>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Buscador arriba */}
        <View style={styles.searchWrapper}>
          <Buscador onSelect={(pub) => console.log("Seleccionado:", pub)} />
        </View>

        {/* Secciones */}
        <CercaTuyo />


        {/* Botón de logout */}
        <View style={styles.buttonWrapper}>
          <PrimaryButton title="Cerrar sesión" onPress={() => logout()} />
        </View>
      </ScrollView>
    </PublicacionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchWrapper: {
    padding: 16,
    backgroundColor: Colors.background,
  },
  buttonWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
});
