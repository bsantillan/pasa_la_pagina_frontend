import PrimaryButton from "@/components/ui/Boton/Primary";
import { Colors } from "@/constants/Colors";
import { useEnums } from "@/contexts/EnumsContext";
import { usePublicacion } from "@/contexts/PublicacionContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function ApunteForm() {
  const [step, setStep] = useState(1);
  const { apunte, updateApunte } = usePublicacion();
  const { idiomas, buscarIdiomas, nivelesEducativos, fetchNivelesEducativos, loading } = useEnums();
  const [buscando, setBuscando] = useState(false);
  const [idiomasFiltrados, setIdiomasFiltrados] = useState<string[]>([]);
  const [query, setQuery] = useState(""); // Búsqueda de idioma

  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(step - 1);
    }
  };

  useEffect(() => {
    if (!nivelesEducativos) fetchNivelesEducativos();
    const fetchData = async () => {
      if (query.trim().length > 0) {
        const resultados = await buscarIdiomas(query.trim());
        setIdiomasFiltrados(resultados);
        setBuscando(true);
      } else {
        setBuscando(false);
      }
    };

    const timeout = setTimeout(fetchData, 200); // debounce 200ms
    return () => clearTimeout(timeout);
  }, [query]);

  // ApunteForm.tsx (fragmento)
  const isStep1Valid = () =>
    apunte.titulo?.trim() &&
    Number.isFinite(apunte.anio_elaboracion) &&
    apunte.anio_elaboracion! > 0 &&
    apunte.idioma?.trim();

  const isStep2Valid = () =>
    Number.isFinite(apunte.paginas) &&
    apunte.paginas! > 0 &&
    (apunte.nuevo === true || apunte.nuevo === false) &&
    (apunte.digital === true || apunte.digital === false) &&
    (!apunte.digital || apunte.url?.trim());

  const isStep3Valid = () =>
    !!apunte.nivel_educativo?.trim() &&
    !!apunte.institucion?.trim() &&
    !!apunte.materia?.trim() &&
    !!apunte.seccion?.trim() &&
    (apunte.nivel_educativo !== "Superior" || !!apunte.carrera?.trim());

  return (
    <KeyboardAwareScrollView
      style={styles.scrollContent}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={100}
      enableAutomaticScroll
    >
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
              placeholder="Titulo"
              onChangeText={(text) => updateApunte({ titulo: text })}
            />

            {/* Descripción */}
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={styles.input}
              placeholder="Descripcción"
              value={apunte.descripcion || ""}
              onChangeText={(text) => updateApunte({ descripcion: text })}
            />

            {/* --- Input de idioma --- */}
            <Text style={styles.label}>Idioma</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={query || apunte.idioma || ""}
                onChangeText={(text) => {
                  setQuery(text);
                  updateApunte({ idioma: "" });
                  setBuscando(Boolean(text.trim()));
                }}
                placeholder="Escribí y seleccioná un idioma "
                style={styles.input}
              />

              {buscando && idiomasFiltrados.length > 0 && (
                <ScrollView
                  style={styles.dropdownScroll}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}
                >
                  {idiomasFiltrados.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        setBuscando(false);
                        setQuery("");
                        updateApunte({ idioma: item });
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

              )}
            </View>

            <Text>Año de elaboración</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Año de elaboración"
              value={String(apunte.anio_elaboracion || "")}
              onChangeText={(anio) =>
                updateApunte({ anio_elaboracion: parseInt(anio) })
              }
            />

            <PrimaryButton
              title="Siguiente"
              onPress={() => setStep(2)}
              styleBtn={styles.primaryButton}
              disabled={!isStep1Valid()}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text>Cantidad de páginas</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Cantidad de paginas"
              value={String(apunte.paginas || "")}
              onChangeText={(cant) =>
                updateApunte({ paginas: parseInt(cant) })
              }
            />

            <Text style={styles.label}>Nuevo</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={apunte.nuevo}
                onValueChange={(value) => updateApunte({ nuevo: value })}
              >
                <Picker.Item label="Seleccionar..." value="" />
                <Picker.Item label="Sí" value={true} />
                <Picker.Item label="No" value={false} />
              </Picker>
            </View>

            <Text style={styles.label}>Formato</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={apunte.digital}
                onValueChange={(value) => updateApunte({ digital: value })}
              >
                <Picker.Item label="Seleccionar..." value="" />
                <Picker.Item label="Digital" value={true} />
                <Picker.Item label="Físico" value={false} />
              </Picker>
            </View>
            {apunte.digital && (
              <>
                <Text style={styles.label}>Enlace</Text>
                <TextInput
                  value={apunte.url}
                  onChangeText={(text) => updateApunte({ url: text })}
                  placeholder="Enlace"
                  style={styles.input}
                />
              </>
            )}

            <PrimaryButton
              title="Siguiente"
              onPress={() => setStep(3)}
              styleBtn={styles.primaryButton}
              disabled={!isStep2Valid()}
            />
          </View>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text>Nivel Educativo</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={apunte.nivel_educativo}
                onValueChange={(value) => updateApunte({ nivel_educativo: value })}
              >
                <Picker.Item label="Seleccionar..." value="" />
                {loading && <Picker.Item label="Cargando..." value="" />}
                {nivelesEducativos?.map((nivel) => (
                  <Picker.Item key={nivel} label={nivel} value={nivel} />
                ))}
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
                  onChangeText={(text) => updateApunte({ carrera: text })}
                />
              </>
            )}

            <PrimaryButton
              title="Siguiente"
              onPress={() => router.push("/(publicacion)/publicacion")}
              styleBtn={styles.primaryButton}
              disabled={!isStep3Valid()}
            />
          </View>
        )}
      </View>
    </KeyboardAwareScrollView>
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
  dropdown: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    maxHeight: 150,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: "#000",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#000",
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    color: "#0C1A30",
    marginBottom: 6,
  },
  dropdownScroll: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    maxHeight: 125,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    zIndex: 1000,
    elevation: 5,
  },
});
