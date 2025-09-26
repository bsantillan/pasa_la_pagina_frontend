import { PublicacionCarousel } from "@/components/ui/PublicacionCarousel";
import { Colors } from "@/constants/Colors";
import { PublicacionContext } from "@/contexts/PublicacionContext";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function NovedadesRecientes() {
    const context = useContext(PublicacionContext);
    const [novedades, setNovedades] = useState(context?.publicaciones ?? []);

    useEffect(() => {
        if (context?.publicaciones) {
            // Ordenamos por ID descendente para simular recientes
            const ultimas = [...context.publicaciones]
                .sort((a, b) => b.id - a.id)
                .slice(0, 10); // Tomamos las últimas 10
            setNovedades(ultimas);
        }
    }, [context?.publicaciones]);

    if (!context) return <Text>No hay contexto disponible</Text>;
    if (context.loading) return <Text>Cargando...</Text>;
    if (context.error) return <Text>Error: {context.error}</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Novedades recientes</Text>
            <Text style={styles.sectionDesc}>Últimos libros y apuntes subidos</Text>
            <PublicacionCarousel
                publicaciones={novedades}
                onSelect={(pub) => console.log("Seleccionado:", pub)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 24 },
    sectionTitle: { fontSize: 20, fontWeight: "bold", color: Colors.primary, marginBottom: 8, marginLeft: 8, paddingHorizontal: 16 },
    sectionDesc: { fontSize: 14, color: "#666", marginLeft: 26, marginBottom: 8,},
});
