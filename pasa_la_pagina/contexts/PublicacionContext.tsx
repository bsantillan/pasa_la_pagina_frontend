import * as Location from "expo-location";
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
    latitud?: number;
    longitud?: number;
};

type PublicacionContextType = {
    publicaciones: Publicacion[];
    loading: boolean;
    error: string | null;
    fetchCercaTuyo: () => Promise<void>;
    buscarPublicaciones: (query: string, page?: number, size?: number) => Promise<void>;
};

export const PublicacionContext = createContext<PublicacionContextType | undefined>(
    undefined
);

export const PublicacionProvider = ({ children }: { children: ReactNode }) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
    const { getValidAccessToken } = useAuth();

    const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getUserLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return null;
        const location = await Location.getCurrentPositionAsync({});
        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    };

    const getDistanceFromLatLonInKm = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ) => {
        const R = 6371; // radio de la Tierra en km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // --- Filtrar publicaciones por distancia ---
    const filterByDistance = (publicaciones: Publicacion[], userLocation: { latitude: number; longitude: number }, maxKm = 10) => {
        return publicaciones.filter(pub => {
            if (!pub.latitud || !pub.longitud) return false;
            const distance = getDistanceFromLatLonInKm(
                userLocation.latitude,
                userLocation.longitude,
                pub.latitud,
                pub.longitud
            );
            return distance <= maxKm;
        });
    };

    const fetchPublicacionesGeneric = async (url: string, filterByLocation = false) => {
        setLoading(true);
        setError(null);
        try {
            const token = await getValidAccessToken();
            if (!token) throw new Error("No hay token válido");

            let fetchUrl = `${API_URL}${url}`;

        let userLocation: { latitude: number; longitude: number } | null = null;

        if (filterByLocation) {
            userLocation = await getUserLocation();
            if (userLocation) {
                // Agregar latitud y longitud a la URL para el backend
                const params = new URLSearchParams({
                    usuario_latitud: userLocation.latitude.toString(),
                    usuario_longitud: userLocation.longitude.toString(),
                });
                fetchUrl += `?${params.toString()}`;
            }
        }

        const res = await fetch(fetchUrl, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Error al obtener publicaciones: ${res.status} - ${text}`);
        }

        let data = await res.json();
        let pubs: Publicacion[] = data.content ?? [];

        // Filtrar por distancia en frontend solo si quieres un filtro extra local
        if (filterByLocation && userLocation) {
            pubs = filterByDistance(pubs, userLocation, 10);
        }

        setPublicaciones(pubs);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

    const fetchCercaTuyo = () => fetchPublicacionesGeneric("publicacion/paginado", true);

    const buscarPublicaciones = async (query: string, page = 0, size = 10) => {
        setLoading(true);
        setError(null);
        try {
            const token = await getValidAccessToken();
            if (!token) throw new Error("No hay token válido");

            const body = { query };
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

            let data = await res.json();
            let pubs: Publicacion[] = data.content ?? [];

            // filtrar por distancia
            const userLocation = await getUserLocation();
            if (userLocation) {
                pubs = filterByDistance(pubs, userLocation, 10);
            }

            setPublicaciones(pubs);
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
                fetchCercaTuyo,
                buscarPublicaciones,
            }}
        >
            {children}
        </PublicacionContext.Provider>
    );
};