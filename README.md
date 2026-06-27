## Environment configuration

This package does not require or depend on any environment variable library.

Pass your backend endpoint directly into `ChatGPTView` or `useChatGPT`.

import { ChatGPTView } from "@ryankoch/chatgpt-react-native";
import { chatGPTConfig } from "./src/config/chatgpt";

export default function App() {
  return <ChatGPTView endpoint={chatGPTConfig.endpoint} />;
}

Example config --
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