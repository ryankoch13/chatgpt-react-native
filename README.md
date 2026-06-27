About -- 

This project is intended to be a front-end library used within an existing React Native project to allow users to easily integrate ChatGPT functionality into their app. 

Usage --

import { ChatGPTView } from "@ryankoch/chatgpt-react-native";

export default function SupportScreen() {
  return (
    <ChatGPTView
      endpoint="https://your-api.com/api/chatgpt"
      title="Ask ChatGPT"
      placeholder="Ask me anything..."
    />
  );
}