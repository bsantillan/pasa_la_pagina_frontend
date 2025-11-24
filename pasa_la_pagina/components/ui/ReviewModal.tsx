// components/ui/ReseñaModal.tsx
import { Colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onEnviarReseña: (rating: number, feedback: string) => Promise<void>;
  onReseñaEnviada?: () => void; // Callback opcional cuando se envía la reseña
}

export default function ReviewModal({
  visible,
  onClose,
  onEnviarReseña,
  onReseñaEnviada,
}: ReviewModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnviarReseña = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Debes calificar la experiencia");
      return;
    }

    setLoading(true);
    try {
      await onEnviarReseña(rating, feedback);
      setTimeout(() => {
        setStep(4);
      }, 1000);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setStep(1);
    setRating(0);
    setFeedback("");
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={handleCerrar}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Paso 1: Confirmación */}
          {step === 1 && (
            <>
              <Text style={styles.modalTitle}>¿Quieres calificar tu intercambio?</Text>
              <Text style={styles.modalText}>
                Tu opinión ayuda a otros usuarios y mejora la comunidad.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleCerrar}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => setStep(2)}
                >
                  <Text style={styles.buttonText}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Paso 2: Calificar con estrellas */}
          {step === 2 && (
            <>
              <Text style={styles.modalTitle}>¿Cómo fue tu experiencia?</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={32}
                      color={star <= rating ? Colors.secondary : Colors.primary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.buttonText}>Atrás</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    rating === 0 && styles.disabledButton
                  ]}
                  onPress={() => setStep(3)}
                  disabled={rating === 0}
                >
                  <Text style={styles.buttonText}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Paso 3: Comentarios */}
          {step === 3 && (
            <>
              <Text style={styles.modalTitle}>Cuéntanos más</Text>
              <Text style={styles.modalText}>
                ¿Qué salió bien en el intercambio? ¿Hay algo que deberíamos mejorar?
              </Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Ej: El usuario fue puntual y amable. Podría mejorar la comunicación."
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={4}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => setStep(2)}
                >
                  <Text style={styles.buttonText}>Atrás</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleEnviarReseña}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Enviar reseña</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Paso 4: Gracias */}
          {step === 4 && (
            <>
              <Text style={styles.modalTitle}>¡Gracias por tu reseña!</Text>
              <Text style={styles.modalText}>
                Tu opinión ayuda a otros usuarios y mejora la comunidad.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleCerrar}
                >
                  <Text style={styles.buttonText}>Cerrar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => {
                    handleCerrar();
                    onReseñaEnviada?.();
                  }}
                >
                  <Text style={styles.buttonText}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.disabled_primary,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});