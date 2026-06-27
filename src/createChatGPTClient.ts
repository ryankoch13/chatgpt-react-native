import {
  ChatGPTMessageStatus,
  ChatGPTRole,
  type ChatGPTClientOptions,
  type ChatGPTMessage,
  type ChatGPTServerResponse,
  type SendChatGPTMessageInput,
  type SendChatGPTMessageResult,
} from "./types";

function createId() {
  const randomUUID = globalThis.crypto?.randomUUID;

  if (typeof randomUUID === "function") {
    return randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createChatGPTClient(options: ChatGPTClientOptions) {
  async function sendMessage(
    input: SendChatGPTMessageInput,
  ): Promise<SendChatGPTMessageResult> {
    const response = await fetch(options.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      body: JSON.stringify({
        messages: input.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      }),
      signal: input.signal,
    });

    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(rawText || `Request failed with ${response.status}`);
    }

    let data: ChatGPTServerResponse;

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      throw new Error("The chat endpoint returned invalid JSON.");
    }

    const content = data.message?.content ?? data.content ?? "";

    return {
      message: {
        id: data.message?.id ?? data.id ?? createId(),
        role: ChatGPTRole.Assistant,
        content,
        createdAt: Date.now(),
        status: ChatGPTMessageStatus.Idle,
      },
    };
  }

  return {
    sendMessage,
  };
}
