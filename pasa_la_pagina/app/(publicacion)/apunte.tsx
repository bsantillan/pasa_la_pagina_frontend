import PrimaryButton from "@/components/ui/Boton/Primary";
import { Colors } from "@/constants/Colors";
import { useEnums } from "@/contexts/EnumsContext";
import { usePublicacion } from "@/contexts/PublicacionContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const steps = ["Información", "Educación", "Publicación"];
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

export default function ApunteForm() {
  const [step, setStep] = useState(1);
  const [stepHistory, setStepHistory] = useState<number[]>([1]);
  const [showErrors, setShowErrors] = useState(false);
  const [query, setQuery] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [idiomasFiltrados, setIdiomasFiltrados] = useState<string[]>([]);

  const { apunte, comunes, updateApunte, updateComunes } = usePublicacion();
  const { nivelesEducativos, fetchNivelesEducativos, buscarIdiomas } = useEnums();

  // Carga de idiomas y niveles educativos
  useEffect(() => {
    if (!nivelesEducativos) fetchNivelesEducativos();

    const timeout = setTimeout(async () => {
      if (query.trim()) {
        const resultados = await buscarIdiomas(query.trim());
        setIdiomasFiltrados(resultados);
        setBuscando(true);
      } else setBuscando(false);
    }, 200);

    return () => clearTimeout(timeout);
  }, [query, nivelesEducativos]);

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    setStepHistory(prev => [...prev, nextStep]);
    setShowErrors(false);
  };

  const handleBack = () => {
    if (stepHistory.length > 1) {
      const newHistory = [...stepHistory];
      newHistory.pop();
      setStep(newHistory[newHistory.length - 1]);
      setStepHistory(newHistory);
      setShowErrors(false);
    } else {
      router.back();
    }
  };

  const isStep1Valid = () =>
    apunte.titulo?.trim() &&
    Number.isFinite(apunte.paginas) && apunte.paginas! > 0 &&
    apunte.idioma?.trim() &&
    Number.isFinite(apunte.anio_elaboracion) &&
    (comunes.nuevo === true || comunes.nuevo === false) &&
    (comunes.digital === true || comunes.digital === false);

  const isStep2Valid = () =>
    !!apunte.nivel_educativo?.trim() &&
    !!apunte.institucion?.trim() &&
    !!apunte.materia?.trim() &&
    !!apunte.seccion?.trim();

  const handleStep1Next = () => isStep1Valid() ? goToStep(2) : setShowErrors(true);
  const handleStep2Next = () => isStep2Valid() ? router.push("/(publicacion)/publicacion") : setShowErrors(true);

  const getInputStyle = (value: string | number | undefined) => [
    styles.input,
    showErrors && (!value || (typeof value === "string" && !value.trim())) && styles.inputError,
  ];

  const getPickerStyle = (value: string | boolean | undefined) => [
    styles.pickerWrapper,
    showErrors && (value === undefined || value === "" || value === null) && styles.inputError,
  ];

  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear publicación</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      {step >= 1 && <ProgressBar currentStep={step} totalSteps={3} />}

      {/* Step 1 */}
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.label}>Título</Text>
          <TextInput style={getInputStyle(apunte.titulo)} value={apunte.titulo} onChangeText={t => updateApunte({ titulo: t })} />

          <Text style={styles.label}>Páginas</Text>
          <TextInput style={getInputStyle(apunte.paginas)} keyboardType="numeric" value={String(apunte.paginas || "")} onChangeText={t => updateApunte({ paginas: parseInt(t) })} />

          <Text style={styles.label}>Idioma</Text>
          <View style={{ position: "relative", zIndex: 1000 }}>
            <TextInput
              value={query || apunte.idioma || ""}
              onChangeText={(t) => {
                setQuery(t);
                updateApunte({ idioma: "" });
                setBuscando(Boolean(t.trim()));
              }}
              placeholder="Seleccioná o escribí un idioma..."
              style={getInputStyle(apunte.idioma)}
              placeholderTextColor={showErrors && !apunte.idioma?.trim() ? "#ff6b6b" : "#999"}
            />
            {showErrors && !apunte.idioma?.trim() && (
              <Text style={styles.errorText}>Este campo es obligatorio</Text>
            )}
            {buscando && idiomasFiltrados.length > 0 && (
              <ScrollView style={styles.dropdownScroll} keyboardShouldPersistTaps="handled">
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

          <Text style={styles.label}>Año de elaboración</Text>
          <TextInput style={getInputStyle(apunte.anio_elaboracion)} keyboardType="numeric" value={String(apunte.anio_elaboracion || "")} onChangeText={t => updateApunte({ anio_elaboracion: parseInt(t) })} />

          <Text style={styles.label}>Formato</Text>
          <View style={getPickerStyle(comunes.digital)}>
            <Picker selectedValue={comunes.digital} onValueChange={v => updateComunes({ digital: v })}>
              <Picker.Item label="Seleccionar..." value="" />
              <Picker.Item label="Digital" value={true} />
              <Picker.Item label="Físico" value={false} />
            </Picker>
          </View>

          <Text style={styles.label}>Nuevo</Text>
          <View style={getPickerStyle(comunes.nuevo)}>
            <Picker selectedValue={comunes.nuevo} onValueChange={v => updateComunes({ nuevo: v })}>
              <Picker.Item label="Seleccionar..." value="" />
              <Picker.Item label="Sí" value={true} />
              <Picker.Item label="No" value={false} />
            </Picker>
          </View>

          <PrimaryButton title="Siguiente" onPress={handleStep1Next} />
        </View>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.label}>Nivel educativo</Text>
          <View style={getPickerStyle(apunte.nivel_educativo)}>
            <Picker selectedValue={apunte.nivel_educativo} onValueChange={v => updateApunte({ nivel_educativo: v })}>
              <Picker.Item label="Seleccionar..." value="" />
              {nivelesEducativos?.map(n => <Picker.Item key={n} label={n} value={n} />)}
            </Picker>
          </View>

          <Text style={styles.label}>Institución</Text>
          <TextInput style={getInputStyle(apunte.institucion)} value={apunte.institucion} onChangeText={t => updateApunte({ institucion: t })} />

          <Text style={styles.label}>Materia</Text>
          <TextInput style={getInputStyle(apunte.materia)} value={apunte.materia} onChangeText={t => updateApunte({ materia: t })} />

          <Text style={styles.label}>Sección</Text>
          <TextInput style={getInputStyle(apunte.seccion)} value={apunte.seccion} onChangeText={t => updateApunte({ seccion: t })} />

          <PrimaryButton title="Siguiente" onPress={handleStep2Next} />
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, padding: 16, paddingBottom: 50 },
  header: { flexDirection: "row", alignItems: "center", height: 56, marginBottom: 8 },
  backButton: { width: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700", color: "#000" },
  stepContainer: { marginTop: 8 },
  label: { marginTop: 8, marginBottom: 4, fontWeight: "500" },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, borderColor: "#000", marginBottom: 12 },
  inputError: { borderColor: "#ff4444", borderWidth: 2 },
  pickerWrapper: { borderWidth: 1, borderColor: "#000", borderRadius: 8, marginBottom: 12, height: 50, justifyContent: "center" },
  dropdownScroll: { position: "absolute", top: 55, left: 0, right: 0, maxHeight: 125, backgroundColor: Colors.background, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, zIndex: 1000 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  progressWrapper: { marginVertical: 16, paddingHorizontal: 8 },
  progressContainer: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center" },
  stepItem: { alignItems: "center", width: 80 },
  progressCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: "#E0E0E0", justifyContent: "center", alignItems: "center" },
  progressCircleCompleted: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  progressCircleCurrent: { borderColor: Colors.primary, backgroundColor: Colors.background },
  progressNumber: { fontSize: 14, fontWeight: "600", color: "#999" },
  progressNumberCurrent: { color: Colors.primary },
  stepLabel: { fontSize: 11, color: "#999", marginTop: 6, textAlign: "center" },
  stepLabelActive: { color: Colors.primary, fontWeight: "500" },
  lineWrapper: { flex: 1, justifyContent: "center", paddingTop: 4 },
  progressLine: { height: 2, backgroundColor: "#E0E0E0", marginHorizontal: 4, marginTop: 14 },
  progressLineCompleted: { backgroundColor: Colors.primary },
  errorText: { color: "#ff4444", fontSize: 12, marginTop: -12, marginBottom: 12, marginLeft: 4 },
  dropdownItemText: { fontSize: 14, color: "#000" },
});
