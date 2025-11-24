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
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

  const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
    const steps = ["Información", "Detalles", "Publicación"];
    return (
      <View style={styles.progressWrapper}>
        <View style={styles.progressContainer}>
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <React.Fragment key={i}>
                <View style={styles.stepItem}>
                  <View style={[
                    styles.progressCircle,
                    isCompleted && styles.progressCircleCompleted,
                    isCurrent && styles.progressCircleCurrent,
                  ]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    ) : (
                      <Text style={[
                        styles.progressNumber,
                        isCurrent && styles.progressNumberCurrent
                      ]}>{stepNum}</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    (isCompleted || isCurrent) && styles.stepLabelActive
                  ]}>{steps[i]}</Text>
                </View>
                {i < totalSteps - 1 && (
                  <View style={styles.lineWrapper}>
                    <View style={[
                      styles.progressLine,
                      isCompleted && styles.progressLineCompleted
                    ]} />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  };

  export default function LibroScreen() {
    const [step, setStep] = useState(1);
    const [stepHistory, setStepHistory] = useState<number[]>([1]);
    const [showScanner, setShowScanner] = useState(false);
    const [query, setQuery] = useState("");
    const [idiomasFiltrados, setIdiomasFiltrados] = useState<string[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [loading, setLoading] = useState(false);
    const [libros, setLibros] = useState<LibroData[]>([]);
    const [showErrors, setShowErrors] = useState(false);

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
      const timeout = setTimeout(fetchData, 200);
      return () => clearTimeout(timeout);
    }, [query]);

    const getProgressStep = () => {
      if (step === 3) return 1;
      if (step === 4) return 2;
      return 0;
    };

    const goToStep = (nextStep: number) => {
      setStep(nextStep);
      setStepHistory((prev) => [...prev, nextStep]);
      setShowErrors(false);
    };

    const handleBack = () => {
      if (stepHistory.length > 1) {
        const newHistory = [...stepHistory];
        newHistory.pop();
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
        setShowErrors(false);
      } else {
        router.back();
      }
    };

    const handleBuscarISBN = async () => {
      if (!libro.isbn) return;
      setLoading(true);
      const libros_api = await fetchBookFromApi(String(libro.isbn));
      if (libros_api.length > 0) {
        updateLibro({ titulo: libros_api[0].titulo, autor: libros_api[0].autor, editorial: libros_api[0].editorial });
        goToStep(3);
      } else {
        const libros_backend = await fetchBookFromBackend(String(libro.isbn));
        if (libros_backend.length > 0) {
          updateLibro({ titulo: "", autor: "", editorial: "" });
          setLibros(libros_backend);
          goToStep(2);
        } else {
          goToStep(3);
        }
      }
      setLoading(false);
    };

    const crearNuevoLibro = () => {
      updateLibro({ autor: "", editorial: "", genero: "", titulo: "", idioma: "" });
      goToStep(3);
    };

    const isStep3Complete = () =>
      libro.titulo?.trim() && libro.autor?.trim() && libro.editorial?.trim() && libro.idioma?.trim();

    const isStep4Complete = () =>
      libro.genero?.trim() &&
      (comunes.nuevo === true || comunes.nuevo === false) &&
      (comunes.digital === true || comunes.digital === false);

    const handleStep3Next = () => {
      if (isStep3Complete()) goToStep(4);
      else setShowErrors(true);
    };

    const handleStep4Next = () => {
      if (isStep4Complete()) {
        router.push("/(publicacion)/publicacion");
      } else {
        setShowErrors(true);
      }
    };

    const getInputStyle = (value: string | undefined) => [
      styles.input,
      showErrors && !value?.trim() && styles.inputError
    ];

    const getPickerStyle = (value: boolean | undefined | string) => [
      styles.pickerWrapper,
      showErrors && (value === undefined || value === "") && styles.inputError
    ];

    const renderStep = () => {
      switch (step) {
        case 1:
          return (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Ingresar código ISBN</Text>
              <Text style={styles.subtitle}>
                El ISBN es el código único de tu libro. Podés encontrarlo en la contratapa o en la página de créditos.
              </Text>
              <Text style={styles.label}>Código</Text>
              <View style={styles.inputRow}>
                <TextInput
                  value={String(libro.isbn || "")}
                  onChangeText={(num) => updateLibro({ isbn: parseInt(num) })}
                  placeholder="Ingresá ISBN"
                  style={styles.inputIsbn}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.scanIcon} onPress={() => setShowScanner(true)} disabled={loading}>
                  <Ionicons name="barcode-outline" size={32} color={Colors.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  styleBtn={styles.confirmBtn}
                  title={loading ? "Cargando..." : "Confirmar"}
                  onPress={handleBuscarISBN}
                  disabled={loading || !libro.isbn}
                />
              </View>
            </View>
          );
        case 2:
          return (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Resultados encontrados</Text>
              <Text style={styles.subtitle}>
                Encontramos varios libros asociados al ISBN {libro.isbn}. Seleccioná uno o creá uno nuevo.
              </Text>
              <FlatList
                data={libros}
                keyExtractor={(_, index) => String(index)}
                nestedScrollEnabled scrollEnabled={false} keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => { updateLibro(item); goToStep(4); }} style={styles.bookCard}>
                    <Text style={styles.bookTitle}>{item.titulo}</Text>
                    <Text style={styles.bookMeta}>Autor: <Text style={styles.bookValue}>{item.autor}</Text></Text>
                    <Text style={styles.bookMeta}>Editorial: <Text style={styles.bookValue}>{item.editorial}</Text></Text>
                    <Text style={styles.bookMeta}>Idioma: <Text style={styles.bookValue}>{item.idioma}</Text></Text>
                  </TouchableOpacity>
                )}
              />
              <PrimaryButton styleBtn={styles.styleBtn} title="Crear nuevo libro" onPress={crearNuevoLibro} />
            </View>
          );
        case 3:
          return (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Información del libro</Text>
              <Text style={styles.subtitle}>
                Ingresá los datos principales del libro para que otros usuarios puedan identificarlo fácilmente.
              </Text>
              <Text style={styles.label}>Título</Text>
              <TextInput value={libro.titulo} onChangeText={(t) => updateLibro({ titulo: t })} placeholder="Título" style={getInputStyle(libro.titulo)} placeholderTextColor={showErrors && !libro.titulo?.trim() ? "#ff6b6b" : "#999"} />
              {showErrors && !libro.titulo?.trim() && <Text style={styles.errorText}>Este campo es obligatorio</Text>}

              <Text style={styles.label}>Autor</Text>
              <TextInput value={libro.autor} onChangeText={(t) => updateLibro({ autor: t })} placeholder="Autor" style={getInputStyle(libro.autor)} placeholderTextColor={showErrors && !libro.autor?.trim() ? "#ff6b6b" : "#999"} />
              {showErrors && !libro.autor?.trim() && <Text style={styles.errorText}>Este campo es obligatorio</Text>}

              <Text style={styles.label}>Editorial</Text>
              <TextInput value={libro.editorial} onChangeText={(t) => updateLibro({ editorial: t })} placeholder="Editorial" style={getInputStyle(libro.editorial)} placeholderTextColor={showErrors && !libro.editorial?.trim() ? "#ff6b6b" : "#999"} />
              {showErrors && !libro.editorial?.trim() && <Text style={styles.errorText}>Este campo es obligatorio</Text>}

              <Text style={styles.label}>Idioma</Text>
              <View style={{ position: "relative", zIndex: 1000 }}>
                <TextInput
                  value={query || libro.idioma || ""}
                  onChangeText={(t) => { setQuery(t); updateLibro({ idioma: "" }); setBuscando(Boolean(t.trim())); }}
                  placeholder="Seleccioná o escribí un idioma..."
                  style={getInputStyle(libro.idioma)}
                  placeholderTextColor={showErrors && !libro.idioma?.trim() ? "#ff6b6b" : "#999"}
                />
                {showErrors && !libro.idioma?.trim() && <Text style={styles.errorText}>Este campo es obligatorio</Text>}
                {buscando && idiomasFiltrados.length > 0 && (
                  <ScrollView style={styles.dropdownScroll} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                    {idiomasFiltrados.map((item) => (
                      <TouchableOpacity key={item} onPress={() => { setBuscando(false); setQuery(""); updateLibro({ idioma: item }); }} style={styles.dropdownItem}>
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
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Información del libro</Text>
              <Text style={styles.subtitle}>
                Ingresá los datos principales del libro para que otros usuarios puedan identificarlo fácilmente.
              </Text>
              <Text style={styles.label}>Género</Text>
              <TextInput value={libro.genero} onChangeText={(t) => updateLibro({ genero: t })} placeholder="Género" style={getInputStyle(libro.genero)} placeholderTextColor={showErrors && !libro.genero?.trim() ? "#ff6b6b" : "#999"} />
              {showErrors && !libro.genero?.trim() && <Text style={styles.errorText}>Este campo es obligatorio</Text>}

              <Text style={styles.label}>Formato</Text>
              <View style={getPickerStyle(comunes.digital)}>
                <Picker selectedValue={comunes.digital} onValueChange={(v) => updateComunes({ digital: v })}>
                  <Picker.Item label="Seleccionar..." value="" />
                  <Picker.Item label="Digital" value={true} />
                  <Picker.Item label="Físico" value={false} />
                </Picker>
              </View>
              {showErrors && comunes.digital !== true && comunes.digital !== false && <Text style={styles.errorText}>Este campo es obligatorio</Text>}

              <Text style={styles.label}>Nuevo</Text>
              <View style={getPickerStyle(comunes.nuevo)}>
                <Picker selectedValue={comunes.nuevo} onValueChange={(v) => updateComunes({ nuevo: v })}>
                  <Picker.Item label="Seleccionar..." value="" />
                  <Picker.Item label="Sí" value={true} />
                  <Picker.Item label="No" value={false} />
                </Picker>
              </View>
              {showErrors && comunes.nuevo !== true && comunes.nuevo !== false && <Text style={styles.errorText}>Este campo es obligatorio</Text>}
            </View>
          );
        default:
          return null;
      }
    };

    return (
      <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" enableOnAndroid extraScrollHeight={120} enableAutomaticScroll>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear publicación</Text>
          <View style={{ width: 40 }} />
        </View>

        {step >= 3 && <ProgressBar currentStep={getProgressStep()} totalSteps={3} />}

        {renderStep()}

        {step === 3 && <View style={styles.bottomButton}><PrimaryButton styleBtn={{ height: 36 }} title="Siguiente" onPress={handleStep3Next} /></View>}
        {step === 4 && <View style={styles.bottomButton}><PrimaryButton styleBtn={{ height: 36 }} title="Siguiente" onPress={handleStep4Next} /></View>}

        <Modal visible={showScanner} animationType="slide">
          <ISBNScanner onScanned={(data) => updateLibro({ isbn: parseInt(data) })} onClose={() => setShowScanner(false)} />
        </Modal>
      </KeyboardAwareScrollView>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 50 },
    stepContainer: { marginTop: 8 },
    progressWrapper: { marginTop: 16, marginBottom: 24, paddingHorizontal: 8 },
    progressContainer: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center" },
    stepItem: { alignItems: "center", width: 80 },
    progressCircle: { 
      width: 36, 
      height: 36, 
      borderRadius: 18, 
      borderWidth: 2, 
      borderColor: "#E0E0E0", 
      backgroundColor: Colors.background, 
      justifyContent: "center", 
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    progressCircleCompleted: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    progressCircleCurrent: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: Colors.background },
    progressNumber: { fontSize: 14, fontWeight: "600", color: "#999" },
    progressNumberCurrent: { color: Colors.primary },
    stepLabel: { fontSize: 11, color: "#999", marginTop: 6, textAlign: "center" },
    stepLabelActive: { color: Colors.primary, fontWeight: "500" },
    lineWrapper: { flex: 1, justifyContent: "center", paddingTop: 4 },
    progressLine: { height: 2, backgroundColor: "#E0E0E0", marginHorizontal: 4, marginTop: 14 },
    progressLineCompleted: { backgroundColor: Colors.primary },
    inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
    inputIsbn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 16, paddingHorizontal: 20, height: 50, borderColor: "#000" },
    scanIcon: { justifyContent: "center", alignItems: "center", padding: 8, minWidth: 48 },
    buttonContainer: { flexDirection: "row", justifyContent: "center", marginTop: 32, marginHorizontal: 16, gap: 10 },
    bottomButton: { marginTop: 24, marginBottom: 20 },
    header: { flexDirection: "row", alignItems: "center", height: 56, marginBottom: 8 },
    backButton: { width: 40, justifyContent: "center", alignItems: "center" },
    headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700", color: "#000" },
    title: { fontSize: 24, fontWeight: "600", marginBottom: 8, color: "#000" },
    subtitle: { fontSize: 14, fontWeight: "400", marginBottom: 24, color: "#838589", lineHeight: 20 },
    label: { fontSize: 14, fontWeight: "500", color: "#0C1A30", marginBottom: 6, marginTop: 4 },
    styleBtn: { flex: 1, paddingHorizontal: 16, height: 36, justifyContent: "center", alignItems: "center" },
    confirmBtn: { flex: 1, paddingHorizontal: 32, height: 36, justifyContent: "center", alignItems: "center" },
    input: { height: 50, borderWidth: 1, borderRadius: 10, paddingHorizontal: 20, borderColor: "#000", marginBottom: 16 },
    inputError: { borderColor: "#ff4444", borderWidth: 2, backgroundColor: Colors.background },
    errorText: { color: "#ff4444", fontSize: 12, marginTop: -12, marginBottom: 12, marginLeft: 4 },
    pickerWrapper: { borderWidth: 1, borderColor: "#000", marginBottom: 16, borderRadius: 10, height: 50, justifyContent: "center" },
    dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomColor: "#eee", borderBottomWidth: 1 },
    dropdownItemText: { fontSize: 14, color: "#000" },
    bookCard: { borderWidth: 1, borderColor: "#838589", borderRadius: 10, padding: 16, marginBottom: 8 },
    bookTitle: { fontWeight: "bold", fontSize: 16, textAlign: "center", color: Colors.primary, marginBottom: 4 },
    bookMeta: { color: "#838589" },
    bookValue: { color: "#000" },
    dropdownScroll: { position: "absolute", top: 55, left: 0, right: 0, maxHeight: 125, backgroundColor: Colors.background, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, zIndex: 1000, elevation: 5 },
  });
