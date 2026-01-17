import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

type PublicacionTipo = "libro" | "apunte" | null;

// ---- Datos de creación ----
type ComunesData = {
  descripcion?: string;
  nuevo?: boolean;
  digital?: boolean;
  url?: string;
  latitud?: number;
  longitud?: number;
  fotos_url?: string[];
  precio?: number;
  cantidad?: number;
  tipo_oferta?: string;
  usuario_id?: number;
};

export type LibroData = {
  titulo?: string;
  idioma?: string;
  autor?: string;
  editorial?: string;
  genero?: string;
  isbn?: number;
};

type ApunteData = {
  titulo?: string;
  idioma?: string;
  anio_elaboracion?: number;
  materia?: string;
  carrera?: string;
  institucion?: string;
  nivel_educativo?: string;
  seccion?: string;
  paginas?: number;
};

// ---- Publicaciones del backend ----
export type Publicacion = {
  id: number;
  favorito: boolean;
  titulo: string;
  descripcion: string;
  fotos_url: string[];
  precio: number | null;
  tipo: PublicacionTipo;
  usuario_id: number;
  latitud?: number;
  longitud?: number;
  distancia?: number;

  tipo_oferta: string;
  cantidad: number | null;
  digital: boolean;
  nuevo: boolean;
  disponible: boolean;
  url?: string | null;

  // Campos de libro
  autor?: string | null;
  editorial?: string | null;
  genero?: string | null;
  isbn?: string | null;
  cantidad_paginas?: number | null;
  idioma?: string | null;

  // Campos de apunte
  anio_elaboracion?: number | null;
  materia?: string | null;
  carrera?: string | null;
  institucion?: string | null;
  nivel_educativo?: string | null;
  seccion?: string | null;

  usuario_nombre: string;
  usuario_apellido: string;
};

export type Filtros = {
  query?: string;
  nuevo?: boolean;
  digital?: boolean;
  idiomas?: string[];
  tipos_oferta?: string[];
  precio_minimo?: number;
  precio_maximo?: number;
  tipos_material?: ("Libro" | "Apunte")[];
  niveles_educativos?: string[];
  distancia_maxima?: number;
};

const FILTROS_DEFAULT: Filtros = {};

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

  // Filtros
  filtrosListado: Filtros;
  setFiltrosListado: React.Dispatch<React.SetStateAction<Filtros>>;
  filtrosMapa: Filtros;
  setFiltrosMapa: React.Dispatch<React.SetStateAction<Filtros>>;
  aplicarFiltros: (origen: "listado" | "mapa", page?: number) => Promise<void>;
  cargarinicial: (origen: "listado" | "mapa") => Promise<void>;
  limpiarFiltros: (origen: "listado" | "mapa") => Promise<void>;
  buscarPorTexto: (
    origen: "listado" | "mapa",
    query: string
  ) => Promise<void>;


  // Publicaciones del backend
  publicaciones: Publicacion[];
  pubsUser: Publicacion[];
  pubFavoritas: Publicacion[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  resetPagination: () => void;
  loadMore: () => Promise<void>;
  fetchCercaTuyo: () => Promise<void>;
  buscarPublicaciones: (
    query: string,
    page?: number,
    size?: number
  ) => Promise<void>;
  resultadosBusqueda: Publicacion[];
  fetchPublicacionesGeneric: (
    url: string,
    sortByLocation?: boolean,
    limit?: number
  ) => Promise<void>;
  getUserLocation: () => Promise<{
    latitude: number;
    longitude: number;
  } | null>;
  fetchPublicacionesByUsuario: (
    usuario_id: number,
    page?: number,
    size?: number
  ) => Promise<void>;
  agregarFavorito: (id: number) => Promise<void>;
  eliminarFavorito: (id: number) => Promise<void>;
  recuperarFavoritos: (page?: number, size?: number) => Promise<void>;
};

export const PublicacionContext = createContext<
  PublicacionContextType | undefined
>(undefined);

export const PublicacionProvider = ({ children }: { children: ReactNode }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
  const { getValidAccessToken } = useAuth();
  const router = useRouter();

  // ---- Estado de creación ----
  const [tipo, setTipo] = useState<PublicacionTipo>(null);
  const [libro, setLibro] = useState<LibroData>({});
  const [apunte, setApunte] = useState<ApunteData>({});
  const [comunes, setComunes] = useState<ComunesData>({});

  const updateLibro = (data: Partial<LibroData>) =>
    setLibro((prev) => ({ ...prev, ...data }));
  const updateApunte = (data: Partial<ApunteData>) =>
    setApunte((prev) => ({ ...prev, ...data }));
  const updateComunes = (data: Partial<ComunesData>) =>
    setComunes((prev) => ({ ...prev, ...data }));

  const reset = () => {
    setTipo(null);
    setLibro({});
    setApunte({});
    setComunes({});
  };

  // ---- Estado de filtros ----
  const [filtrosListado, setFiltrosListado] = useState<Filtros>({});
  const [filtrosMapa, setFiltrosMapa] = useState<Filtros>({});
  const filtrosListadoRef = useRef(filtrosListado);
  const filtrosMapaRef = useRef(filtrosMapa);

  const getFiltrosRef = (origen: "listado" | "mapa") =>
    origen === "mapa" ? filtrosMapaRef : filtrosListadoRef;

  useEffect(() => {
    filtrosListadoRef.current = filtrosListado;
  }, [filtrosListado]);

  useEffect(() => {
    filtrosMapaRef.current = filtrosMapa;
  }, [filtrosMapa]);

  // ---- Estado publicaciones del backend ----
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Publicacion[]>(
    []
  );
  const [pubsUser, setPubsUser] = useState<Publicacion[]>([]);
  const [pubFavoritas, setPubFavoritas] = useState<Publicacion[]>([]);

  // 👇 Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getUserLocation = useCallback(async () => {
    if (userLocation) return userLocation;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permiso de ubicación denegado");
        return null;
      }
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        const coords = {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
        };
        return coords;
      }

      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Timeout al obtener ubicación")),
            10000
          )
        ),
      ]);

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(coords);
      return coords;
    } catch (error) {
      console.error("Error al obtener ubicación:", error);
      return null;
    }
  }, []);

  const fetchPublicacionesConFiltros = useCallback(
    async (origen: "listado" | "mapa", page: number = 0) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const filtrosActuales = getFiltrosRef(origen).current;

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const token = await getValidAccessToken();
        if (!token) throw new Error("No hay token válido");

        // Usar filtrosRef.current para evitar dependencias cíclicas
        const body: any = {
          query: filtrosActuales.query || undefined,
          nuevo: filtrosActuales.nuevo,
          digital: filtrosActuales.digital,
          idiomas: filtrosActuales.idiomas?.length
            ? filtrosActuales.idiomas
            : undefined,
          tipos_oferta: filtrosActuales.tipos_oferta?.length
            ? filtrosActuales.tipos_oferta
            : undefined,
          precio_minimo: filtrosActuales.precio_minimo,
          precio_maximo: filtrosActuales.precio_maximo,
          tipos_material: filtrosActuales.tipos_material?.length
            ? filtrosActuales.tipos_material
            : undefined,
          niveles_educativos: filtrosActuales.niveles_educativos?.length
            ? filtrosActuales.niveles_educativos
            : undefined,
        };

        // Si hay filtro de distancia, obtener ubicación
        if (filtrosActuales.distancia_maxima !== undefined) {
          const loc = await getUserLocation();
          if (loc) {
            body.usuario_latitud = loc.latitude;
            body.usuario_longitud = loc.longitude;
            body.distancia_maxima = filtrosActuales.distancia_maxima;
          }
        }

        const res = await fetch(
          `${API_URL}publicacion/buscar?page=${page}&size=20`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error: ${res.status} - ${text}`);
        }

        const data = await res.json();
        const newPublicaciones = (data.content ?? []).map((p: any) => ({
          id: p.id,
          titulo: p.titulo,
          descripcion: p.descripcion,
          fotos_url: p.url_fotos,
          precio: p.precio,
          tipo: p.tipo_material === "Apunte" ? "apunte" : "libro",
          usuario_id: p.usuario_id,
          latitud: p.latitud,
          longitud: p.longitud,
        }));

        if (page === 0) {
          setPublicaciones(newPublicaciones);
        } else {
          setPublicaciones((prev) => [...prev, ...newPublicaciones]);
        }

        setCurrentPage(page);
        setTotalPages(data.totalPages || 0);
        setHasMore(page < data.totalPages - 1);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, getValidAccessToken, getUserLocation]
  );

  const aplicarFiltros = useCallback(async (origen: "listado" | "mapa", page = 0) => {
    await fetchPublicacionesConFiltros(origen, page);
  },
    [fetchPublicacionesConFiltros]
  );


  const cargarinicial = useCallback(async (origen: "listado" | "mapa") => {
    await fetchPublicacionesConFiltros(origen, 0);
  },
    [fetchPublicacionesConFiltros]
  );

  const limpiarFiltros = useCallback(async (origen: "listado" | "mapa") => {
    const filtrosVacios = FILTROS_DEFAULT;

    if (origen === "listado") {
      setFiltrosListado(filtrosVacios);
      filtrosListadoRef.current = filtrosVacios;
    } else {
      setFiltrosMapa(filtrosVacios);
      filtrosMapaRef.current = filtrosVacios;
    }

    await fetchPublicacionesConFiltros(origen, 0);
  },
    [fetchPublicacionesConFiltros]
  );

  const buscarPorTexto = useCallback(
    async (origen: "listado" | "mapa", query: string) => {
      const trimmedQuery = query.trim();

      if (origen === "listado") {
        const nuevosFiltros = {
          ...filtrosListadoRef.current,
          query: trimmedQuery,
        };
        setFiltrosListado(nuevosFiltros);
        filtrosListadoRef.current = nuevosFiltros;
      } else {
        const nuevosFiltros = {
          ...filtrosMapaRef.current,
          query: trimmedQuery,
        };
        setFiltrosMapa(nuevosFiltros);
        filtrosMapaRef.current = nuevosFiltros;
      }

      await fetchPublicacionesConFiltros(origen, 0);
    },
    [fetchPublicacionesConFiltros]
  );

  const resetPagination = useCallback(() => {
    setCurrentPage(0);
    setHasMore(true);
  }, []);

  const loadMore = useCallback(
    async () => {
      if (hasMore && !loading) {
        await fetchPublicacionesConFiltros("listado", currentPage + 1);
      }
    },
    [hasMore, loading, currentPage, fetchPublicacionesConFiltros]
  );

  const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
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

  const sortAndLimitByDistance = (
    pubs: Publicacion[],
    userLocation: { latitude: number; longitude: number },
    limit = 20
  ) => {
    const pubsConDistancia = pubs
      .filter((pub) => pub.latitud && pub.longitud)
      .map((pub) => ({
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

  const fetchPublicacionesGeneric = useCallback(
    async (url: string, sortByLocation = false, limit?: number) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getValidAccessToken();
        if (!token) throw new Error("No hay token válido");

        const res = await fetch(`${API_URL}${url}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Error al obtener publicaciones: ${res.status} - ${text}`
          );
        }

        const data = await res.json();
        let pubs: Publicacion[] = (data.content ?? []).map((p: any) => ({
          id: p.id,
          titulo: p.titulo,
          descripcion: p.descripcion,
          fotos_url: p.url_fotos,
          precio: p.precio,
          tipo:
            p.tipo_material === "Apunte"
              ? "apunte"
              : p.tipo_material === "Libro"
                ? "libro"
                : null,
          usuario_id: p.usuario_id,
          latitud: p.latitud,
          longitud: p.longitud,
          distancia: p.distancia,
          tipo_oferta: p.tipo_oferta,
          cantidad: p.cantidad,
          digital: p.digital,
          nuevo: p.nuevo,
          disponible: p.disponible,
          url: p.url,
          autor: p.autor,
          editorial: p.editorial,
          genero: p.genero,
          isbn: p.isbn,
          cantidad_paginas: p.cantidad_paginas,
          idioma: p.idioma,
          anio_elaboracion: p.anio_elaboracion,
          materia: p.materia,
          carrera: p.carrera,
          institucion: p.institucion,
          nivel_educativo: p.nivel_educativo,
          seccion: p.seccion,
          usuario_nombre: p.usuario_nombre,
          usuario_apellido: p.usuario_apellido
        }));

        if (sortByLocation) {
          const loc = await getUserLocation();
          if (loc) pubs = sortAndLimitByDistance(pubs, loc, limit ?? 20);
        }

        setPublicaciones(pubs);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, getValidAccessToken, getUserLocation]
  );

  const fetchCercaTuyo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const loc = await getUserLocation();
      if (!loc) {
        // Si no hay ubicación, cargar publicaciones sin ordenar por distancia
        //await fetchPublicacionesGeneric(`publicacion/paginado?size=50`, false);
        return;
      }

      const { latitude, longitude } = loc;
      await fetchPublicacionesGeneric(
        `publicacion/paginado?usuario_latitud=${latitude}&usuario_longitud=${longitude}&size=50`,
        true
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchPublicacionesGeneric, getUserLocation]);

  const fetchPublicacionesByUsuario = useCallback(
    async (usuario_id: number, page = 0, size = 10) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getValidAccessToken();
        if (!token) throw new Error("No hay token válido");

        const res = await fetch(
          `${API_URL}publicacion/usuario/${usuario_id}?page=${page}&size=${size}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Error al obtener publicaciones: ${res.status} - ${text}`
          );
        }

        const data = await res.json();
        let pubs: Publicacion[] = (data.content ?? []).map((p: any) => ({
          id: p.id,
          titulo: p.titulo,
          descripcion: p.descripcion,
          fotos_url: p.url_fotos,
          precio: p.precio,
          tipo:
            p.tipo_material === "Apunte"
              ? "apunte"
              : p.tipo_material === "Libro"
                ? "libro"
                : null,
          usuario_id: p.usuario_id,
          latitud: p.latitud,
          longitud: p.longitud,
        }));

        setPubsUser(pubs);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, getValidAccessToken]
  );

  const buscarPublicaciones = useCallback(
    async (query: string, page = 0, size = 10) => {
      setLoading(true);
      setError(null);
      try {
        const token = await getValidAccessToken();
        if (!token) throw new Error("No hay token válido");

        const res = await fetch(
          `${API_URL}publicacion/buscar?page=${page}&size=${size}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Error al buscar publicaciones: ${res.status} - ${text}`
          );
        }

        const data = await res.json();
        setResultadosBusqueda(data.content ?? []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, getValidAccessToken]
  );

  const agregarFavorito = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error("No hay token válido");

      const res = await fetch(
        `${API_URL}favoritos/nuevo/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Error al buscar publicaciones: ${res.status} - ${text}`
        );
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarFavorito = async (id: number) => {
    setLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error("No hay token válido");

      const res = await fetch(
        `${API_URL}favoritos/eliminar/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Error al buscar publicaciones: ${res.status} - ${text}`
        );
      }

      const data = await res.json();
      setResultadosBusqueda(data.content ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const recuperarFavoritos = async (page: number = 0, size: number = 10) => {
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error("No hay token válido");

      const res = await fetch(
        `${API_URL}favoritos/paginado?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Error al buscar publicaciones: ${res.status} - ${text}`
        );
      }

      const data = await res.json();
      let pubs: Publicacion[] = (data.content ?? []).map((p: any) => ({
        id: p.id,
        titulo: p.titulo,
        descripcion: p.descripcion,
        fotos_url: p.url_fotos,
        precio: p.precio,
        tipo:
          p.tipo_material === "Apunte"
            ? "apunte"
            : p.tipo_material === "Libro"
              ? "libro"
              : null,
        usuario_id: p.usuario_id,
        latitud: p.latitud,
        longitud: p.longitud,
      }));

      setPubFavoritas(pubs);
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
        resultadosBusqueda,
        fetchPublicacionesGeneric,
        getUserLocation,
        filtrosListado,
        setFiltrosListado,
        filtrosMapa,
        setFiltrosMapa,
        aplicarFiltros,
        cargarinicial,
        limpiarFiltros,
        buscarPorTexto,
        currentPage,
        totalPages,
        hasMore,
        resetPagination,
        loadMore,
        fetchPublicacionesByUsuario,
        pubsUser,
        pubFavoritas,
        agregarFavorito,
        eliminarFavorito,
        recuperarFavoritos,
      }}
    >
      {children}
    </PublicacionContext.Provider>
  );
};

export const usePublicacion = () => {
  const ctx = useContext(PublicacionContext);
  if (!ctx)
    throw new Error("usePublicacion debe usarse dentro de PublicacionProvider");
  return ctx;
};
