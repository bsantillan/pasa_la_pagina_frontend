import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { connectToChat, disconnect, sendMessage as wsSendMessage } from "./WebSocketContext";

export type Mensaje = {
    id?: number;
    usuarioEmail: string;
    contenido: string;
    fechaInicio: string;
};

export type ChatInfo = {
    id: number;
    titulo_publicacion: string;
    intercambio_id: number;
    usuario: string;
    usuario_email: string;
};

type ChatContextType = {
    messages: Mensaje[];
    chatInfo: ChatInfo | null;

    loadChatInfo: (chatId: number) => Promise<void>;
    loadMessages: (chatId: number) => Promise<void>;
    initWebSocket: (chatId: number) => () => void;
    sendMessage: (chatId: number, userName: string, content: string) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { getValidAccessToken } = useAuth();
    const [messages, setMessages] = useState<Mensaje[]>([]);
    const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
    const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

    const loadChatInfo = async (chatId: number) => {
        try {
            const token = await getValidAccessToken();
            if (!token) throw new Error("Token no válido");

            const res = await fetch(`${API_URL}api/chats/${chatId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

            const data: ChatInfo = await res.json();
            setChatInfo(data);

        } catch (err) {
            console.error("Error cargando información del chat:", err);
        }
    };

    const loadMessages = async (chatId: number) => {
        try {
            const token = await getValidAccessToken();
            if (!token) throw new Error("Token no válido");
            const res = await fetch(`${API_URL}api/chats/chat/${chatId}/mensajes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
            const data: Mensaje[] = await res.json();
            setMessages(data);
        } catch (err) {
            console.error("Error cargando historial:", err);
        }
    };

    const initWebSocket = (chatId: number) => {
        connectToChat(chatId, (msg: Mensaje) => {
            setMessages(prev => [...prev, msg]);
        });
        return () => disconnect();
    };

    const sendMessage = (chatId: number, userName: string, content: string) => {
        if (!content.trim()) return;
        wsSendMessage(chatId, userName, content);
    };

    return (
        <ChatContext.Provider value={{ messages, chatInfo, loadChatInfo, loadMessages, initWebSocket, sendMessage }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat debe usarse dentro de ChatProvider");
    return context;
};
