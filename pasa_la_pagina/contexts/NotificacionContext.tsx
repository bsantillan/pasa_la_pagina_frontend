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

type NotificacionUpdate = {
  tipo: "ELIMINADA" | "ACTUALIZAR_TODO";
  id?: number | null;
};

type NotificationContextType = {
  notificaciones: Notificacion[];
  connect: () => void;
  disconnect: () => void;
  deleteNotification: (id: number) => Promise<void>;
  cargarNotificaciones: () => Promise<void>;
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
          try {
            const raw = msg.body;
            const parsed = JSON.parse(raw);

            if (isNotificacion(parsed)) {
              const noti = parsed as Notificacion;
              setNotificaciones((prev) => [noti, ...prev]);

              Alert.alert(noti.titulo + " " + noti.mensaje);

              try {
                await Notificacions.scheduleNotificationAsync({
                  content: { title: noti.titulo, body: noti.mensaje },
                  trigger: null,
                });
              } catch (e) {
                console.warn("No se pudo programar notificación local:", e);
              }
              return;
            }

            if (isNotificacionUpdate(parsed)) {

              const upd = parsed as NotificacionUpdate;

              if (upd.tipo === "ELIMINADA" && typeof upd.id === "number") {
                console.log("Eliminando notificacione");
                setNotificaciones((prev) => prev.filter((n) => n.id !== upd.id));
                return;
              }

              if (upd.tipo === "ACTUALIZAR_TODO") {
                await cargarNotificaciones();
                return;
              }
            }

            console.warn("Mensaje WS recibido con formato desconocido:", parsed);
          } catch (err) {
            console.error("Error parseando mensaje WS:", err, "body:", msg.body);
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
    } catch (error) {
      console.error("❌ Error eliminando notificación:", error);
    }
  };

  const cargarNotificaciones = async () => {
    try {
      const token = await getValidAccessToken();

      const res = await fetch(`${API_URL}notificaciones/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.error("Error cargando notificaciones");
        return;
      }

      const data: Notificacion[] = await res.json();
      setNotificaciones(data);
    } catch (err) {
      console.error("Error backend notificaciones:", err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      connect();
      cargarNotificaciones();
      return () => disconnect();
    }
  }, [user?.id]);

  const isNotificacion = (obj: any): obj is Notificacion => {
    return obj && typeof obj === "object" && typeof obj.id === "number" && typeof obj.titulo === "string";
  };

  const isNotificacionUpdate = (obj: any): obj is NotificacionUpdate => {
    return obj && typeof obj === "object" && typeof obj.tipo === "string" && (obj.tipo === "ELIMINADA" || obj.tipo === "ACTUALIZAR_TODO");
  };

  return (
    <NotificationContext.Provider value={{
      notificaciones,
      connect,
      disconnect,
      deleteNotification,
      cargarNotificaciones
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
