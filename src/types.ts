export enum ChatGPTRole {
    User = "user",
    Assistant = "assistant",
}

export enum ChatGPTMessageStatus {
    Idle = "idle",
    Sending = "sending",
    Error = "error",
}

export interface ChatGPTMessage {
  id: string;
  role: ChatGPTRole;
  content: string;
  createdAt: number;
  status?: ChatGPTMessageStatus;
}

export interface ChatGPTClientOptions {
  endpoint: string;
  headers?: Record<string, string>;
}

export interface SendChatGPTMessageInput {
  messages: ChatGPTMessage[];
  signal?: AbortSignal;
}

export interface SendChatGPTMessageResult {
  message: ChatGPTMessage;
}

export interface ChatGPTServerResponse {
  id?: string;
  content?: string;
  message?: {
    id?: string;
    role?: ChatGPTRole;
    content?: string;
  };
}