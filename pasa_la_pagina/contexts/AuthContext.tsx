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
  verificarEmail: (email: string, codigo: string, tipo_codigo:"VERIFY_EMAIL" | "RESET_PASSWORD") => Promise<void>;
  reenviarVerificacion: (email: string, tipo_codigo:"VERIFY_EMAIL" | "RESET_PASSWORD") => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  passwordReset: (
    email: string,
    nuevaPassword: string
  ) => Promise<void>;
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
  const fetchUsuario = async (token?: string): Promise<"OK" | "TOKEN_EXPIRED" | null> => {
    try {
      // usamos el token pasado o el que esté en el estado / refrescado
      const validToken = token ?? (await getValidAccessToken());
      if (!validToken) return "TOKEN_EXPIRED";

      const res = await fetch(`${API_URL}user/me`, {
        headers: { Authorization: `Bearer ${validToken}` },
      });

      if (res.status === 401 || res.status === 403) {
        // si token expiró, intentamos refrescar y volver a pedir
        const refreshedToken = await refreshAccessToken();
        if (!refreshedToken) return "TOKEN_EXPIRED";

        const retryRes = await fetch(`${API_URL}user/me`, {
          headers: { Authorization: `Bearer ${refreshedToken}` },
        });
        if (!retryRes.ok) return "TOKEN_EXPIRED";

        const data = await retryRes.json();
        setUser(data);
        return "OK";
      }

      if (!res.ok) throw new Error("Error al obtener usuario: " + res.status);

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

        if (storedAccess || storedRefresh) {
          await fetchUsuario(storedAccess ?? undefined);
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

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        data,
      };
    }

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
    const response = await fetch(`${API_URL}auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellido, email, password }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // reenviamos el error del backend
      throw {
        status: response.status,
        data,
      };
    }

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

  // ------------------------- VERIFY EMAIL -------------------------
  const verificarEmail = async (email: string, codigo: string, tipo_codigo:"VERIFY_EMAIL" | "RESET_PASSWORD") => {
    const response = await fetch(`${API_URL}auth/verificar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, codigo, tipo_codigo }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw {
        status: response.status,
        data,
      };
    }
  };

  // ------------------------- RESEND VERIFICATION -------------------------
  const reenviarVerificacion = async (email: string, tipo_codigo:"VERIFY_EMAIL" | "RESET_PASSWORD") => {
    const response = await fetch(`${API_URL}auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, tipo_codigo }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw {
        status: response.status,
        data,
      };
    }
  };

  const requestPasswordReset = async (email: string) => {
    const response = await fetch(`${API_URL}auth/password-reset/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw {
        status: response.status,
        data,
      };
    }
  };

  const passwordReset = async (
    email: string,
    nuevaPassword: string
  ) => {
    const response = await fetch(`${API_URL}auth/password-reset/confirm`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        nuevaPassword,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw {
        status: response.status,
        data,
      };
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
        verificarEmail,
        reenviarVerificacion,
        requestPasswordReset,
        passwordReset,
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
