import React, { createContext, ReactNode, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { LibroData } from "./PublicacionContext";

type LibroContextType = {
    libros_api: LibroData[];
    loading_api: boolean;
    fetchBookFromApi: (isbn: string) => Promise<void>;
    fetchBookFromBackend: (isbn: string) => Promise<LibroData[]>;
    clearBookData: () => void;
};

const LibroContext = createContext<LibroContextType | undefined>(undefined);

export const LibroProvider = ({ children }: { children: ReactNode }) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
    const { getValidAccessToken } = useAuth();

    const [libros_api, setLibrosApi] = useState<LibroData[]>([]);
    const [loading_api, setLoadingBook] = useState(false);

    /** 🔹 1. Buscar en OpenLibrary */
    const fetchBookFromApi = async (isbn: string)=> {
        try {
            const res = await fetch(
                `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
            );
            const data = await res.json();
            const bookKey = `ISBN:${isbn}`;
            const book = data[bookKey];

            if (!book) setLibrosApi([]);

            const result = [
                {
                    isbn: parseInt(isbn),
                    titulo: book.title || "",
                    autor: book.authors?.map((a: any) => a.name).join(", ") || "",
                    editorial: book.publishers?.map((p: any) => p.name).join(", ") || "",
                },
            ];

            setLibrosApi(result);
        } catch (err) {
            console.error("Error al buscar en OpenLibrary:", err);
        }
    };

    /** 🔹 2. Buscar en tu backend */
    const fetchBookFromBackend = async (isbn: string): Promise<LibroData[]> => {
        try {
            const token = await getValidAccessToken();
            if (!token) throw new Error("No hay token válido");

            const res = await fetch(`${API_URL}libros/buscar?isbn=${isbn}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error al obtener libros: ${res.status} - ${text}`);
            }

            const libros = await res.json();
            return libros;
        } catch (err) {
            console.error("Error al buscar en backend:", err);
            return [];
        }
    };

    const clearBookData = () => setLibrosApi([]);

    return (
        <LibroContext.Provider
            value={{
                libros_api,
                loading_api,
                fetchBookFromApi,
                fetchBookFromBackend,
                clearBookData,
            }}
        >
            {children}
        </LibroContext.Provider>
    );
};

export const useLibro = () => {
    const context = useContext(LibroContext);
    if (!context) throw new Error("useLibro debe usarse dentro de LibroProvider");
    return context;
};
