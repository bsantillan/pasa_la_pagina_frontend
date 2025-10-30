import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { usePublicacion } from "./PublicacionContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
};

type Resenia = {
  id: number;
  descripcion: string;
  valoracion: number;
  autorNombre: string;
  intercambioId: number;
};

type UserContextType = {
  usuario: Usuario | null;
  reseniasRecibidas: Resenia[];
  reseniasHechas: Resenia[];
  loading: boolean;
  fetchUsuario: () => Promise<void>;
  fetchReseniasRecibidas: () => Promise<void>;
  fetchReseniasHechas: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [reseniasRecibidas, setReseniasRecibidas] = useState<Resenia[]>([]);
  const [reseniasHechas, setReseniasHechas] = useState<Resenia[]>([]);
  const [loading, setLoading] = useState(false);
  const { getValidAccessToken } = useAuth();
  const { fetchTodasPublicaciones } = usePublicacion();

  const fetchUsuario = async () => {
    try {
      setLoading(true);
      const token = await getValidAccessToken();
      if (!token) return;

      const res = await fetch(`${API_URL}user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener usuario");
      const data = await res.json();
      setUsuario(data);

      await fetchTodasPublicaciones();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const fetchReseniasRecibidas = async () => {
  if (!usuario) return;
  try {
    setLoading(true);
    const token = await getValidAccessToken();
    const res = await fetch(`${API_URL}resenia/usuario/${usuario.id}/recibidas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener reseñas recibidas");
    const data = await res.json();
    setReseniasRecibidas(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error(err);
    setReseniasRecibidas([]);
  } finally {
    setLoading(false);
  }
};

const fetchReseniasHechas = async () => {
  if (!usuario) return;
  try {
    setLoading(true);
    const token = await getValidAccessToken();
    const res = await fetch(`${API_URL}resenia/usuario/${usuario.id}/hechas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener reseñas hechas");
    const data = await res.json();
    setReseniasHechas(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error(err);
    setReseniasHechas([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchUsuario();
  }, []);

  useEffect(() => {
    if (usuario) {
      fetchReseniasRecibidas();
      fetchReseniasHechas();
    }
  }, [usuario]);

  return (
    <UserContext.Provider
      value={{
        usuario,
        reseniasRecibidas,
        reseniasHechas,
        loading,
        fetchUsuario,
        fetchReseniasRecibidas,
        fetchReseniasHechas,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de UserProvider");
  return ctx;
};
