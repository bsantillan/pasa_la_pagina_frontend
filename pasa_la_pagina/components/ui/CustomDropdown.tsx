import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Option<T extends string | boolean> {
    label: string;
    value: T;
}

interface CustomDropdownProps<T extends string | boolean> {
    value: T | undefined;
    onValueChange: (val: T) => void;
    options: Option<T>[];
    placeholder?: string;
    showErrors?: boolean;
    errorMessage?: string;
}

export function CustomDropdown<T extends string | boolean>({
    value,
    onValueChange,
    options,
    placeholder = "Seleccionar...",
    showErrors = false,
    errorMessage = "Este campo es obligatorio",
}: CustomDropdownProps<T>) {
    const [open, setOpen] = useState(false);
    const displayValue = options.find((o) => o.value === value)?.label || "";

    return (
        <View
            style={{
                position: "relative",
                zIndex: open ? 9999 : 1,     // 🔥 aparece arriba de todo
                elevation: open ? 9999 : 1, // 🔥 necesario en Android
                overflow: "visible",
            }}
        >
            <TouchableOpacity
                onPress={() => setOpen(!open)}
                style={[
                    styles.input,
                    showErrors && value === undefined && styles.inputError,
                ]}
            >
                <Text style={{ color: displayValue ? Colors.text : "#999" }}>
                    {displayValue || placeholder}
                </Text>

                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={Colors.text}
                    style={{
                        transform: [{ rotate: open ? "180deg" : "0deg" }],
                    }}
                />
            </TouchableOpacity>

            {showErrors && value === undefined && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            {open && options.length > 0 && (
                <ScrollView
                    style={styles.dropdownScroll}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                >
                    {options.map((opt) => (
                        <TouchableOpacity
                            key={String(opt.value)}
                            onPress={() => {
                                onValueChange(opt.value);
                                setOpen(false);
                            }}
                            style={styles.dropdownItem}
                        >
                            <Text style={styles.dropdownItemText}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 20,
        borderColor: Colors.text,
        marginBottom: 16,
        backgroundColor: Colors.background,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    inputError: {
        borderColor: "#ff4444",
        borderWidth: 2,
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
        maxHeight: 150,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        zIndex: 1000,
        elevation: 5,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomColor: "#eee",
        borderBottomWidth: 1,
    },
    dropdownItemText: {
        fontSize: 14,
        color: Colors.text,
    },
});
