export type Publicacion = {
   id: number;
  titulo: string;
  descripcion: string;
  tipo_material: "Libro" | "Apunte";
  tipo_oferta: string;
  precio: number | null;
  cantidad: number | null;
  digital: boolean;
  nuevo: boolean;
  disponible: boolean;
  url?: string | null;
  url_fotos: string[];
  latitud?: number | null;
  longitud?: number | null;

  // Campos de libro
  autor?: string | null;
  editorial?: string | null;
  genero?: string | null;
  isbn?: string | null;
  cantidad_paginas?: number | null;
  idioma?: string | null;

  // Campos de apunte
  anio_elaboracion?: number | null;
  materia?: string | null;
  carrera?: string | null;
  institucion?: string | null;
  nivel_educativo?: string | null;
  seccion?: string | null;

  usuario_id: number;
  usuario_nombre: string;
  usuario_apellido: string;
}