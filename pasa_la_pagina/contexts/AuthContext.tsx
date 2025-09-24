import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (
    nombre: string,
    apellido: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  getValidAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  let refreshPromise: Promise<string | null> | null = null;

  useEffect(() => {
    const loadTokens = async () => {
      const storedAccess = await AsyncStorage.getItem("accessToken");
      const storedRefresh = await AsyncStorage.getItem("refreshToken");
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
      setLoading(false);
    };
    loadTokens();
  }, []);
  const decodeJWT = (
    token: string
  ): { exp?: number; [key: string]: any } | null => {
    try {
      const payload = token.split(".")[1];
      if (!payload) return null;

      // Base64URL -> Base64
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

      // Decodificar Base64
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (err) {
      console.warn("Error al decodificar JWT:", err);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("Credenciales invalidas");
    const data = await response.json();

    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
  };

  const loginWithGoogle = async (idToken: string) => {
    const res = await fetch(`${API_URL}auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) throw new Error("Error en el login con Google");

    const data = await res.json();

    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
  };

  const register = async (
    nombre: string,
    apellido: string,
    email: string,
    password: string
  ) => {
    const response = await fetch(`${API_URL}auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellido, email, password }),
    });

    if (!response.ok) throw new Error("Error en el registro");

    const data = await response.json();

    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
  };

  const logout = async () => {
    const response = await fetch(`${API_URL}auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error("Token invalido");

    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    setAccessToken(null);
    setRefreshToken(null);
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshToken) return null;

    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      const response = await fetch(`${API_URL}auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      console.log("Refresh token response status:", response);

      if (!response.ok) {
        await logout(); // <--- esto es Promise<void>
        refreshPromise = null;
        return null; // <--- esto está bien, retorna Promise<string | null>
      }

      const data = await response.json();
      await AsyncStorage.setItem("accessToken", data.accessToken);
      setAccessToken(data.accessToken);
      refreshPromise = null;
      return data.accessToken;
    })();

    return refreshPromise;
  };

  const getValidAccessToken = async () => {
    if (!accessToken) return null;



    try {
      const decoded = decodeJWT(accessToken);
      if (!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000) {
        // Token vencido o inválido
        return await refreshAccessToken();
      }

      return accessToken;
    } catch (err) {
      // Token corrupto, refrescar
      return await refreshAccessToken();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        getValidAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de authProvider");
  return context;
};
