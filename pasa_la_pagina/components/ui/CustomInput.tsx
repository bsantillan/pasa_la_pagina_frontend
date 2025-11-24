import { Colors } from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface InputFieldProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    iconName?: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    style?: object;

    showErrors?: boolean;
    errorMessage?: string;
}

const CustomInput: React.FC<InputFieldProps> = ({
    placeholder,
    value,
    onChangeText,
    iconName,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "none",
    style,
    showErrors = false,
    errorMessage = "Este campo es obligatorio",
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = secureTextEntry;

    const hasError = showErrors && !value?.trim();

    return (
        <View style={style}>
            <View style={[styles.container, hasError && styles.inputError]}>
                {iconName && (
                    <MaterialIcons
                        name={iconName as any}
                        size={22}
                        color={hasError ? "#ff4444" : "#666"}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isPassword && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    placeholderTextColor={hasError ? "#ff6b6b" : "#999"}
                />

                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                    >
                        <MaterialIcons
                            name={showPassword ? "visibility" : "visibility-off"}
                            size={22}
                            color={hasError ? "#ff4444" : "#666"}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* 🔥 TEXTO DE ERROR */}
            {hasError && errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}
        </View>
    );
};

export default CustomInput;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#000000",
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: Colors.background,
        height: 50,
        marginBottom: 15,
    },
    inputError: {
        borderColor: "#ff4444",
        borderWidth: 2,
    },
    input: {
        color: "#000",
        fontSize: 14,
    },
    icon: {
        marginRight: 8,
    },
    eyeButton: {
        paddingHorizontal: 6,
    },
    errorText: {
        color: "#ff4444",
        fontSize: 12,
        marginTop: -10,
        marginBottom: 12,
        marginLeft: 4,
    },
});