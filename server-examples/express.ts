import cors from "cors";
import express from "express";
import OpenAI from "openai";

import { ChatGPTRole } from "../src/types";

interface ClientChatMessage {
  role: ChatGPTRole;
  content: string;
}

interface ChatRequestBody {
  messages?: ClientChatMessage[];
}

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

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

app.post("/api/chatgpt", async (req, res) => {
  try {
    const body = req.body as ChatRequestBody;

    if (!Array.isArray(body.messages)) {
      return res.status(400).json({
        error: "Expected body.messages to be an array.",
      });
    }

    const safeMessages = body.messages
      .filter(isValidChatMessage)
      .map((message) => ({
        role: message.role,
        content: message.content.trim(),
      }))
      .filter((message) => message.content.length > 0)
      .slice(-20);

    if (safeMessages.length === 0) {
      return res.status(400).json({
        error: "At least one valid message is required.",
      });
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.5",
      instructions:
        "You are a helpful assistant embedded in a React Native application.",
      input: toOpenAIInput(safeMessages),
    });

    return res.json({
      id: response.id,
      content: response.output_text,
    });
  } catch (error) {
    console.error("[chatgpt-api-error]", error);

    return res.status(500).json({
      error: "Failed to generate a response.",
    });
  }
});

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`ChatGPT API server running on port ${port}`);
});