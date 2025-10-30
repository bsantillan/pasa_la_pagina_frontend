import { PublicacionCarousel } from "@/components/ui/PublicacionCarousel";
import { Colors } from "@/constants/Colors";
import { PublicacionContext } from "@/contexts/PublicacionContext";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function LibrosRecientes() {
    const context = useContext(PublicacionContext);
    const [libros, setLibros] = useState(context?.publicaciones ?? []);

    useEffect(() => {
        if (context?.publicaciones) {
            // Filtramos solo libros y tomamos los últimos 10
            const ultimosLibros = [...context.publicaciones]
                .filter(pub => pub.tipo === "libro")
                .sort((a, b) => b.id - a.id)
                .slice(0, 10);
            setLibros(ultimosLibros);
        }
    }, [context?.publicaciones]);

    if (!context) return <Text>No hay contexto disponible</Text>;
    if (context.loading) return <Text>Cargando...</Text>;
    if (context.error) return <Text>Error: {context.error}</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Libros recientes</Text>
            <Text style={styles.sectionDesc}>Últimos libros subidos</Text>
            <PublicacionCarousel
                publicaciones={libros}
                onSelect={(pub) => console.log("Seleccionado:", pub)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 24 },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.primary,
        marginBottom: 8,
        marginLeft: 8,
        paddingHorizontal: 16
    },
    sectionDesc: {
        fontSize: 14,
        color: "#666",
        marginLeft: 26,
        marginBottom: 8,
    },
});
