import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createChatGPTClient } from "./createChatGPTClient";
import {
  ChatGPTClientOptions,
  ChatGPTMessage,
  ChatGPTMessageStatus,
  ChatGPTRole,
} from "./types";

function createId() {
  const randomUUID = globalThis.crypto?.randomUUID;

  if (typeof randomUUID === "function") {
    return randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface UseChatGPTOptions extends ChatGPTClientOptions {
  initialMessages?: ChatGPTMessage[];
}

export function useChatGPT(options: UseChatGPTOptions) {
  const [messages, setMessages] = useState<ChatGPTMessage[]>(
    options.initialMessages ?? []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const client = useMemo(
    () =>
      createChatGPTClient({
        endpoint: options.endpoint,
        headers: options.headers,
      }),
    [options.endpoint, options.headers]
  );

  const updateMessageStatus = useCallback(
    (id: string, status: ChatGPTMessageStatus) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === id ? { ...message, status } : message
        )
      );
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();

      if (!trimmed || isLoading) {
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage: ChatGPTMessage = {
        id: createId(),
        role: ChatGPTRole.User,
        content: trimmed,
        createdAt: Date.now(),
        status: ChatGPTMessageStatus.Sending,
      };

      const nextMessages = [...messagesRef.current, userMessage];

      setMessages(nextMessages);
      setIsLoading(true);
      setError(null);

      try {
        const result = await client.sendMessage({
          messages: nextMessages,
          signal: controller.signal,
        });

        setMessages((current) =>
          current
            .map((message) =>
              message.id === userMessage.id
                ? { ...message, status: ChatGPTMessageStatus.Idle as const }
                : message
            )
            .concat(result.message)
        );
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        const nextError =
          err instanceof Error ? err : new Error("Something went wrong.");

        setError(nextError);
        updateMessageStatus(userMessage.id, ChatGPTMessageStatus.Error);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [client, isLoading, updateMessageStatus]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  const clear = useCallback(() => {
    stop();
    setMessages([]);
    setError(null);
  }, [stop]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    stop,
    clear,
    setMessages,
  };
}