import { Colors } from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface InputFieldProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    iconName?: string; // nombre del icono opcional
    secureTextEntry?: boolean; // para password
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    style?: object;
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
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = secureTextEntry;

    return (
        <View style={[styles.container, style]}>
            {iconName && (
                <MaterialIcons
                    name={iconName as any}
                    size={22}
                    color="#666"
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
                placeholderTextColor="#555"
            />
            {isPassword && (
                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                >
                    <MaterialIcons
                        name={showPassword ? "visibility" : "visibility-off"}
                        size={22}
                        color="#666"
                    />
                </TouchableOpacity>
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
});
