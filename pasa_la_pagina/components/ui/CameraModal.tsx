import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "./Boton/Primary";

export default function CameraModal({ visible, onClose, onPhotoTaken }: {
    visible: boolean;
    onClose: () => void;
    onPhotoTaken: (uri: string) => void;
}) {
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraRef, setCameraRef] = useState<any>(null);

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>No hay permisos de cámara</Text>
                <PrimaryButton title="Dar permisos" onPress={requestPermission} />
            </View>
        );
    }

    const handleTakePhoto = async () => {
        if (cameraRef) {
            const photo = await cameraRef.takePictureAsync({ quality: 0.7 });
            onPhotoTaken(photo.uri);
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide">
            <View style={{ flex: 1 }}>
                <CameraView
                    ref={setCameraRef}
                    style={{ flex: 1 }}
                    facing="back"
                />
                <View style={styles.cameraButtons}>
                    <PrimaryButton title="Tomar foto" onPress={handleTakePhoto} styleBtn={styles.btn} />
                    <PrimaryButton title="Cerrar" onPress={onClose} styleBtn={styles.btn} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    cameraButtons: {
        position: "absolute",
        bottom: 30,
        left: 16,
        right: 16,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    btn: {
        flex: 1,
        marginHorizontal: 4,
    },
});
