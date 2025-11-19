// src/contexts/NotificationContext.tsx
import { Client } from "@stomp/stompjs";
import * as Notificacions from 'expo-notifications';
import React, { createContext, useContext, useEffect } from "react";
import { Alert } from "react-native";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";

type Notification = {
  titulo: string;
  nombreUsuario: string;
  apellidoUsuario: string;
  mensaje: string;
  fecha: string;
};

type NotificationContextType = {
  connect: () => void;
  disconnect: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let stompClient: Client | null = null;

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

  const connect = () => {
    if (!user?.id) return;

    console.log("🔗 Conectando a notificaciones...");

    stompClient = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Conectado al canal de notificaciones");
        console.log("👤 Suscribiendo a /topic/notificaciones/" + user.id);

        stompClient?.subscribe(`/topic/notificaciones/${user.id}`, async (msg) => {
          const noti: Notification = JSON.parse(msg.body);
          console.log("🔔 Notificación recibida:", noti);

          const mensaje = `${noti.titulo}: ${noti.mensaje}`;
          console.log(mensaje)

          Alert.alert(mensaje);

          try {
            await Notificacions.scheduleNotificationAsync({
              content: {
                title: noti.titulo,
                body: noti.mensaje
              },
              trigger: null
            })
          } catch (e) {
            
          }

        });
      },
      onStompError: (frame) => {
        console.error("⚠️ STOMP Error:", frame.headers["message"]);
      },
      onWebSocketError: (err) => {
        console.error("❌ WebSocket Error:", err);
      },
    });

    stompClient.activate();
  };

  const disconnect = () => {
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
      console.log("🔌 Desconectado de notificaciones");
    }
  };

  useEffect(() => {
    if (user?.id) {
      connect();
      return () => disconnect();
    }
  }, [user?.id]);

  return (
    <NotificationContext.Provider value={{ connect, disconnect }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotifications debe usarse dentro de un NotificationProvider");
  return ctx;
};
