import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChatGPT } from "./useChatGPT";
import { ChatGPTMessageStatus, ChatGPTRole, type ChatGPTMessage } from "./types";

export interface ChatGPTViewTheme {
  backgroundColor?: string;
  headerBackgroundColor?: string;
  borderColor?: string;
  userBubbleColor?: string;
  assistantBubbleColor?: string;
  userTextColor?: string;
  assistantTextColor?: string;
  inputBackgroundColor?: string;
  inputTextColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  errorColor?: string;
}

export interface ChatGPTViewProps {
  endpoint: string;
  title?: string;
  placeholder?: string;
  initialMessages?: ChatGPTMessage[];
  headers?: Record<string, string>;
  theme?: ChatGPTViewTheme;
  style?: StyleProp<ViewStyle>;
  renderMessage?: (message: ChatGPTMessage) => React.ReactElement;
  onError?: (error: Error) => void;
}

export function ChatGPTView({
  endpoint,
  title = "ChatGPT",
  placeholder = "Type a message...",
  initialMessages,
  headers,
  theme,
  style,
  renderMessage,
  onError,
}: ChatGPTViewProps) {
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList<ChatGPTMessage>>(null);

  const { messages, isLoading, error, sendMessage, stop, clear } = useChatGPT({
    endpoint,
    headers,
    initialMessages,
  });

  async function handleSend() {
    const text = input.trim();

    if (!text) {
      return;
    }

    setInput("");

    try {
      await sendMessage(text);
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    } catch (err) {
      if (err instanceof Error) {
        onError?.(err);
      }
    }
  }

  function defaultRenderMessage({ item }: { item: ChatGPTMessage }) {
    const isUser = item.role === ChatGPTRole.User;

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.assistantMessageRow,
        ]}
      >
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isUser
                ? theme?.userBubbleColor ?? "#111827"
                : theme?.assistantBubbleColor ?? "#F3F4F6",
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isUser
                  ? theme?.userTextColor ?? "#FFFFFF"
                  : theme?.assistantTextColor ?? "#111827",
              },
            ]}
          >
            {item.content}
          </Text>

          {item.status === ChatGPTMessageStatus.Sending ? (
            <Text
              style={[
                styles.statusText,
                {
                  color: isUser
                    ? theme?.userTextColor ?? "#FFFFFF"
                    : theme?.assistantTextColor ?? "#111827",
                },
              ]}
            >
              Sending...
            </Text>
          ) : null}

          {item.status === ChatGPTMessageStatus.Error ? (
            <Text style={[styles.statusText, { color: theme?.errorColor ?? "#DC2626" }]}>
              Failed to send
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme?.backgroundColor ?? "#FFFFFF" },
        style,
      ]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme?.headerBackgroundColor ?? "#FFFFFF",
              borderBottomColor: theme?.borderColor ?? "#E5E7EB",
            },
          ]}
        >
          <Text style={styles.title}>{title}</Text>

          <Pressable onPress={clear} hitSlop={8}>
            <Text style={styles.headerButton}>Clear</Text>
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={(info) =>
            renderMessage ? renderMessage(info.item) : defaultRenderMessage(info)
          }
          contentContainerStyle={styles.messageList}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            listRef.current?.scrollToEnd({ animated: true });
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Ask a question to get started.</Text>
            </View>
          }
        />

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme?.errorColor ?? "#DC2626" }]}>
              {error.message}
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.inputRow,
            {
              borderTopColor: theme?.borderColor ?? "#E5E7EB",
            },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            style={[
              styles.input,
              {
                backgroundColor: theme?.inputBackgroundColor ?? "#F9FAFB",
                color: theme?.inputTextColor ?? "#111827",
                borderColor: theme?.borderColor ?? "#E5E7EB",
              },
            ]}
            editable={!isLoading}
          />

          <Pressable
            onPress={isLoading ? stop : handleSend}
            style={[
              styles.sendButton,
              {
                backgroundColor: theme?.buttonColor ?? "#111827",
                opacity: input.trim() || isLoading ? 1 : 0.5,
              },
            ]}
            disabled={!input.trim() && !isLoading}
          >
            <Text
              style={[
                styles.sendButtonText,
                {
                  color: theme?.buttonTextColor ?? "#FFFFFF",
                },
              ]}
            >
              {isLoading ? "Stop" : "Send"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    minHeight: 56,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  headerButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  messageList: {
    flexGrow: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    color: "#6B7280",
    textAlign: "center",
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: "row",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  assistantMessageRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  statusText: {
    marginTop: 4,
    fontSize: 11,
    opacity: 0.75,
  },
  errorContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  errorText: {
    fontSize: 13,
  },
  inputRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 21,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 11 : 8,
    fontSize: 15,
  },
  sendButton: {
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    fontWeight: "700",
  },
});