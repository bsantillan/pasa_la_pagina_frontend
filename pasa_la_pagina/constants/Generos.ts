export const GENERO_EXTENDIDO = [
    // Fantasía
    "Fantasía",
    "Alta fantasía",
    "Fantasía urbana",
    "Fantasía oscura",
    "Fantasía épica",
    "Fantasía histórica",
    "Gaslamp Fantasy",
    "Grimdark",
    "Hopepunk",

    // Ciencia ficción
    "Ciencia ficción",
    "Ciencia ficción distópica",
    "Ciencia ficción postapocalíptica",
    "Ópera espacial",
    "Cyberpunk",
    "Steampunk",
    "Biopunk",
    "Ucronía",
    "Cli-Fi (Climate Fiction)",
    "Afrofuturismo",
    "Solarpunk",
    "Ficción especulativa",

    // Realismo mágico / Weird
    "Realismo mágico",
    "Weird Fiction",
    "New Weird",

    // Aventuras
    "Aventura",
    "Supervivencia",
    "Viajes",

    // Terror
    "Terror",
    "Horror psicológico",
    "Horror sobrenatural",
    "Gótico",

    // Suspenso / Crimen
    "Suspenso / Thriller",
    "Thriller psicológico",
    "Thriller legal",
    "Thriller médico",
    "Thriller de espionaje",
    "Misterio / Policial",
    "Noir",
    "Detectivesco",
    "True Crime",
    "Novela negra",
    "Hardboiled",

    // Romance
    "Romance",
    "Romance contemporáneo",
    "Romance histórico",
    "Romance juvenil",
    "Romance paranormal",
    "Romántica erótica",
    "Erótica",
    "Erotismo BDSM",

    // Históricos
    "Novela histórica",
    "Bélico",
    "Western",

    // Ficción general
    "Drama",
    "Humor",
    "Sátira",
    "Parodia",
    "Slice of Life",
    "Distopía",

    // Juvenil / Infantil
    "Juvenil (YA)",
    "New Adult",
    "Infantil",
    "Cuento",
    "Fábula",

    // Poesía / Teatro
    "Poesía",
    "Poema épico",
    "Teatro",
    "Guion (cine/teatro)",

    // Ensayo / Crónica
    "Ensayo",
    "Ensayo literario",
    "Ensayo político",
    "Crónica",
    "Periodismo narrativo",

    // Biografía / Memorias
    "Biografía",
    "Autobiografía",
    "Memorias",
    "Diario personal",

    // Divulgación / Educación
    "Divulgación científica",
    "Divulgación matemática",
    "Ciencias naturales",
    "Historia",
    "Sociología",
    "Psicología",
    "Filosofía",
    "Política",
    "Economía",
    "Tecnología",
    "Arte / Diseño",
    "Música",
    "Educación",

    // Autoayuda / Coaching
    "Autoayuda",
    "Autoayuda espiritual",
    "Coaching",
    "Negocios / Management",

    // Religión y mitología
    "Religión / Espiritualidad",
    "Mitología",
    "Filosofía religiosa",
    "Estudios bíblicos",

    // Prácticos
    "Guía práctica",
    "Manual técnico",
    "Cocina / Gastronomía",
    "Viajes / Turismo",

    // Varios
    "LitRPG",
    "Dark Academia",
    "Antología",
] as const;

export const fetchGeneros = async (query: string): Promise<string[]> => {
    const q = query.toLowerCase();
    return GENERO_EXTENDIDO.filter((g) =>
        g.toLowerCase().includes(q)
    );
};