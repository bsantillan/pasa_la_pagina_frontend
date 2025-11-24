import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

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

    multiline?: boolean;
    minHeight?: number;
    maxHeight?: number;

    returnKeyType?: "done" | "next" | "go" | "search" | "send";
    onSubmitEditing?: () => void;
    blurOnSubmit?: boolean;
    inputRef?: React.RefObject<TextInput | null>;
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
    multiline = false,
    minHeight = 50,
    maxHeight = 200,

    returnKeyType = "done",
    onSubmitEditing,
    blurOnSubmit = true,
    inputRef,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [inputHeight, setInputHeight] = useState(minHeight);

    const isPassword = secureTextEntry;
    const hasError = showErrors && !value?.trim();

    return (
        <View style={style}>
            <View
                style={[
                    styles.container,
                    hasError && styles.inputError,
                    multiline && {
                        height: inputHeight,
                        paddingVertical: 10,
                        alignItems: "flex-start",
                    },
                ]}
            >
                <TextInput
                    ref={inputRef}
                    style={[
                        styles.input,
                        { flex: 1 },
                        multiline && { textAlignVertical: "top" },
                    ]}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isPassword && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    placeholderTextColor={hasError ? "#ff6b6b" : "#999"}
                    multiline={multiline}
                    onContentSizeChange={(e) => {
                        if (multiline) {
                            const height = e.nativeEvent.contentSize.height;
                            setInputHeight(Math.min(Math.max(minHeight, height), maxHeight));
                        }
                    }}

                    // 👉 NUEVO
                    returnKeyType={returnKeyType}
                    onSubmitEditing={onSubmitEditing}
                    blurOnSubmit={blurOnSubmit}
                />
            </View>

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