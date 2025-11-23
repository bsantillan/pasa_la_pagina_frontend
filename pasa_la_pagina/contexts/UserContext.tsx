import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

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
  reseniasRecibidas: Resenia[];
  reseniasHechas: Resenia[];
  loading: boolean;
  fetchReseniasRecibidas: () => Promise<void>;
  fetchReseniasHechas: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reseniasRecibidas, setReseniasRecibidas] = useState<Resenia[]>([]);
  const [reseniasHechas, setReseniasHechas] = useState<Resenia[]>([]);
  const [loading, setLoading] = useState(false);
  const { getValidAccessToken, user } = useAuth();

  const fetchReseniasRecibidas = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await getValidAccessToken();
      const res = await fetch(`${API_URL}resenia/usuario/${user.id}/recibidas`, {
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
    if (!user) return;
    try {
      setLoading(true);
      const token = await getValidAccessToken();
      const res = await fetch(`${API_URL}resenia/usuario/${user.id}/hechas`, {
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
    if (user) {
      fetchReseniasRecibidas();
      fetchReseniasHechas();
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        reseniasRecibidas,
        reseniasHechas,
        loading,
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
