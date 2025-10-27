import { Publicacion } from "@/contexts/PublicacionContext";
import React from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    View
} from "react-native";
import { ProductCard } from "./ProductCard";

type Props = {
  publicaciones: Publicacion[];
  onSelect?: (pub: Publicacion) => void;
};

export const PublicacionCarousel: React.FC<Props> = ({
  publicaciones,
  onSelect,
}) => {
  return (
    <FlatList
      data={publicaciones}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [
            styles.cardWrapper,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
          onPress={() => onSelect && onSelect(item)}
        >
          <View style={styles.cardWrapper}>
            <ProductCard
              imageUrl={item.fotos_url?.[0]}
              title={item.titulo}
              description={item.descripcion}
            />
          </View>
        </Pressable>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { paddingLeft: 16 },
  cardWrapper: {
    width: 248, // debe coincidir con el ancho de ProductCard
    marginRight: 16,
  },
});
