import React, { createContext, useContext, useState } from "react";

type PublicacionTipo = "libro" | "apunte" | null;

type LibroData = {
  titulo?: string;
  autor?: string;
  editorial?: string;
  sinopsis?: string;
  isbn?: number;
  idioma?: string;
  genero?: string;
  digital?: boolean;
};

type ApunteData = {
  titulo?: string;
  digital?: boolean;
  idioma?: string;
  anio_elaboracion?: number;
  materia?: string;
  carrera?: string;
  institucion?: string;
  nivel_educativo?: string;
  seccion?: string;
  paginas?: number;
};

type ComunesData = {
  descripcion?: string;
  nuevo?: boolean;
  latitud?: number;
  longitud?: number;
  fotos_url?: string[];
  precio?: number;
  cantidad?: number;
  tipo_oferta?: string;
  usuario_id?: number;
};

type PublicacionContextType = {
  tipo: PublicacionTipo;
  libro: LibroData;
  apunte: ApunteData;
  comunes: ComunesData;
  setTipo: (t: PublicacionTipo) => void;
  updateLibro: (data: Partial<LibroData>) => void;
  updateApunte: (data: Partial<ApunteData>) => void;
  updateComunes: (data: Partial<ComunesData>) => void;
  reset: () => void;
};

const PublicacionContext = createContext<PublicacionContextType | undefined>(
  undefined
);

export const PublicacionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [tipo, setTipo] = useState<PublicacionTipo>(null);
  const [libro, setLibro] = useState<LibroData>({});
  const [apunte, setApunte] = useState<ApunteData>({});
  const [comunes, setComunes] = useState<ComunesData>({});

  const updateLibro = (data: Partial<LibroData>) =>
    setLibro((prev) => ({ ...prev, ...data }));
  const updateApunte = (data: Partial<ApunteData>) =>
    setApunte((prev) => ({ ...prev, ...data }));
  const updateComunes = (data: Partial<ComunesData>) =>
    setComunes((prev) => ({ ...prev, ...data }));

  const reset = () => {
    setTipo(null);
    setLibro({});
    setApunte({});
    setComunes({});
  };

  return (
    <PublicacionContext.Provider
      value={{
        tipo,
        libro,
        apunte,
        comunes,
        setTipo,
        updateLibro,
        updateApunte,
        updateComunes,
        reset,
      }}
    >
      {children}
    </PublicacionContext.Provider>
  );
};

export const usePublicacion = () => {
  const ctx = useContext(PublicacionContext);
  if (!ctx)
    throw new Error("usePublicacion debe usarse dentro de PublicacionProvider");
  return ctx;
};
