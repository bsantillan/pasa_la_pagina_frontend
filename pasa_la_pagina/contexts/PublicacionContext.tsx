import * as Location from "expo-location";
import React, { createContext, useContext, ReactNode, useState } from "react";
import { useAuth } from "./AuthContext";

type PublicacionTipo = "libro" | "apunte" | null;

// ---- Datos de creación ----
type LibroData = {
  titulo?: string;
  autor?: string;
  editorial?: string;
  sinopsis?: string;
  isbn?: number;
  idioma?: string;
  genero?: string;
  digital?: boolean;
};

type ApunteData = {
  titulo?: string;
  digital?: boolean;
  idioma?: string;
  anio_elaboracion?: number;
  materia?: string;
  carrera?: string;
  institucion?: string;
  nivel_educativo?: string;
  seccion?: string;
  paginas?: number;
};

type ComunesData = {
  descripcion?: string;
  nuevo?: boolean;
  latitud?: number;
  longitud?: number;
  fotos_url?: string[];
  precio?: number;
  cantidad?: number;
  tipo_oferta?: string;
  usuario_id?: number;
};

// ---- Publicaciones del backend ----
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
  // Estado de creación
  tipo: PublicacionTipo;
  libro: LibroData;
  apunte: ApunteData;
  comunes: ComunesData;
  setTipo: (t: PublicacionTipo) => void;
  updateLibro: (data: Partial<LibroData>) => void;
  updateApunte: (data: Partial<ApunteData>) => void;
  updateComunes: (data: Partial<ComunesData>) => void;
  reset: () => void;

  // Publicaciones del backend
  publicaciones: Publicacion[];
  loading: boolean;
  error: string | null;
  fetchCercaTuyo: () => Promise<void>;
  buscarPublicaciones: (query: string, page?: number, size?: number) => Promise<void>;
  fetchTodasPublicaciones: (limit?: number) => Promise<void>;
};

export const PublicacionContext = createContext<PublicacionContextType | undefined>(undefined);

export const PublicacionProvider = ({ children }: { children: ReactNode }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
  const { getValidAccessToken } = useAuth();

  // ---- Estado de creación ----
  const [tipo, setTipo] = useState<PublicacionTipo>(null);
  const [libro, setLibro] = useState<LibroData>({});
  const [apunte, setApunte] = useState<ApunteData>({});
  const [comunes, setComunes] = useState<ComunesData>({});

  const updateLibro = (data: Partial<LibroData>) => setLibro(prev => ({ ...prev, ...data }));
  const updateApunte = (data: Partial<ApunteData>) => setApunte(prev => ({ ...prev, ...data }));
  const updateComunes = (data: Partial<ComunesData>) => setComunes(prev => ({ ...prev, ...data }));

  const reset = () => {
    setTipo(null);
    setLibro({});
    setApunte({});
    setComunes({});
  };

  // ---- Estado publicaciones del backend ----
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

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const sortAndLimitByDistance = (pubs: Publicacion[], userLocation: { latitude: number; longitude: number }, limit = 20) => {
    const pubsConDistancia = pubs
      .filter(pub => pub.latitud && pub.longitud)
      .map(pub => ({
        ...pub,
        distancia: getDistanceFromLatLonInKm(
          userLocation.latitude,
          userLocation.longitude,
          pub.latitud!,
          pub.longitud!
        ),
      }));

    pubsConDistancia.sort((a, b) => a.distancia! - b.distancia!);
    return pubsConDistancia.slice(0, limit);
  };

  const fetchPublicacionesGeneric = async (url: string, sortByLocation = false, limit?: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error("No hay token válido");

      const res = await fetch(`${API_URL}${url}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error al obtener publicaciones: ${res.status} - ${text}`);
      }

      let data = await res.json();
      let pubs: Publicacion[] = (data.content ?? []).map((p: any) => ({
        id: p.id,
        titulo: p.titulo,
        descripcion: p.descripcion,
        fotos_url: p.url_fotos,
        precio: p.precio,
        tipo: p.tipo_material === "Apunte" ? "apunte" : p.tipo_material === "Libro" ? "libro" : null,
        usuario_id: p.usuario_id,
        latitud: p.latitud,
        longitud: p.longitud,
      }));

      if (sortByLocation) {
        const userLocation = await getUserLocation();
        if (userLocation) {
          pubs = sortAndLimitByDistance(pubs, userLocation, limit ?? 20);
        }
      }

      setPublicaciones(pubs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCercaTuyo = async () => {
    const userLocation = await getUserLocation();
    if (!userLocation) return;
    const { latitude, longitude } = userLocation;

    await fetchPublicacionesGeneric(
      `publicacion/paginado?usuario_latitud=${latitude}&usuario_longitud=${longitude}`,
      true,
      20
    );
  };

  const fetchTodasPublicaciones = async (limit = 50) => {
    await fetchPublicacionesGeneric(`publicacion/paginado?size=${limit}`);
  };

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
        tipo,
        libro,
        apunte,
        comunes,
        setTipo,
        updateLibro,
        updateApunte,
        updateComunes,
        reset,
        publicaciones,
        loading,
        error,
        fetchCercaTuyo,
        buscarPublicaciones,
        fetchTodasPublicaciones,
      }}
    >
      {children}
    </PublicacionContext.Provider>
  );
};

export const usePublicacion = () => {
  const ctx = useContext(PublicacionContext);
  if (!ctx) throw new Error("usePublicacion debe usarse dentro de PublicacionProvider");
  return ctx;
};
