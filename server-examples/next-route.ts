import OpenAI from "openai";

import { ChatGPTMessage, ChatGPTRole } from "../src/types";

export const runtime = "nodejs";

interface ClientChatMessage {
  role: ChatGPTRole;
  content: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function isValidChatMessage(message: unknown): message is ClientChatMessage {
  if (!message || typeof message !== "object") {
    return false;
  }

  const maybeMessage = message as Partial<ClientChatMessage>;

  const hasValidRole =
    maybeMessage.role === ChatGPTRole.User ||
    maybeMessage.role === ChatGPTRole.Assistant;

  return hasValidRole && typeof maybeMessage.content === "string";
}

function toOpenAIInput(messages: ClientChatMessage[]) {
  return messages.map((message) => ({
    type: "message" as const,
    role:
      message.role === ChatGPTRole.User
        ? ("user" as const)
        : ("assistant" as const),
    content: message.content,
  }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.messages)) {
      return Response.json(
        {
          error: "Expected body.messages to be an array.",
        },
        {
          status: 400,
        },
      );
    }

    const safeMessages = body.messages
      .filter(isValidChatMessage)
      .map((message: ChatGPTMessage) => ({
        role: message.role,
        content: message.content.trim(),
      }))
      .filter((message: ChatGPTMessage) => message.content.length > 0)
      .slice(-20);

    if (safeMessages.length === 0) {
      return Response.json(
        {
          error: "At least one valid message is required.",
        },
        {
          status: 400,
        },
      );
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.5",
      instructions:
        "You are a helpful assistant embedded in a React Native application.",
      input: toOpenAIInput(safeMessages),
    });

    return Response.json({
      id: response.id,
      content: response.output_text,
    });
  } catch (error) {
    console.error("[chatgpt-api-error]", error);

    return Response.json(
      {
        error: "Failed to generate a response.",
      },
      {
        status: 500,
      },
    );
  }
}
