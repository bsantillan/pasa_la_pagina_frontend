import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient: Client | null = null;

export const connectToChat = (chatId: number, onMessageReceived: (msg: any) => void) => {
  console.log("Opening Web Socket...");
  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${API_URL}ws`),
    reconnectDelay: 5000,
    debug: (str) => console.log(str),
    onConnect: () => {
      console.log("✅ Connected to WebSocket");
      stompClient?.subscribe(`/topic/chat/${chatId}`, (message) => {
        const body = JSON.parse(message.body);
        onMessageReceived(body);
      });
    },
    onStompError: (frame) => {
      console.error("STOMP Error:", frame.headers["message"]);
    },
  });

  stompClient.activate();
};
  
export const disconnect = () => {
  stompClient?.deactivate();
};

export const sendMessage = (chatId: number, usuario: string, contenido: string) => {  
  if (!stompClient || !stompClient.connected) return;

  // Enviar mensaje al endpoint del backend
  stompClient.publish({
    destination: `/app/chat.sendMessage/${chatId}`, // debe coincidir con @MessageMapping en el backend
    body: JSON.stringify({
      chatId,
      sender: usuario,
      content: contenido
    }),
  });
};

