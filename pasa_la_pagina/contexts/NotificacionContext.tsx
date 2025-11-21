// src/contexts/NotificationContext.tsx
import { Client } from "@stomp/stompjs";
import * as Notificacions from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";

export type TipoNotificacion =
  | "NUEVO_MENSAJE"
  | "SOLICITUD_INTERCAMBIO"
  | "INTERCAMBIO_ACEPTADO"
  | "INTERCAMBIO_RECHAZADO"
  | "INTERCAMBIO_CANCELADO"
  | "INTERCAMBIO_CONCRETADO";

export type Notificacion = {
  id: number,
  titulo: string;
  mensaje: string;
  usuario: string;
  fecha: string;
  intercambio_id: number;
  mensaje_id: number;
  chat_id: number
  tipo_notificacion: TipoNotificacion
};

type NotificationContextType = {
  notificaciones: Notificacion[];
  connect: () => void;
  disconnect: () => void;
  deleteNotification: (id: number) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let stompClient: Client | null = null;

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, getValidAccessToken } = useAuth();
  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

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
          const noti: Notificacion = JSON.parse(msg.body);
          setNotificaciones(prev => [noti, ...prev]);

          Alert.alert(noti.titulo + " " +noti.mensaje);

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

  const deleteNotification = async (idNotificacion: number) => {
    try {
      const token = await getValidAccessToken();

      const response = await fetch(`${API_URL}notificaciones/eliminar`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: idNotificacion,
        }),
      });

      if (!response.ok) {
        throw new Error("Error eliminando notificación");
      }

      // 🧹 borrar del estado local
      setNotificaciones((prev) =>
        prev.filter((n) => n.id !== idNotificacion)
      );

    } catch (error) {
      console.error("❌ Error eliminando notificación:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      connect();
      return () => disconnect();
    }
  }, [user?.id]);

  return (
    <NotificationContext.Provider value={{
      notificaciones,
      connect,
      disconnect,
      deleteNotification
    }}>
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
