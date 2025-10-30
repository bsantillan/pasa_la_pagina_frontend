import { useIntercambio } from "@/contexts/IntercambioContext";
import { Publicacion } from "@/contexts/PublicacionContext";
import React, { useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, View } from "react-native";
import { AlertCard } from "./AlertaCard";
import PrimaryButton from "./Boton/Primary";
import { ProductCard } from "./ProductCard";

type Props = {
    publicaciones: Publicacion[];
    onSelect?: (pub: Publicacion) => void;
};

export const PublicacionCarousel: React.FC<Props> = ({ publicaciones, onSelect }) => {
    const [visible, setVisible] = useState(false);
    const [selectedPub, setSelectedPub] = useState<Publicacion | null>(null);
    const { solicitarIntercambio, buscarIntercambios, loading } = useIntercambio();

    const abrirModal = (pub: Publicacion) => {
        setSelectedPub(pub);
        setVisible(true);
    };

    const cerrarModal = () => {
        setVisible(false);
        setSelectedPub(null);
    };

    const handleSolicitar = async (publicacionId: number) => {
        try {
            await solicitarIntercambio(publicacionId);
            Alert.alert("Éxito", "Has solicitado el intercambio correctamente");
        } catch (err: any) {
            Alert.alert("Ya enviaste", err.message);
        }
        cerrarModal();
    };

    const cargarIntercambios = async () => {
        try {
            const resultados = await buscarIntercambios();

            console.log("Intercambios encontrados:", resultados);
        } catch (err: any) {
            console.error("Error al buscar intercambios:", err);
        }
    };

    return (
        <>
            <FlatList
                data={publicaciones}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <ProductCard
                            imageUrl={item.fotos_url?.[0]}
                            title={item.titulo}
                            description={item.descripcion}
                        />
                        <PrimaryButton
                            title="Intercambiar"
                            onPress={() => abrirModal(item)}
                        />
                    </View>
                )}
            />

            <Modal
                animationType="fade"
                transparent
                visible={visible}
                onRequestClose={cerrarModal}
            >
                <View style={styles.overlay}>
                    <AlertCard
                        title={`¿Intercambiar "${selectedPub?.titulo}"?`}
                        description="¿Estás seguro de que deseas solicitar este intercambio?"
                        onAccept={() => handleSolicitar(selectedPub!.id)}
                        onCancel={cerrarModal}
                        acceptLabel="Sí, intercambiar"
                        cancelLabel="Cancelar"
                    />
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: { paddingLeft: 16 },
    cardWrapper: {
        width: 248, // debe coincidir con el ancho de ProductCard
        marginRight: 16,

    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
});
