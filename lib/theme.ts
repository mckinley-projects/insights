// Application Colors
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import database from "./database";

export const colors = {
  primary: "#14191f",
};

// Fonts: Ubuntu
export const fonts = {
  primary: "Ubuntu",
};

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();

        // Load fonts
        await Font.loadAsync({
          "Ubuntu-Bold": require("../assets/fonts/Ubuntu-Bold.ttf"),
          "Ubuntu-Light": require("../assets/fonts/Ubuntu-Light.ttf"),
          "Ubuntu-Medium": require("../assets/fonts/Ubuntu-Medium.ttf"),
          "Ubuntu-Regular": require("../assets/fonts/Ubuntu-Regular.ttf"),
        });

        await database.init();
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
