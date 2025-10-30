import React, { useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  fotos: string[];
};

export const FotoCarousel: React.FC<Props> = ({ fotos }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);

  const abrirModal = (foto: string) => {
    setFotoSeleccionada(foto);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setFotoSeleccionada(null);
  };

  return (
    <View>
      <FlatList
        data={fotos}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.cardWrapper,
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
            ]}
            onPress={() => abrirModal(item)}
          >
            <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
          </Pressable>
        )}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <TouchableOpacity style={styles.modalContainer} onPress={cerrarModal}>
          <Image
            source={{ uri: fotoSeleccionada || "" }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingLeft: 16 },
  cardWrapper: {
    width: 300,
    height: 300,
    marginRight: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "90%",
    height: "70%",
  },
});
