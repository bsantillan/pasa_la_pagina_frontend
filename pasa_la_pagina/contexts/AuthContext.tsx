import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
    accessToken: string | null;
    refreshToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (nombre: string, apellido: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    getValidAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: {children: React.ReactNode}) => {

    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    useEffect(()=>{
        const loadTokens = async()=>{
            
            const storedAccess = await AsyncStorage.getItem("accessToken");
            const storedRefresh = await AsyncStorage.getItem("refreshToken");
            setAccessToken(storedAccess);
            setRefreshToken(storedRefresh);
        };
        loadTokens();
    }, []);

    const login = async(email: string, password: string)=>{
        
        const response = await fetch("url/auth/login", {
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

    const register = async(nombre: string, apellido: string, email: string, password: string)=>{

        const response = await fetch("url/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, apellido, email, password })
        });

        if (!response.ok) throw new Error("Error en el registro");

        const data = await response.json();

        await AsyncStorage.setItem("accessToken", data.accessToken);
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
    };

    const logout = async()=>{

        const response = await fetch("url/auth/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) throw new Error("Token invalido");

        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        setAccessToken(null);
        setRefreshToken(null);
    };

    const refreshAccessToken = async(): Promise<string | null> =>{

        if (!refreshToken) return null;

        const response = await fetch("url/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok){
            logout();
            return null;
        };

        const data = await response.json();
        await AsyncStorage.setItem("accessToken", data.accessToken);
        setAccessToken(data.accessToken);

        return data.accessToken;
    };

    const getValidAccessToken = async()=>{
        return accessToken;
        // TODO Obtener siempre un accessToken válido
      // Falta decodificar el accesToken para saber si esta vencido
    }
      
    
    return (
        <AuthContext.Provider
            value={{
                accessToken,
                refreshToken,
                login,
                register,
                logout,
                getValidAccessToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = ()=>{

    const context = useContext(AuthContext);
    if(!context) throw new Error("useAuth debe usarse dentro de authProvider");
    return context;
};


