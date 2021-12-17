import React from "react";
import { View, Text } from "react-native";

export default function Header() {
  return (
    <View
      style={{
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: "white",
          fontFamily: "Ubuntu-Bold",
        }}
      >
        Insights
      </Text>
    </View>
  );
}
