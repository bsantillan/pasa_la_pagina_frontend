// src/contexts/NotificationContext.tsx
import { Client } from "@stomp/stompjs";
import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
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
  handleNotificationNavigation: (noti: Notificacion) => Promise<void>;
}; Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let stompClient: Client | null = null;

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, getValidAccessToken } = useAuth();
  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const router = useRouter();

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

              Toast.show({
                type: noti.tipo_notificacion,
                text1: noti.titulo,
                text2: noti.mensaje,
                position: "top",
                props: { notificacion: noti }
              });

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

  const handleNotificationNavigation = async (noti: Notificacion) => {
    deleteNotification(noti.id);

    switch (noti.tipo_notificacion) {
      case "INTERCAMBIO_ACEPTADO":
      case "SOLICITUD_INTERCAMBIO":
        router.push("/(intercambios)");
        break;

      case "NUEVO_MENSAJE":
        if (noti.chat_id) {
          router.push({
            pathname: "/(intercambios)/chat",
            params: { chatId: noti.chat_id },
          });
        }
        break;

      case "INTERCAMBIO_RECHAZADO":
      case "INTERCAMBIO_CANCELADO":
      case "INTERCAMBIO_CONCRETADO":
        router.push("/(perfil)");
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (user?.id) {
      const pedirPermisos = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          console.log("Permiso de notificaciones no concedido");
        }
      };

      pedirPermisos();
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
      cargarNotificaciones,
      handleNotificationNavigation
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
