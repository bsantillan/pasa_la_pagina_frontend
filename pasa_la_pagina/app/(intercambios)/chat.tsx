import { AlertCard } from "@/components/ui/AlertaCard";
import { MessageCard } from "@/components/ui/MensajeCard";
import { Colors } from "@/constants/Colors";
import { useChat } from "@/contexts/ChatContext"; // ✅ Importar tu contexto
import { useIntercambio } from "@/contexts/IntercambioContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View
} from "react-native";

export default function Chat() {
  const [visible, setVisible] = useState(false);
  const { chatId, usuarioEmail, tituloPublicacion } = useLocalSearchParams<{ chatId: string; usuarioEmail: string, tituloPublicacion: string }>();
  const { messages, loadMessages, initWebSocket, sendMessage } = useChat(); // ✅ usar el contexto
  const { intercambioSeleccionado, cancelarIntercambio, concretarIntercambio } = useIntercambio();
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList<any>>(null);

  const abrirModal = () => {
    setVisible(true);
  };

  const cerrarModal = () => {
    setVisible(false);
  };

  // Cargar historial y conectar WebSocket
  useEffect(() => {

    loadMessages(Number(chatId)); // cargar historial
    const disconnectWS = initWebSocket(Number(intercambioSeleccionado?.chatId)); // conectar socket

    return () => disconnectWS(); // limpiar conexión al salir
  }, []);

  const handleSend = () => {
    if (!text.trim()) return;

    sendMessage(Number(chatId), intercambioSeleccionado!.usuarioEmail, text);

    setText("");
  };

  const handleCancel = (intercambioId: number) => {
    setVisible(false);
  }

  const handleConcretar = (intercambioId: number) => {
    setVisible(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Pressable style={{ marginTop: 20 }} onPress={() => abrirModal()}>
        <Ionicons name="lock-closed-outline" size={25} color={Colors.primary} />
      </Pressable>
      <FlatList
        ref={flatListRef}
        style={{ flex: 1, backgroundColor: "#FFF8ED", paddingTop: 80 }}
        data={messages}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <MessageCard
            text={item.contenido}
            time={new Date(item.fechaInicio).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            isOwnMessage={item.usuarioEmail === intercambioSeleccionado?.usuarioEmail}
          />
        )}
      />

      <View style={styles.container2}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#8E8E93"
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
        </View>
      </View>
      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={cerrarModal}
      >
        <View style={styles.overlay}>
          <AlertCard
            title={`¿Intercambiar "${intercambioSeleccionado?.tituloPublicaicon}"?`}
            description="¿Estás seguro de que deseas solicitar este intercambio?"
            onAccept={() => handleConcretar(intercambioSeleccionado!.id)}
            onCancel={() => handleCancel(intercambioSeleccionado!.id)}
            acceptLabel="Sí, intercambiar"
            cancelLabel="Cancelar"
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "#8E8E93",
    borderRadius: 16,
    opacity: 0.9,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  inlineIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
