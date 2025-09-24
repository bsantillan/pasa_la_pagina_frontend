import React, { createContext, ReactNode, useState } from "react";
import { useAuth } from "./AuthContext";

type PublicacionTipo = "libro" | "apunte" | null;

export type Publicacion = {
    id: number;
    titulo: string;
    descripcion: string;
    fotos_url: string[];
    precio: number | null;
    tipo: PublicacionTipo;
    usuario_id: number;
};

type PublicacionContextType = {
    publicaciones: Publicacion[];
    loading: boolean;
    error: string | null;
    fetchPublicaciones: (latitud?: number, longitud?: number) => Promise<void>;
    buscarPublicaciones: (query: string, page?: number, size?: number) => Promise<void>;
};

export const PublicacionContext = createContext<PublicacionContextType | undefined>(
    undefined
);

export const PublicacionProvider = ({ children }: { children: ReactNode }) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080/";
    const { getValidAccessToken } = useAuth();

    const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPublicaciones = async (latitud = 0, longitud = 0) => {
        setLoading(true);
        setError(null);
        try {
            const token = await getValidAccessToken();
            if (!token) throw new Error("No hay token válido");

            const res = await fetch(`${API_URL}publicacion/paginado?usuario_latitud=${latitud}&usuario_longitud=${longitud}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error al obtener publicaciones: ${res.status} - ${text}`);
            }

            const data = await res.json();
            setPublicaciones(data.content ?? []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const buscarPublicaciones = async (query: string, page = 0, size = 10) => {
        setLoading(true);
        setError(null);
        try {
            const token = await getValidAccessToken();
            if (!token) throw new Error("No hay token válido");

            const body = { query }; // aquí podrías agregar más filtros si quieres
            const res = await fetch(`${API_URL}publicacion/buscar?page=${page}&size=${size}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error al buscar publicaciones: ${res.status} - ${text}`);
            }

            const data = await res.json();
            setPublicaciones(data.content ?? []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicacionContext.Provider
            value={{
                publicaciones,
                loading,
                error,
                fetchPublicaciones,
                buscarPublicaciones,
            }}
        >
            {children}
        </PublicacionContext.Provider>
    );
};
