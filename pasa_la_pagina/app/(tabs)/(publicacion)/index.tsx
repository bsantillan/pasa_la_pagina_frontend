import PrimaryButton from "@/components/ui/Boton/Primary";
import { Colors } from "@/constants/Colors";
import { usePublicacion } from "@/contexts/PublicacionContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function ElegirTipoScreen() {
  const { setTipo, reset } = usePublicacion();
  const router = useRouter();

  const elegirLibro = () => {
    reset();
    setTipo("libro");
    router.push("/(tabs)/(publicacion)/libro");
  };

  const elegirApunte = () => {
    reset();
    setTipo("apunte");
    router.push("/(tabs)/(publicacion)/apunte");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Qué querés publicar?</Text>
      <PrimaryButton title="Libro" styleBtn={styles.styleBtn} styleTxt={styles.styleTxt} onPress={elegirLibro} />
      <PrimaryButton title="Apunte" styleBtn={styles.styleBtn} styleTxt={styles.styleTxt} onPress={elegirApunte} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: Colors.background
  },
  title: { 
    fontSize: 32, 
    fontWeight: 600, 
    marginBottom: 36,
    lineHeight: 33,
    textAlign: "left",
    width: "100%"
  },
  styleBtn: {
    backgroundColor: Colors.background, 
    width: "100%", 
    height:36, 
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 24
  },
  styleTxt: {
    color: Colors.primary, 
    fontWeight: 600, 
    fontSize: 12
  }

});
