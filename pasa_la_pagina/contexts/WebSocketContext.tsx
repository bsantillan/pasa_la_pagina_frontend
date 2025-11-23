import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient: Client | null = null;
let currentChatId: number | null = null;

export const connectToChat = (
  chatId: number,
  onMessageReceived: (msg: any) => void
) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

  // Evita reconectar 2 veces al mismo chat
  if (stompClient && currentChatId === chatId && stompClient.connected) {
    console.log("🔄 Ya conectado al chat", chatId);
    return;
  }

  currentChatId = chatId;

  // Si había otro websocket, cerralo ANTES de abrir uno nuevo
  if (stompClient) {
    try {
      stompClient.deactivate();
    } catch { }
  }

  console.log("🔌 Conectando a WebSocket…");

  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${API_URL}ws`),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    debug: () => { }, // limpiar logs de stomp

    onConnect: () => {
      console.log("✅ WebSocket conectado!");

      if (!stompClient) return;

      // Suscripción segura
      stompClient.subscribe(`/topic/chat/${chatId}`, (message) => {
        try {
          const parsed = JSON.parse(message.body);
          onMessageReceived(parsed);
        } catch (e) {
          console.error("❌ Error parseando mensaje:", e);
        }
      });
    },

    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame.headers["message"]);
    },

    onWebSocketError: (e) => {
      console.error("❌ WebSocket error:", e);
    },
  });

  stompClient.activate();
};

export const disconnect = () => {
  if (stompClient) {
    console.log("🔌 Cerrando WebSocket…");
    try {
      stompClient.deactivate();
    } catch { }
  }
  stompClient = null;
  currentChatId = null;
};

export const sendMessage = (
  chatId: number,
  usuario: string,
  contenido: string
) => {
  if (!stompClient || !stompClient.connected) {
    console.warn("⚠️ No conectado todavía, mensaje perdido");
    return;
  }

  stompClient.publish({
    destination: `/app/chat.sendMessage/${chatId}`,
    body: JSON.stringify({
      chatId,
      sender: usuario,
      content: contenido,
    }),
    skipContentLengthHeader: true,
  });
};
