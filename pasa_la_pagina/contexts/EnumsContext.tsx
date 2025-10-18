import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

type EnumsContextType = {
  idiomas: string[] | null;
  nivelesEducativos: string[] | null;
  tiposMaterial: string[] | null;
  tiposOferta: string[] | null;
  loading: boolean;
  buscarIdiomas: (query: string) => Promise<string[]>;
  fetchNivelesEducativos: () => Promise<string[]>;
  fetchTiposMaterial: () => Promise<string[]>;
  fetchTiposOferta: () => Promise<string[]>;
};

const EnumsContext = createContext<EnumsContextType | undefined>(undefined);

export const EnumsProvider = ({ children }: { children: React.ReactNode }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
  const { getValidAccessToken } = useAuth();

  const [idiomas, setIdiomas] = useState<string[] | null>(null);
  const [nivelesEducativos, setNivelesEducativos] = useState<string[] | null>(null);
  const [tiposMaterial, setTiposMaterial] = useState<string[] | null>(null);
  const [tiposOferta, setTiposOferta] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Función genérica para fetch con Bearer
  const fetchWithToken = async (endpoint: string) => {
    const token = await getValidAccessToken();
    if (!token) throw new Error("No se pudo obtener token válido");

    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`Error al obtener ${endpoint}`);
    return res.json();
  };

  const buscarIdiomas = async (query: string): Promise<string[]> => {
    if (!query || query.trim().length < 1) return idiomas ?? [];
    setLoading(true);
    try {
      const data = await fetchWithToken(`enums/idiomas/buscar?q=${encodeURIComponent(query)}`);
      return data.map((i: any) => i.nombre ?? i);
    } finally {
      setLoading(false);
    }
  };

  const fetchNivelesEducativos = async (): Promise<string[]> => {
    setLoading(true);
    const data = await fetchWithToken("enums/niveles-educativos");
    setNivelesEducativos(data);
    setLoading(false);
    return data;
  };

  const fetchTiposMaterial = async (): Promise<string[]> => {
    setLoading(true);
    const data = await fetchWithToken("enums/tipo-material");
    setTiposMaterial(data);
    setLoading(false);
    return data;
  };

  const fetchTiposOferta = async (): Promise<string[]> => {
    setLoading(true);
    const data = await fetchWithToken("enums/tipo-oferta");
    setTiposOferta(data);
    setLoading(false);
    return data;
  };

  return (
    <EnumsContext.Provider
      value={{
        idiomas,
        nivelesEducativos,
        tiposMaterial,
        tiposOferta,
        loading,
        buscarIdiomas,
        fetchNivelesEducativos,
        fetchTiposMaterial,
        fetchTiposOferta,
      }}
    >
      {children}
    </EnumsContext.Provider>
  );
};

export const useEnums = () => {
  const context = useContext(EnumsContext);
  if (!context) throw new Error("useEnums debe usarse dentro de EnumsProvider");
  return context;
};

