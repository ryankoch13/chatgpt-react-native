import { Platform } from "react-native";

const LOCAL_ENDPOINT =
  Platform.OS === "android"
    ? "http://10.0.2.2:3001/api/chatgpt"
    : "http://localhost:3001/api/chatgpt";

const PROD_ENDPOINT = "https://api.yourdomain.com/api/chatgpt";

export const chatGPTConfig = {
  endpoint: __DEV__ ? LOCAL_ENDPOINT : PROD_ENDPOINT,
};
