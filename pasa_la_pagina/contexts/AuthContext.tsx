import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
};

type AuthContextType = {
  accessToken: string | null;
  refreshToken: string | null;
  user: Usuario | null;
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
  const [user, setUser] = useState<Usuario | null>(null);

  let refreshPromise: Promise<string | null> | null = null;

  // ------------------------- JWT Decode -------------------------
  const decodeJWT = (token: string): { exp?: number } | null => {
    try {
      const payload = token.split(".")[1];
      if (!payload) return null;

      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  // ------------------------- REFRESH TOKEN -------------------------
  const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshToken) return null;

    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          await logout();
          refreshPromise = null;
          return null;
        }

        const data = await response.json();
        await AsyncStorage.setItem("accessToken", data.accessToken);
        setAccessToken(data.accessToken);

        refreshPromise = null;
        return data.accessToken;
      } catch {
        refreshPromise = null;
        return null;
      }
    })();

    return refreshPromise;
  };

  // ------------------------- VALIDATE OR REFRESH TOKEN -------------------------
  const getValidAccessToken = useCallback(async () => {
    if (!accessToken) return null;

    const decoded = decodeJWT(accessToken);

    if (!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000) {
      return await refreshAccessToken();
    }

    return accessToken;
  }, [accessToken, refreshToken]);

  // ------------------------- FETCH USER -------------------------
  const fetchUsuario = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) return "TOKEN_EXPIRED";

      if (!res.ok) throw new Error("Error al obtener usuario");

      const data = await res.json();
      setUser(data);
      return "OK";
    } catch (e) {
      console.error("fetchUsuario error:", e);
      return null;
    }
  };

  // ------------------------- LOGIN AUTOMÁTICO -------------------------
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const storedAccess = await AsyncStorage.getItem("accessToken");
        const storedRefresh = await AsyncStorage.getItem("refreshToken");

        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);

        if (!storedAccess) return;

        const result = await fetchUsuario(storedAccess);

        if (result === "TOKEN_EXPIRED" && storedRefresh) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            await fetchUsuario(newToken);
          }
        }
      } catch (err) {
        console.error("Error loading token:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, []);

  // ------------------------- LOGIN -------------------------
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
    setUser({
      id: data.id,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
    });
  };

  // ------------------------- GOOGLE LOGIN -------------------------
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

  // ------------------------- REGISTER -------------------------
  const register = async (
    nombre: string,
    apellido: string,
    email: string,
    password: string
  ) => {
    const res = await fetch(`${API_URL}auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellido, email, password }),
    });

    if (!res.ok) throw new Error("Error en el registro");

    const data = await res.json();

    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
  };

  // ------------------------- LOGOUT -------------------------
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");

      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);

      await fetch(`${API_URL}auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  // ------------------------- PROVIDER -------------------------
  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        loading,
        user,
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
