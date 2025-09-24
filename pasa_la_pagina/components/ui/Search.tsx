import { Publicacion, PublicacionContext } from "@/contexts/PublicacionContext";
import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type BuscadorProps = {
    placeholder?: string;
    onSelect?: (publicacion: Publicacion) => void;
};

export const Buscador: React.FC<BuscadorProps> = ({ placeholder = "Buscar publicaciones...", onSelect }) => {
    const publicacionContext = useContext(PublicacionContext);
    const [query, setQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    if (!publicacionContext) {
        return <Text>Error: PublicacionContext no disponible</Text>;
    }

    const { publicaciones, loading, error, buscarPublicaciones } = publicacionContext;

    // Efecto para buscar mientras escribes
    useEffect(() => {
        if (query.length >= 2) {
            buscarPublicaciones(query);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    }, [query]);

    const handleSelect = (publicacion: Publicacion) => {
        if (onSelect) onSelect(publicacion);
        setQuery(publicacion.titulo);
        setShowDropdown(false);
    };

    const renderItem = ({ item }: { item: Publicacion }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelect(item)}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text numberOfLines={1}>{item.descripcion}</Text>
            {item.precio !== null && <Text>Precio: ${item.precio}</Text>}
            <Text>Tipo: {item.tipo}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
                <TextInput
                    placeholder={placeholder}
                    value={query}
                    onChangeText={setQuery}
                    style={styles.input}
                />
            </View>

            {loading && <ActivityIndicator style={{ marginVertical: 8 }} size="small" color="#0000ff" />}
            {error && <Text style={styles.error}>{error}</Text>}

            {showDropdown && publicaciones.length > 0 && (
                <View style={styles.dropdown}>
                    <FlatList
                        data={publicaciones}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { width: "100%" },
    inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 8, height: 40 },
    input: { flex: 1, height: "100%" },
    dropdown: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginTop: 4, maxHeight: 200, backgroundColor: "#fff", zIndex: 100 },
    itemContainer: { padding: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
    titulo: { fontWeight: "bold" },
    error: { color: "red", marginTop: 4 },
});
