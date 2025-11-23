import React, {
    createContext,
    useContext,
    useState
} from "react";
import { useAuth } from "./AuthContext";

export type EstadoIntercambio =
  | "PENDIENTE"
  | "CANCELADO"
  | "CONCRETADO"
  | "ACEPTADO"
  | "RECHAZADO";

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
  wsConnected: boolean;
  ultimoEstadoIntercambio: {
    intercambioId: number;
    estado: EstadoIntercambio;
    puedeDejarResena: boolean;
    mensaje: string;
  } | null;
  solicitarIntercambio: (id: number) => Promise<void>;
  aceptarIntercambio: (id: number) => Promise<void>;
  concretarIntercambio: (id: number) => Promise<void>;
  cancelarIntercambio: (id: number) => Promise<void>;
  buscarIntercambios: (
    filtros?: BuscarIntercambioRequest,
    page?: number,
    size?: number
  ) => Promise<Intercambio[]>;
  seleccionarIntercambio: (intercambio: Intercambio | null) => void;
  generarCodigoValidacion: (
    intercambioId: number,
    token: string
  ) => Promise<string>;
  validarIntercambioConCodigo: (
    intercambioId: number,
    codigo: string,
    token: string
  ) => Promise<void>;
  getEstadoActualizado: (
    intercambioId: number,
    token: string
  ) => Promise<{
    estado: EstadoIntercambio;
    puedeDejarResena: boolean;
    mensaje: string;
  }>;
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
  const { getValidAccessToken, accessToken } = useAuth();

  const [intercambios, setIntercambios] = useState<Intercambio[] | null>(null);
  const [intercambioSeleccionado, setIntercambioSeleccionado] =
    useState<Intercambio | null>(null);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [ultimoEstadoIntercambio, setUltimoEstadoIntercambio] = useState<{
    intercambioId: number;
    estado: EstadoIntercambio;
    puedeDejarResena: boolean;
    mensaje: string;
  } | null>(null);


  // --- Fetch con token ---
  const fetchWithToken = async (
    endpoint: string,
    method: string = "GET",
    body?: any
  ) => {
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

  // ... tus funciones existentes ...

  const solicitarIntercambio = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetchWithToken(`intercambio/solicitar/${id}`, "POST");
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

  const buscarIntercambios = async (
    filtros?: BuscarIntercambioRequest,
    page?: number,
    size?: number
  ): Promise<Intercambio[]> => {
    setLoading(true);
    try {
      let url = "intercambio/paginado";
      const params: string[] = [];
      if (page !== undefined) params.push(`page=${page}`);
      if (size !== undefined) params.push(`size=${size}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      console.log("📤 Enviando filtros:", JSON.stringify(filtros, null, 2));

      const data = await fetchWithToken(url, "POST", filtros);

      setIntercambios(data?.content ?? data ?? []);
      console.log(data.content ?? data);
      return data?.content ?? data ?? [];
    } finally {
      setLoading(false);
    }
  };

  const seleccionarIntercambio = (intercambio: Intercambio | null) => {
    setIntercambioSeleccionado(intercambio);
  };

  const generarCodigoValidacion = async (
    intercambioId: number,
    token: string
  ) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}intercambio/${intercambioId}/generar-codigo`,
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
        throw new Error(`Error al generar código: ${res.status} - ${text}`);
      }

      const codigo = await res.text();
      console.log("Código generado:", codigo);
      return codigo;
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validarIntercambioConCodigo = async (
    intercambioId: number,
    codigo: string,
    token: string
  ) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}intercambio/${intercambioId}/validar-con-codigo?codigo=${codigo}`,
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
        throw new Error(`Error al validar código: ${res.status} - ${text}`);
      }

      // Actualizar estado local del intercambio
      setIntercambios(
        (prev) =>
          prev?.map((int) =>
            int.id === intercambioId
              ? { ...int, estadoIntercambio: "CONCRETADO" as EstadoIntercambio }
              : int
          ) || null
      );
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEstadoActualizado = async (intercambioId: number, token: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}intercambio/${intercambioId}/estado-actualizado`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error al obtener estado: ${res.status} - ${text}`);
      }

      const data = await res.json();
      return {
        estado: data.estado,
        puedeDejarResena: data.puedeDejarResena,
        mensaje: data.mensaje,
      };
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <IntercambioContext.Provider
      value={{
        intercambios,
        intercambioSeleccionado,
        loading,
        wsConnected,
        ultimoEstadoIntercambio,
        solicitarIntercambio,
        aceptarIntercambio,
        concretarIntercambio,
        cancelarIntercambio,
        buscarIntercambios,
        seleccionarIntercambio,
        generarCodigoValidacion,
        validarIntercambioConCodigo,
        getEstadoActualizado,
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
