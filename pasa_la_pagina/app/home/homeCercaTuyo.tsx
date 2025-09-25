import { PublicacionCarousel } from "@/components/ui/PublicacionCarousel";
import { Colors } from "@/constants/Colors";
import { PublicacionContext } from "@/contexts/PublicacionContext";
import React, { useContext, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";


export default function CercaTuyo() {
    const context = useContext(PublicacionContext);

    useEffect(() => {
        context?.fetchCercaTuyo(); 
    }, []);


    if (!context) return <Text>No hay contexto disponible</Text>;
    if (context.loading) return <Text>Cargando...</Text>;
    if (context.error) return <Text>Error: {context.error}</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Cerca tuyo</Text>
            <Text style={styles.sectionDesc}>descripcion</Text>
            <PublicacionCarousel
                publicaciones={context.publicaciones}
                onSelect={(pub) => console.log("Seleccionado:", pub)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    sectionDesc: { fontSize: 14, color: "#666", marginLeft: 16, marginBottom: 8 },
    container: { marginBottom: 24 },
    sectionTitle: { fontSize: 20, fontWeight: "bold", color: Colors.primary, marginBottom: 8, paddingHorizontal: 16 },
});
