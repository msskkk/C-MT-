import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.aisuper.tools",
  appName: "AI Super App",
  webDir: "out",
  server: {
    // Production: load from Vercel deployment
    // Change this to your actual Vercel URL
    url: "https://mt-2sby.vercel.app",
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#6366f1",
      showSpinner: false,
      launchFadeOutDuration: 500,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#6366f1",
    },
  },
  ios: {
    scheme: "AI Super App",
    contentInset: "automatic",
    preferredContentMode: "mobile",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#6366f1",
  },
};

export default config;
