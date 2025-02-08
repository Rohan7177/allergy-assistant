// pages/api/chatv2.js

import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Set headers for Server-Sent Events (SSE)
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  try {
    const { message } = req.body;

    // Prepare the messages payload with a system message that simulates your custom assistant
    const messagesPayload = [
      {
        role: "system",
        content:
          "You are a knowledgeable allergy assistant with the expertise corresponding to assistant ID asst_SUyfOxIhdZTF3hfcl7StTfWI. Provide detailed, friendly, and helpful responses.",
      },
      {
        role: "user",
        content: message,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messagesPayload,
      stream: true,
    },
      { responseType: "stream" }
    );

    for await (const part of completion) {
      const contentline = part.choices[0].delta;
      const content = contentline.content;
      if (content) {
        res.write(`data: ${content}\n\n`);
      }
      //console.log(contentline);
    }
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  } catch (error) {
    console.error("Error in chat handler:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
