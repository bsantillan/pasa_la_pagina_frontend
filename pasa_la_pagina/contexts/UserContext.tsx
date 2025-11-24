import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Resenia = {
  id: number;
  fecha: string;
  descripcion: string;
  valoracion: number;
  usuarioNombre: string;
  usuarioId: number;
  intercambioId: number;
};

type UserContextType = {
  reseniasRecibidas: Resenia[];
  reseniasHechas: Resenia[];
  loading: boolean;
  fetchReseniasRecibidas: () => Promise<void>;
  fetchReseniasHechas: () => Promise<void>;
  eliminarPublicacion: (id: number) => Promise<boolean>;
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
      const res = await fetch(`${API_URL}resenia/usuario/recibidas`, {
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
      const res = await fetch(`${API_URL}resenia/usuario/hechas`, {
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

  // ------------------ NUEVO: ELIMINAR PUBLICACIÓN ------------------
  const eliminarPublicacion = async (id: number): Promise<boolean> => {
    if (!user) return false;
    try {
      setLoading(true);
      const token = await getValidAccessToken();
      const res = await fetch(`${API_URL}publicacion/eliminar`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Error al eliminar la publicación");
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        reseniasRecibidas,
        reseniasHechas,
        loading,
        fetchReseniasRecibidas,
        fetchReseniasHechas,
        eliminarPublicacion,
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
