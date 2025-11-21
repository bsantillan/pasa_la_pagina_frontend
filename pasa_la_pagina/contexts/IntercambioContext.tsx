import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

export type EstadoIntercambio = "PENDIENTE" | "CANCELADO" | "CONCRETADO" | "ACEPTADO";

export type Intercambio = {
    id: number;
    solicitanteConcreto: boolean;
    propietarioConcreto: boolean;
    rolUsuario: string;
    estadoIntercambio: EstadoIntercambio;
    fechaInicio: string;
    tituloPublicaicon: string;
    usuario: string;
    usuarioEmail: string;
    chatId?: number;
};

export type BuscarIntercambioRequest = {
    estadosIntercambio?: EstadoIntercambio[];
    fechaInicio?: string;
    tituloPublicacion?: string;
    usuario?: string;
    ordenarPor?: string;
    ordenDescendente?: boolean;
};

type IntercambioContextType = {
    intercambios: Intercambio[] | null;
    intercambioSeleccionado: Intercambio | null;
    loading: boolean;
    solicitarIntercambio: (id: number) => Promise<void>;
    aceptarIntercambio: (id: number) => Promise<void>;
    concretarIntercambio: (id: number) => Promise<void>;
    cancelarIntercambio: (id: number) => Promise<void>;
    rechazarIntercambio: (id: number) => Promise<void>;
    buscarIntercambios: (
        filtros?: BuscarIntercambioRequest,
        page?: number,
        size?: number
    ) => Promise<Intercambio[]>;
    seleccionarIntercambio: (intercambio: Intercambio | null) => void;
};

const IntercambioContext = createContext<IntercambioContextType | undefined>(
    undefined
);

export const IntercambioProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
    const { getValidAccessToken } = useAuth();

    const [intercambios, setIntercambios] = useState<Intercambio[] | null>(null);
    const [intercambioSeleccionado, setIntercambioSeleccionado] = useState<Intercambio | null>(null);
    const [loading, setLoading] = useState(false);

    // --- Fetch con token ---
    const fetchWithToken = async (endpoint: string, method: string = "GET", body?: any) => {
        const token = await getValidAccessToken();
        if (!token) throw new Error("No se pudo obtener token válido");

        const res = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const text = await res.text(); // primero texto
        if (!res.ok) throw new Error(text || `Error ${res.status} en ${endpoint}`);

        try {
            return text ? JSON.parse(text) : null; // parsea JSON si lo hay
        } catch {
            return text; // devuelve texto si no es JSON
        }
    };

    // --- Endpoints ---
    const solicitarIntercambio = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetchWithToken(`intercambio/solicitar/${id}`, "POST");
            // Si la petición llega a 200 OK, significa que salió bien
            return res;
        } catch (err: any) {
            // Aquí capturás errores HTTP, como 409 Conflict
            if (err.message.includes("409")) {
                throw new Error("Ya existe un intercambio para esta publicación");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const aceptarIntercambio = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetchWithToken(`intercambio/aceptar/${id}`, "PATCH");
            return res;
        } catch (err: any) {
            if (err.message.includes("409")) {
                throw new Error("Ya existe un intercambio para esta publicación");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const concretarIntercambio = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetchWithToken(`intercambio/concretar/${id}`, "PATCH");
            return res;
        } catch (err: any) {
            if (err.message.includes("409")) {
                throw new Error("Ya existe un intercambio para esta publicación");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelarIntercambio = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetchWithToken(`intercambio/cancelar/${id}`, "PATCH");
            return res;
        } catch (err: any) {
            if (err.message.includes("409")) {
                throw new Error("Ya existe un intercambio para esta publicación");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const rechazarIntercambio = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetchWithToken(`intercambio/rechazar/${id}`, "PATCH");
            return res;
        } catch (err: any) {
            if (err.message.includes("409")) {
                throw new Error("Ya existe un intercambio para esta publicación");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const buscarIntercambios = async (
        filtros?: BuscarIntercambioRequest,
        page?: number,
        size?: number
    ): Promise<Intercambio[]> => {
        setLoading(true);
        try {
            // Construir URL con page y size solo si existen
            let url = "intercambio/paginado";
            const params: string[] = [];
            if (page !== undefined) params.push(`page=${page}`);
            if (size !== undefined) params.push(`size=${size}`);
            if (params.length > 0) url += `?${params.join("&")}`;

            console.log("📤 Enviando filtros:", JSON.stringify(filtros, null, 2));


            const data = await fetchWithToken(url, "POST", filtros);

            setIntercambios(data?.content ?? data ?? []);
            return data?.content ?? data ?? [];
        } finally {
            setLoading(false);
        }
    };

    const seleccionarIntercambio = (intercambio: Intercambio | null) => {
        setIntercambioSeleccionado(intercambio);
    };

    return (
        <IntercambioContext.Provider
            value={{
                intercambios,
                intercambioSeleccionado,
                loading,
                solicitarIntercambio,
                aceptarIntercambio,
                concretarIntercambio,
                cancelarIntercambio,
                rechazarIntercambio,
                buscarIntercambios,
                seleccionarIntercambio
            }}
        >
            {children}
        </IntercambioContext.Provider>
    );
};

export const useIntercambio = () => {
    const context = useContext(IntercambioContext);
    if (!context)
        throw new Error(
            "useIntercambio debe usarse dentro de un IntercambioProvider"
        );
    return context;
};
