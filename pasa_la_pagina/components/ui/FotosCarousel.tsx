import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  fotos: string[];
};

const screenWidth = Dimensions.get("window").width;

export const FotoCarousel: React.FC<Props> = ({ fotos }) => {
  const [indexActivo, setIndexActivo] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    setIndexActivo(index);
  };

  const abrirModal = (foto: string) => {
    setFotoSeleccionada(foto);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setFotoSeleccionada(null);
  };

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={fotos}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ width: screenWidth }}
        contentContainerStyle={{ width: screenWidth * fotos.length }}
        renderItem={({ item }) => (
          <View style={{ width: screenWidth }}>

            <View style={styles.imageContainer}>

              <TouchableOpacity
                style={styles.likeWrapper}
                onPress={() => setLiked(!liked)}
                activeOpacity={0.8}
              >
                <View style={styles.likeCircle} />
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={28}
                  color={liked ? Colors.primary : Colors.primary}
                  style={styles.heartIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.9} onPress={() => abrirModal(item)}>
                <Image source={{ uri: item }} style={styles.image} />
              </TouchableOpacity>
            </View>

          </View>
        )}
      />

      <View style={styles.dotsContainer}>
        {fotos.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: indexActivo === i
                  ? Colors.primary
                  : Colors.disabled_primary
              }
            ]}
          />
        ))}
      </View>

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
  wrapper: {
    width: "100%",
    alignItems: "center",
    overflow: "hidden",
  },
  imageContainer: {
    width: "90%",               
    alignSelf: "center",       
    height: screenWidth * 0.85,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",      
  },
  image: {
    width: "100%",
    height: "100%",
  },
  likeWrapper: {
    position: "absolute",
    right: 10,                 
    top: 10,
    zIndex: 30,
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  likeCircle: {
    width: 38,
    height: 38,
    backgroundColor: Colors.white,
    borderRadius: 19,
    position: "absolute",
  },
  heartIcon: {
    position: "absolute",
  },
  dotsContainer: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: { width: "90%", height: "70%" },
});
