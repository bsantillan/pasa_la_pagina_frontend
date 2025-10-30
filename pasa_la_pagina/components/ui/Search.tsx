import { Colors } from "@/constants/Colors";
import { Publicacion, PublicacionContext } from "@/contexts/PublicacionContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type BuscadorProps = {
    placeholder?: string;
    onSelect?: (publicacion: Publicacion) => void;
    showBackIcon?: boolean;
    onBackPress?: () => void;
};

export const Buscador: React.FC<BuscadorProps> = ({
    placeholder = "Search ...",
    onSelect,
    showBackIcon = false,
    onBackPress,
}) => {
    const publicacionContext = useContext(PublicacionContext);
    const [query, setQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    if (!publicacionContext) {
        return <Text>Error: PublicacionContext no disponible</Text>;
    }

    const { resultadosBusqueda, loading, error, buscarPublicaciones } = publicacionContext;

    useEffect(() => {
        const busqueda = async () => {
            if (query.length >= 2) {
                buscarPublicaciones(query);
                setShowDropdown(true);
            } else {
                setShowDropdown(false);
            }
        };
        busqueda();
    }, [buscarPublicaciones, query]);

    const handleSelect = (publicacion: Publicacion) => {
        if (onSelect) onSelect(publicacion);
        setQuery(publicacion.titulo);
        setShowDropdown(false);
    };

    const renderItem = ({ item }: { item: Publicacion }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => handleSelect(item)}
        >
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text numberOfLines={1}>{item.descripcion}</Text>
            {item.precio !== null && <Text>Precio: ${item.precio}</Text>}
            <Text>Tipo: {item.tipo}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {showBackIcon && (
                <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color="#333" />
                </TouchableOpacity>
            )}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="#A1A1A1" style={styles.icon} />
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor="#A1A1A1"
                    value={query}
                    onChangeText={setQuery}
                    style={styles.input}
                />
            </View>

            {loading && (
                <ActivityIndicator
                    style={{ marginVertical: 8 }}
                    size="small"
                    color={Colors.primary}
                />
            )}
            {error && <Text style={styles.error}>{error}</Text>}

            {showDropdown && resultadosBusqueda.length > 0 && (
                <View style={styles.dropdown}>
                    <FlatList
                        data={resultadosBusqueda}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        keyboardShouldPersistTaps="handled"
                        scrollEnabled={false}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        paddingHorizontal: 8,
        marginTop: 8,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 30,
        paddingHorizontal: 12,
        paddingVertical: 8, // en lugar de height
        width: "90%",
    },
    backButton: {
        marginRight: 12,
    },
    icon: {
        marginRight: 6,
    },
    input: {
        flex: 1,
        fontSize: 12,
        color: "#333",
        textAlignVertical: "center",
        paddingVertical: 6,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginTop: 4,
        maxHeight: 200,
        backgroundColor: "#fff",
        width: "90%",
        zIndex: 100,
    },
    itemContainer: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    titulo: {
        fontWeight: "bold",
    },
    error: {
        color: "red",
        marginTop: 4,
    },
});
