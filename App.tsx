import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import useCachedResources, { colors } from "./lib/theme";
import { Provider as PaperProvider } from "react-native-paper";
import Dashboard from "./lib/dashboard";

export default function App() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <PaperProvider>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: colors.primary,
          }}
        >
          <Dashboard></Dashboard>
          <StatusBar style="light" />
        </SafeAreaView>
      </PaperProvider>
    );
  }
}
