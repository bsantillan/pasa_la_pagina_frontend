import React from "react";
import { StyleSheet, Text, View } from "react-native";

type MessageBubbleProps = {
  text: string;
  time: string;
  isOwnMessage?: boolean; // ✅ nueva prop
};

export const MessageCard: React.FC<MessageBubbleProps> = ({
  text,
  time,
  isOwnMessage = false,
}) => {
  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.rightAlign : styles.leftAlign,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.myBubble : styles.otherBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isOwnMessage && styles.myMessageText,
          ]}
        >
          {text}
        </Text>
        <View style={styles.infoContainer}>
          <Text
            style={[
              styles.time,
              isOwnMessage && styles.myTime,
            ]}
          >
            {time}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    marginHorizontal: 12,
  },
  leftAlign: {
    alignItems: "flex-start",
  },
  rightAlign: {
    alignItems: "flex-end",
  },
  bubble: {
    borderWidth: 0.5,
    borderColor: "#B5CADD",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    maxWidth: "80%",
  },
  myBubble: {
    backgroundColor: "#DCF8C6", // verde claro (como WhatsApp)
  },
  otherBubble: {
    backgroundColor: "#FFFFFF",
  },
  messageText: {
    fontFamily: "SF Pro Text",
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.4,
    color: "#000000",
  },
  myMessageText: {
    color: "#000000",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontFamily: "SF Pro Text",
    fontStyle: "italic",
    fontSize: 11,
    lineHeight: 13,
    color: "#999",
  },
  myTime: {
    color: "#2DA430",
  },
});
