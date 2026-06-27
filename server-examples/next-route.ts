import OpenAI from "openai";
import Config from 'react-native-config'

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: Config.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const messages = Array.isArray(body.messages) ? body.messages : [];

    const safeMessages = messages
      .filter(
        (message: any) =>
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string"
      )
      .slice(-20);

    const response = await openai.responses.create({
      model: Config.OPENAI_MODEL ?? "gpt-5.2",
      instructions:
        "You are a helpful assistant embedded in a React Native application.",
      input: safeMessages.map(
        (message: { role: "user" | "assistant"; content: string }) => ({
          role: message.role,
          content: message.content,
        })
      ),
    });

    return Response.json({
      id: response.id,
      content: response.output_text,
    });
  } catch {
    return Response.json(
      {
        error: "Failed to generate a response.",
      },
      {
        status: 500,
      }
    );
  }
}