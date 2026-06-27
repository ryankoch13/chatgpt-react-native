import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { ChatGPTView } from "@ryankoch13/chatgpt-react-native";
import { chatGPTConfig } from "./src/config/chatgpt";
import { StyleSheet } from "react-native";

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ChatGPTView
        endpoint={chatGPTConfig.endpoint}
        title="AI Assistant"
        placeholder="Ask a question..."
      />
    </SafeAreaProvider>
  );
}