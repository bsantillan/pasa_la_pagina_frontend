import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors"; // ajustá el path según tu proyecto

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = SCREEN_WIDTH - 32;
const ITEM_SPACING = 12;

type Props = {
  fotos: string[];
  showFavorite?: boolean;
  initialFavorite?: boolean;
  onFavoriteChange?: (isFavorite: boolean) => void;
};

const ITEM_HEIGHT = ITEM_WIDTH * 1.33;


export const FotoCarousel: React.FC<Props> = ({
  fotos,
  showFavorite = false,
  initialFavorite = false,
  onFavoriteChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const flatListRef = useRef<FlatList>(null);

  const handleFavoritePress = () => {
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    onFavoriteChange?.(newValue);
  };

  const abrirModal = (foto: string) => {
    setFotoSeleccionada(foto);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setFotoSeleccionada(null);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (ITEM_WIDTH + ITEM_SPACING));
    setActiveIndex(index);
  };

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={fotos}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.container}
        onScroll={onScroll}
        scrollEventThrottle={16}
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

      {showFavorite && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={Colors.primary}
          />
        </TouchableOpacity>
      )}


      {/* Dot Indicators */}
      <View style={styles.dotsContainer}>
        {fotos.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToSlide(index)}
            style={[
              styles.dot,
              index === activeIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <Modal
        visible={modalVisible}
        transparent
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
  carouselContainer: {
    position: "relative",
  },
  container: { paddingHorizontal: 16 },
  cardWrapper: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginRight: ITEM_SPACING,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 28,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  }

});