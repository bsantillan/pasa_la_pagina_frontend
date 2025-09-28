import PrimaryButton from "@/components/ui/Boton/Primary";
import { Colors } from "@/constants/Colors";
import { usePublicacion } from "@/contexts/PublicacionContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ElegirTipoScreen() {
  const { setTipo, reset } = usePublicacion();
  const router = useRouter();

  const elegirLibro = () => {
    reset();
    setTipo("libro");
    router.push("/(publicacion)/libro");
  };

  const elegirApunte = () => {
    reset();
    setTipo("apunte");
    router.push("/(publicacion)/apunte");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear publicación</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>¿Qué querés publicar?</Text>
        <PrimaryButton
          title="Libro"
          styleBtn={styles.styleBtn}
          styleTxt={styles.styleTxt}
          onPress={elegirLibro}
        />
        <PrimaryButton
          title="Apunte"
          styleBtn={styles.styleBtn}
          styleTxt={styles.styleTxt}
          onPress={elegirApunte}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    marginTop: 40,
    marginBottom: 65,
  },
  backButton: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#000000",
  },
  content: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    marginTop: 150,
  },
  title: {
    fontSize: 32,
    fontWeight: 600,
    marginBottom: 36,
    lineHeight: 33,
    textAlign: "left",
    width: "100%",
  },
  styleBtn: {
    backgroundColor: Colors.background,
    width: "100%",
    height: 36,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 24,
  },
  styleTxt: {
    color: Colors.primary,
    fontWeight: 600,
    fontSize: 12,
  },
});
