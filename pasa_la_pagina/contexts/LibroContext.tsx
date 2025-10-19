import React, { createContext, ReactNode, useContext } from "react";
import { useAuth } from "./AuthContext";
import { LibroData } from "./PublicacionContext";

type LibroContextType = {
  fetchBookFromApi: (isbn: string) => Promise<LibroData[]>;
  fetchBookFromBackend: (isbn: string) => Promise<LibroData[]>;
};

const LibroContext = createContext<LibroContextType | undefined>(undefined);

export const LibroProvider = ({ children }: { children: ReactNode }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
  const { getValidAccessToken } = useAuth();

  /** 🔹 1. Buscar en OpenLibrary */
  const fetchBookFromApi = async (isbn: string): Promise<LibroData[]> => {
    try {
      const res = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      );
      const data = await res.json();
      const bookKey = `ISBN:${isbn}`;
      const book = data[bookKey];

      if (!book) return [];

      return [
        {
          isbn: parseInt(isbn),
          titulo: book.title || "",
          autor: book.authors?.map((a: any) => a.name).join(", ") || "",
          editorial: book.publishers?.map((p: any) => p.name).join(", ") || "",
        },
      ];
    } catch (err) {
      console.error("Error al buscar en OpenLibrary:", err);
      return [];
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

  return (
    <LibroContext.Provider value={{ fetchBookFromApi, fetchBookFromBackend }}>
      {children}
    </LibroContext.Provider>
  );
};

export const useLibro = () => {
  const context = useContext(LibroContext);
  if (!context) throw new Error("useLibro debe usarse dentro de LibroProvider");
  return context;
};
