import PrimaryButton from "@/components/ui/Boton/Primary";
import { Colors } from "@/constants/Colors";
import { usePublicacion } from "@/contexts/PublicacionContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function ApunteForm() {
  const [step, setStep] = useState(1);
  const { apunte, updateApunte } = usePublicacion(); 
  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(step - 1);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerNav}>
        <TouchableOpacity
          onPress={(event) => handleBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitleNav}>Crear publicación</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Agregar informacion del apunte</Text>
        <Text style={styles.subtitle}>Contanos de qué trata tu apunte.</Text>

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text>Título</Text>
            <TextInput
              style={styles.input}
              value={apunte.titulo}
              onChangeText={(text) => updateApunte({ titulo: text })}
            />

            <Text>Cantidad de páginas</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(apunte.paginas || "")}
              onChangeText={(cant) =>
                updateApunte({ paginas: parseInt(cant) })
              }
            />

            <Text>Año de elaboración</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(apunte.anio_elaboracion || "")}
              onChangeText={(anio) =>
                updateApunte({ anio_elaboracion: parseInt(anio) })
              }
            />

            <Text>Formato</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={apunte.digital}
                onValueChange={(value) => updateApunte({ digital: value })}
              >
                <Picker.Item label="Digital" value= {true} />
                <Picker.Item label="Físico" value={false} />
              </Picker>
            </View>

            <Text>Idioma</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={apunte.idioma}
                onValueChange={(value) => updateApunte({ idioma: value })}
              >
                <Picker.Item label="Español" value="Español" />
                <Picker.Item label="Inglés" value="Inglés" />
                <Picker.Item label="Otro" value="Otro" />
              </Picker>
            </View>

            <PrimaryButton
              title="Siguiente"
              onPress={() => setStep(2)}
              styleBtn={styles.primaryButton}
            />          
          </View>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text>Nivel Educativo</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={apunte.nivel_educativo}
                onValueChange={(value) =>
                  updateApunte({ nivel_educativo: value })
                }
              >
                <Picker.Item label="Primaria" value="Primaria" />
                <Picker.Item label="Secundaria" value="Secundaria" />
                <Picker.Item label="Superior" value="Superior" />
              </Picker>
            </View>

            <Text>Institución</Text>
            <TextInput
              style={styles.input}
              value={apunte.institucion}
              onChangeText={(text) => updateApunte({ institucion: text })}
            />

            <Text>Materia</Text>
            <TextInput
              style={styles.input}
              value={apunte.materia}
              onChangeText={(text) => updateApunte({ materia: text })}
            />

            <Text>Sección</Text>
            <TextInput
              style={styles.input}
              value={apunte.seccion}
              onChangeText={(text) => updateApunte({ seccion: text })}
            />

            {apunte.nivel_educativo === "Superior" && (
              <>
                <Text>Carrera</Text>
                <TextInput
                  style={styles.input}
                  value={apunte.carrera}
                  onChangeText={(text) => updateApunte({ carrera : text})}
                />
              </>
            )}

            <PrimaryButton
              title="Siguiente"
              onPress={() => router.push("/(publicacion)/publicacion")}
              styleBtn={styles.primaryButton}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: Colors.background,
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    marginTop: 30,
    marginBottom: 0,
  },
  backButton: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleNav: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#000000",
  },
  title: {
    fontSize: 25,
    fontWeight: 600,
    width: "100%",
    textAlign: "left",
    marginBottom: 10,
    color: "#000000"
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 400,
    width: "100%",
    textAlign: "left",
    marginBottom: 22,
    color: "#838589"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  stepContainer: {
    marginBottom: 24,
    width: "100%"
  },
  input: {
    borderWidth: 1,
    borderColor: "#000000",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop: 6,
    borderRadius: 10,
    height: 50
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#000000",
    paddingLeft: 10,
    paddingBottom: 40,
    marginBottom: 30,
    marginTop: 6,
    borderRadius: 10,
    height: 50
  },
  primaryButton: {
    marginTop: 42,
    height: 36,
    alignItems: "center",
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: "bold",
  },
});
