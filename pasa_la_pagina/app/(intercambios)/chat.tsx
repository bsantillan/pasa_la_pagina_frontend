import { AlertCard } from "@/components/ui/AlertaCard";
import { Avatar } from "@/components/ui/Avatar";
import { MessageCard } from "@/components/ui/MensajeCard";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useIntercambio } from "@/contexts/IntercambioContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Chat() {
  const [visible, setVisible] = useState(false);
  const { chatId } = useLocalSearchParams<{ chatId: string }>();

  const {
    messages,
    chatInfo,
    loadChatInfo,
    loadMessages,
    initWebSocket,
    sendMessage,
  } = useChat();

  const { user } = useAuth();
  const { cancelarIntercambio, concretarIntercambio } = useIntercambio();
  const [text, setText] = useState("");

  const flatListRef = useRef<FlatList<any>>(null);

  // Auto scroll abajo cuando llegan mensajes
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Cargar historial + datos del chat + conexion WS
  useEffect(() => {
    const id = Number(chatId);
    loadChatInfo(id);
    loadMessages(id);

    const disconnect = initWebSocket(id);
    return disconnect;
  }, [chatId]);

  // Loader si chatInfo es null
  if (!chatInfo) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ fontSize: 16, color: Colors.text }}>Cargando chat...</Text>
      </View>
    );
  }

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(Number(chatId), user!.email, text);
    setText("");
  };

  const handleCancel = async (intercambioId: number) => {
    try {
      await cancelarIntercambio(intercambioId);
      setVisible(false);
    } catch (err: any) {
      alert(err.message ?? "Error al cancelar el intercambio");
    }
  };

  const handleConcretar = async (intercambioId: number) => {
    try {
      await concretarIntercambio(intercambioId);
      setVisible(false);
    } catch (err: any) {
      alert(err.message ?? "Error al concretar el intercambio");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Avatar name={chatInfo.usuario} size={40} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {chatInfo.usuario}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {chatInfo.titulo_publicacion}
            </Text>
          </View>
        </View>

        <Pressable onPress={() => setVisible(true)} style={styles.headerButton}>
          <Ionicons name="checkmark-done-outline" size={24} color={Colors.primary} />
        </Pressable>
      </View>

      {/* MENSAJES + INPUT */}
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          style={{ flex: 1, backgroundColor: "#FFF8ED" }}
          data={messages}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item }) => (
            <MessageCard
              text={item.contenido}
              time={new Date(item.fechaInicio).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              isOwnMessage={item.usuarioEmail === user?.email}
            />
          )}
          contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
        />

        {/* INPUT */}
        <View style={styles.inputBar}>
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
            <Pressable onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={20} color={Colors.primary} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* MODAL */}
      <Modal animationType="fade" transparent visible={visible}>
        <View style={styles.overlay}>
          <AlertCard
            title={`Concretar intercambio de "${chatInfo.titulo_publicacion}"?`}
            description="¿Estás seguro de que deseas concretar este intercambio?"
            onAccept={() => handleConcretar(chatInfo.intercambio_id)}
            onCancel={() => handleCancel(chatInfo.intercambio_id)}
            acceptLabel="Sí, concretar"
            cancelLabel="Cancelar"
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* =================== ESTILOS =================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerInfo: {
    flexShrink: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6e6e6e",
    marginTop: 2,
  },

  /* INPUT BAR */
  inputBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "#8E8E93",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#000",
    minHeight: 40,
  },
  sendButton: {
    padding: 8,
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  /* MODAL */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
