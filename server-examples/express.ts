import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { Config } from "react-native-config";
import { ChatGPTRole } from "../src/types";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const openai = new OpenAI({
  apiKey: Config.OPENAI_API_KEY,
});

app.post("/api/chatgpt", async (req, res) => {
  try {
    const { messages } = req.body as {
      messages: Array<{
        role: ChatGPTRole.User | ChatGPTRole.Assistant;
        content: string;
      }>;
    };

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "messages must be an array",
      });
    }

    const safeMessages = messages
      .filter(
        (message) =>
          (message.role === ChatGPTRole.User || message.role === ChatGPTRole.Assistant) &&
          typeof message.content === "string"
      )
      .slice(-20);

    const response = await openai.responses.create({
      model: Config.OPENAI_MODEL ?? "gpt-5.2",
      instructions:
        "You are a helpful assistant embedded in a React Native application.",
      input: safeMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    return res.json({
      id: response.id,
      content: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to generate a response.",
    });
  }
});

app.listen(3001, () => {
  console.log("ChatGPT API server running on port 3001");
});