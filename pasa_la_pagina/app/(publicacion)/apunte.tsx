import { AsyncAutocompleteInput } from "@/components/ui/AsyncAutocompleteInput";
import PrimaryButton from "@/components/ui/Boton/Primary";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import CustomInput from "@/components/ui/CustomInput";
import { Colors } from "@/constants/Colors";
import { useEnums } from "@/contexts/EnumsContext";
import { usePublicacion } from "@/contexts/PublicacionContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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

  const tituloRef = useRef<TextInput>(null);
  const paginasRef = useRef<TextInput>(null);
  const idiomaRef = useRef<TextInput>(null);
  const anioRef = useRef<TextInput>(null);
  const carreraRef = useRef<TextInput>(null);
  const institucionRef = useRef<TextInput>(null);
  const materiaRef = useRef<TextInput>(null);
  const seccionRef = useRef<TextInput>(null);

  const { apunte, comunes, updateApunte, updateComunes } = usePublicacion();
  const { nivelesEducativos, fetchNivelesEducativos, buscarIdiomas } = useEnums();
  const nivelOptions = (nivelesEducativos ?? []).map(n => ({
    label: n,
    value: n,
  }));

  // Carga de idiomas y niveles educativos
  useEffect(() => {
    if (!nivelesEducativos) fetchNivelesEducativos();
  }, [nivelesEducativos]);

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
    !!apunte.seccion?.trim() &&
    (apunte.nivel_educativo !== "Superior" || !!apunte.carrera?.trim());

  const handleStep1Next = () => isStep1Valid() ? goToStep(2) : setShowErrors(true);
  const handleStep2Next = () => isStep2Valid() ? router.push("/(publicacion)/publicacion") : setShowErrors(true);

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={120}
      enableAutomaticScroll
    >
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
          <CustomInput
            placeholder="Título"
            value={apunte.titulo || ""}
            onChangeText={(t) => updateApunte({ titulo: t })}
            showErrors={showErrors}
            inputRef={tituloRef}
            returnKeyType="next"
            onSubmitEditing={() => paginasRef.current?.focus()}
          />

          <Text style={styles.label}>Páginas</Text>
          <CustomInput
            placeholder="Páginas"
            value={String(apunte.paginas || "")}
            keyboardType="numeric"
            onChangeText={(t) => updateApunte({ paginas: parseInt(t) })}
            showErrors={showErrors}
            inputRef={paginasRef}
            returnKeyType="next"
            onSubmitEditing={() => idiomaRef.current?.focus()}
          />

          <Text style={styles.label}>Idioma</Text>
          <AsyncAutocompleteInput
            value={apunte.idioma || ""}
            showErrors={showErrors}
            fetchOptions={buscarIdiomas}
            onSelect={(item) => updateApunte({ idioma: item })}
            inputRef={idiomaRef}
            returnKeyType="next"
            onSubmitEditing={() => anioRef.current?.focus()}
          />

          <Text style={styles.label}>Año de elaboración</Text>
          <CustomInput
            placeholder="Año de elaboración"
            value={String(apunte.anio_elaboracion || "")}
            keyboardType="numeric"
            onChangeText={(t) => updateApunte({ anio_elaboracion: parseInt(t) })}
            showErrors={showErrors}
            inputRef={anioRef}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          <Text style={styles.label}>Formato</Text>
          <CustomDropdown
            value={comunes.digital}
            onValueChange={(v) => updateComunes({ digital: v })}
            options={[
              { label: "Digital", value: true },
              { label: "Físico", value: false },
            ]}
            placeholder="Selecciona un formato"
            showErrors={showErrors}
          />

          <Text style={styles.label}>Estado</Text>
          <CustomDropdown
            value={comunes.nuevo}
            onValueChange={(v) => updateComunes({ nuevo: v })}
            options={[
              { label: "Nuevo", value: true },
              { label: "Usado", value: false },
            ]}
            placeholder="Selecciona un estado"
            showErrors={showErrors}
          />

          <PrimaryButton title="Siguiente" onPress={handleStep1Next} />
        </View>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.label}>Nivel educativo</Text>
          <CustomDropdown
            value={apunte.nivel_educativo}
            onValueChange={(v) => updateApunte({ nivel_educativo: v, carrera: "" })}
            options={nivelOptions}
            placeholder="Selecciona un nivel educativo"
            showErrors={showErrors}
          />

          {apunte.nivel_educativo === "Superior" && (
            <>
              <Text style={styles.label}>Carrera</Text>
              <CustomInput
                placeholder="Carrera"
                value={apunte.carrera || ""}
                onChangeText={(t) => updateApunte({ carrera: t })}
                showErrors={showErrors}
                inputRef={carreraRef}
                returnKeyType="next"
                onSubmitEditing={() => institucionRef.current?.focus()}
              />
            </>
          )}

          <Text style={styles.label}>Institución</Text>
          <CustomInput
            placeholder="Institución"
            value={apunte.institucion || ""}
            onChangeText={(t) => updateApunte({ institucion: t })}
            showErrors={showErrors}
            inputRef={institucionRef}
            returnKeyType="next"
            onSubmitEditing={() => materiaRef.current?.focus()}
          />

          <Text style={styles.label}>Materia</Text>
          <CustomInput
            placeholder="Materia"
            value={apunte.materia || ""}
            onChangeText={(t) => updateApunte({ materia: t })}
            showErrors={showErrors}
            inputRef={materiaRef}
            returnKeyType="next"
            onSubmitEditing={() => seccionRef.current?.focus()}
          />

          <Text style={styles.label}>Sección</Text>
          <CustomInput
            placeholder="Sección"
            value={apunte.seccion || ""}
            onChangeText={(t) => updateApunte({ seccion: t })}
            showErrors={showErrors}
            inputRef={seccionRef}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />

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
