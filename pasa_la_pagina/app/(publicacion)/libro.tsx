import PrimaryButton from "@/components/ui/Boton/Primary";
import ISBNScanner from "@/components/ui/ISBNScanner";
import { Colors } from "@/constants/Colors";
import { useEnums } from "@/contexts/EnumsContext";
import { useLibro } from "@/contexts/LibroContext";
import { LibroData, usePublicacion } from "@/contexts/PublicacionContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
export default function LibroScreen() {
  const [step, setStep] = useState(1); // Paso actual del formulario
  const [stepHistory, setStepHistory] = useState<number[]>([1]); // Historial de pasos
  const [showScanner, setShowScanner] = useState(false); // Control del modal del escáner
  const [query, setQuery] = useState(""); // Búsqueda de idioma
  const [idiomasFiltrados, setIdiomasFiltrados] = useState<string[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [libros, setLibros] = useState<LibroData[]>([]);

  const { comunes, libro, updateLibro, updateComunes } = usePublicacion();
  const { fetchBookFromApi, fetchBookFromBackend } = useLibro();
  const { buscarIdiomas } = useEnums();

  useEffect(() => {
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

  // Nueva función para avanzar (mantiene el historial)
  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    setStepHistory((prev) => [...prev, nextStep]);
  };

  // Actualizamos handleBack para usar el historial
  const handleBack = () => {
    if (stepHistory.length > 1) {
      const newHistory = [...stepHistory];
      newHistory.pop(); // elimina el paso actual
      const previousStep = newHistory[newHistory.length - 1];

      if (previousStep === 1) {
        updateLibro({
          isbn: undefined,
          autor: "",
          editorial: "",
          genero: "",
          titulo: "",
          idioma: "",
        });
      }

      setStep(previousStep);
      setStepHistory(newHistory);
    } else {
      router.back(); // si ya está en el primero, sale
    }
  };

  const handleBuscarISBN = async () => {
    if (!libro.isbn) return;
    setLoading(true);

    const libros_api = await fetchBookFromApi(String(libro.isbn));

    if (libros_api.length > 0) {
      updateLibro({ titulo: libros_api[0].titulo })
      updateLibro({ autor: libros_api[0].autor })
      updateLibro({ editorial: libros_api[0].editorial })
      goToStep(3);
    } else {
      const libros_backend = await fetchBookFromBackend(String(libro.isbn));

      if (libros_backend.length > 0) {
        updateLibro({ titulo: "" })
        updateLibro({ autor: "" })
        updateLibro({ editorial: "" })

        console.log(libros_backend);
        setLibros(libros_backend);
        console.log(libros);
        goToStep(2);
      } else {
        goToStep(3);
      }
    }
    setLoading(false);
  };

  const crearNuevoLibro = () => {
    updateLibro({
      autor: "",
      editorial: "",
      genero: "",
      titulo: "",
      idioma: "",
    });
    goToStep(3);
  }

  const isStep3Complete = () =>
    libro.titulo?.trim() &&
    libro.autor?.trim() &&
    libro.editorial?.trim() &&
    libro.idioma?.trim();

  const isStep4Complete = () =>
    libro.genero?.trim() &&
    comunes.descripcion?.trim() &&
    (comunes.nuevo === true || comunes.nuevo === false) &&
    (comunes.digital === true || comunes.digital === false) &&
    (!comunes.digital || comunes.url?.trim());

  // --- RENDER DE STEPS ---
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={{ marginTop: 120 }}>
            <Text style={styles.title}>Escanea código ISBN</Text>
            <Text style={styles.subtitle}>
              El ISBN es el código único de tu libro. Podés encontrarlo en la contratapa o en la página de créditos.
            </Text>

            <Text style={styles.label}>Código</Text>
            <TextInput
              value={String(libro.isbn || "")}
              onChangeText={(num) => updateLibro({ isbn: parseInt(num) })}
              placeholder="Ingresá ISBN"
              style={styles.input_isbn}
              keyboardType="numeric"
            />

            <View style={styles.view_isbn}>
              <PrimaryButton
                styleBtn={styles.styleBtn}
                title="Escanear código"
                onPress={() => setShowScanner(true)}
                disabled={loading}
              />
              <PrimaryButton
                styleBtn={styles.styleBtn}
                title={loading ? "Cargando..." : "Buscar por ISBN"}
                onPress={handleBuscarISBN}
                disabled={loading || !libro.isbn}
              />
            </View>
          </View>
        );
      /** Paso 2: Seleccionar libro existente o crear uno nuevo */
      case 2:
        return (
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Resultados encontrados</Text>
            <Text style={styles.subtitle}>
              Encontramos varios libros asociados al ISBN {libro.isbn}. Seleccioná uno de la lista o creá uno nuevo.
            </Text>
            {loading ? (
              <Text>Cargando libros...</Text>
            ) : (
              <>
                <FlatList
                  data={libros}
                  keyExtractor={(item, index) => String(index)}
                  nestedScrollEnabled={true}
                  scrollEnabled={false} // 👈 Desactiva el scroll interno
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        updateLibro(item);
                        goToStep(4);
                      }}
                      style={{
                        borderWidth: 1,
                        borderColor: "#838589",
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 8,
                        flexDirection: "column"
                      }}
                    >
                      {/* Título */}
                      <Text style={styles.bookTitle}>{item.titulo}</Text>

                      <View >
                        <Text style={{ color: "#838589" }}>Autor: <Text style={{ color: "#000" }}>{item.autor}</Text></Text>
                        <Text style={{ color: "#838589" }}>Editorial: <Text style={{ color: "#000" }}>{item.editorial}</Text></Text>
                        <Text style={{ color: "#838589" }}>Idioma: <Text style={{ color: "#000" }}>{item.idioma}</Text></Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
                <View style={styles.view_isbn}>
                  <PrimaryButton
                    styleBtn={styles.styleBtn}
                    title="Crear nuevo libro"
                    onPress={() => crearNuevoLibro()}
                  />
                </View>
              </>
            )}
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.title}>Revisar y completar la información</Text>
            <Text style={styles.subtitle}>
              Trajimos automáticamente los datos de tu libro a partir del ISBN. Revisalos y completá la información que falte.
            </Text>

            <Text style={styles.label}>Título</Text>
            <TextInput
              value={libro.titulo}
              onChangeText={(text) => updateLibro({ titulo: text })}
              placeholder="Título"
              style={styles.input}
            />

            <Text style={styles.label}>Autor</Text>
            <TextInput
              value={libro.autor}
              onChangeText={(text) => updateLibro({ autor: text })}
              placeholder="Autor"
              style={styles.input}
            />

            <Text style={styles.label}>Editorial</Text>
            <TextInput
              value={libro.editorial}
              onChangeText={(text) => updateLibro({ editorial: text })}
              placeholder="Editorial"
              style={styles.input}
            />
            {/* --- Input de idioma --- */}
            <Text style={styles.label}>Idioma</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={query || libro.idioma || ""}
                onChangeText={(text) => {
                  setQuery(text);
                  updateLibro({ idioma: "" });
                  setBuscando(Boolean(text.trim()));
                }}
                placeholder="Seleccioná o escribí un idioma..."
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
                        updateLibro({ idioma: item });
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

              )}
            </View>
          </View>
        );

      case 4:
        return (
          <View>
            <Text style={styles.title}>Completar la información</Text>
            <Text style={styles.subtitle}>
              Revisá o completá la información que falte antes de continuar.
            </Text>

            {/* --- Otros campos --- */}
            <Text style={styles.label}>Género</Text>
            <TextInput
              value={libro.genero}
              onChangeText={(text) => updateLibro({ genero: text })}
              placeholder="Género"
              style={styles.input}
            />

            {/* Descripción */}
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={styles.input}
              placeholder="Descripcción"
              value={comunes.descripcion || ""}
              onChangeText={(text) => updateComunes({ descripcion: text })}
            />

            <Text style={styles.label}>Nuevo</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={comunes.nuevo}
                onValueChange={(value) => updateComunes({ nuevo: value })}
              >
                <Picker.Item label="Seleccionar..." value="" />
                <Picker.Item label="Sí" value={true} />
                <Picker.Item label="No" value={false} />
              </Picker>
            </View>

            <Text style={styles.label}>Formato</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={comunes.digital}
                onValueChange={(value) => updateComunes({ digital: value })}
              >
                <Picker.Item label="Seleccionar..." value="" />
                <Picker.Item label="Digital" value={true} />
                <Picker.Item label="Físico" value={false} />
              </Picker>
            </View>
            {comunes.digital && (
              <>
                <Text style={styles.label}>Enlace</Text>
                <TextInput
                  value={comunes.url}
                  onChangeText={(text) => updateComunes({ url: text })}
                  placeholder="Enlace"
                  style={styles.input}
                />
              </>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.scrollContent}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={100}
      enableAutomaticScroll
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear publicación</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderStep()}

      {/* --- Botones de navegación --- */}
      {step === 1 && null}

      {step === 3 && (
        <PrimaryButton
          styleBtn={{ height: 36 }}
          title="Siguiente"
          onPress={() => goToStep(4)}
          disabled={!isStep3Complete()}
        />
      )}

      {step === 4 && (
        <PrimaryButton
          styleBtn={{ height: 36 }}
          title="Siguiente"
          onPress={() => router.push("/(publicacion)/publicacion")}
          disabled={!isStep4Complete()}
        />
      )}

      {/* --- Modal cámara --- */}
      <Modal visible={showScanner} animationType="slide">
        <ISBNScanner
          onScanned={(data) => updateLibro({ isbn: parseInt(data) })}
          onClose={() => {
            setShowScanner(false);
            handleBuscarISBN;
          }}
        />
      </Modal>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  input_isbn: {
    borderWidth: 1,
    marginBottom: 65,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    height: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    marginTop: 30,
    marginBottom: 32,
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
    fontWeight: "700",
    color: "#000000",
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
    marginBottom: 10,
    height: 35,
    color: "#000000",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 32,
    color: "#838589",
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    color: "#0C1A30",
    marginBottom: 6,
  },
  view_isbn: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 16,
    gap: 10,
  },
  styleBtn: {
    flex: 1,
    paddingHorizontal: 16,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
    borderColor: "#000000",
    marginBottom: 30,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#000000",
    marginBottom: 30,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
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
  bookTitle: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    color: Colors.primary,
    marginBottom: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: Colors.background,
    flexGrow: 1,
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
