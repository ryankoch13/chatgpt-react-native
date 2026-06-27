## Environment configuration

This package does not require or depend on any environment variable library.

Pass your backend endpoint directly into `ChatGPTView` or `useChatGPT`. The endpoint can come from a config file, remote config, build-time variables, or any other strategy your app prefers.

Do **not** store your OpenAI API key in your React Native app. Keep the OpenAI key on your backend only.

### Example usage

import { SafeAreaProvider } from "react-native-safe-area-context";
import { ChatGPTView } from "@ryankoch/chatgpt-react-native";

import { chatGPTConfig } from "./src/config/chatgpt";

export default function App() {
  return (
    <SafeAreaProvider>
      <ChatGPTView
        endpoint={chatGPTConfig.endpoint}
        title="AI Assistant"
      />
    </SafeAreaProvider>
  );
}

### Example config

This file should live in the consuming React Native app, not inside the library package.

// src/config/chatgpt.ts

import { Platform } from "react-native";

const LOCAL_ENDPOINT =
  Platform.OS === "android"
    ? "http://10.0.2.2:3001/api/chatgpt"
    : "http://localhost:3001/api/chatgpt";

const PROD_ENDPOINT = "https://api.yourdomain.com/api/chatgpt";

export const chatGPTConfig = {
  endpoint: __DEV__ ? LOCAL_ENDPOINT : PROD_ENDPOINT,
};

For a physical device, `localhost` usually will not work. Use your machine’s local network IP address, a tunnel, or a deployed backend instead.
