import { Colors } from "@/constants/Colors";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface AsyncAutocompleteInputProps {
    value: string;
    placeholder?: string;
    showErrors?: boolean;
    errorMessage?: string;
    fetchOptions: (query: string) => Promise<string[]>; // función para buscar
    onSelect: (item: string) => void;

    returnKeyType?: "done" | "next" | "go" | "search" | "send";
    onSubmitEditing?: () => void;
    blurOnSubmit?: boolean;
    inputRef?: React.RefObject<TextInput | null>;
}

export const AsyncAutocompleteInput: React.FC<AsyncAutocompleteInputProps> = ({
    value,
    placeholder = "Escribí y selecciona una opción",
    showErrors = false,
    errorMessage = "Este campo es obligatorio",
    fetchOptions,
    onSelect,

    // nuevas
    inputRef,
    returnKeyType = "done",
    blurOnSubmit = true,
    onSubmitEditing,
}) => {
    const [query, setQuery] = useState("");
    const [buscando, setBuscando] = useState(false);
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        if (!query.trim()) {
            setBuscando(false);
            setOptions([]);
            return;
        }

        const timeout = setTimeout(async () => {
            const resultados = await fetchOptions(query.trim());
            setOptions(resultados);
            setBuscando(resultados.length > 0);
        }, 200);

        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <View style={{ position: "relative", zIndex: 1000 }}>
            <TextInput
                ref={inputRef ?? undefined}
                value={query || value || ""}
                onChangeText={(t) => {
                    setQuery(t);
                    onSelect("");
                    setBuscando(Boolean(t.trim()));
                }}
                placeholder={placeholder}
                style={[styles.input, showErrors && !value?.trim() && styles.inputError]}
                placeholderTextColor={showErrors && !value?.trim() ? "#ff6b6b" : "#999"}

                // nuevas props
                returnKeyType={returnKeyType}
                blurOnSubmit={blurOnSubmit}
                onSubmitEditing={onSubmitEditing}
            />

            {showErrors && !value?.trim() && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            {buscando && options.length > 0 && (
                <ScrollView style={styles.dropdownScroll} keyboardShouldPersistTaps="handled">
                    {options.map((item) => (
                        <TouchableOpacity
                            key={item}
                            onPress={() => {
                                setBuscando(false);
                                setQuery("");
                                onSelect(item);
                            }}
                            style={styles.dropdownItem}
                        >
                            <Text style={styles.dropdownItemText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 20,
        borderColor: Colors.text,
        marginBottom: 16,
        color: Colors.text
    },
    inputError: {
        borderColor: "#ff4444",
        borderWidth: 2,
        backgroundColor: Colors.background,
    },
    errorText: {
        color: "#ff4444",
        fontSize: 12,
        marginTop: -12,
        marginBottom: 12,
        marginLeft: 4,
    },
    dropdownScroll: {
        position: "absolute",
        top: 55,
        left: 0,
        right: 0,
        maxHeight: 125,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        zIndex: 1000,
        elevation: 5,
    },
    dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomColor: "#eee", borderBottomWidth: 1 },
    dropdownItemText: { fontSize: 14, color: "#000" },
});
