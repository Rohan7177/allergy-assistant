import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    // Create a new thread
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;

    // Add message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      //assistant_id: "asst_SUyfOxIhdZTF3hfcl7StTfWI",
      assistant_id: "asst_t8CTDyDOzZDkBH7Pgv5LyBSt",
    });

    // Poll for completion
    let runStatus;
    //new code
    const pollInterval = 1000; // Wait 1 second between polls
    const maxWaitTime = 20000; // Maximum wait time of 10 seconds
    const startTime = Date.now();
    //new code
    do {
      //await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      await new Promise((resolve) => setTimeout(resolve, pollInterval)); // Wait poll interval
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

      // new code If the wait time exceeds the max, return a timeout error
            if (Date.now() - startTime > maxWaitTime) {
              return res.status(504).json({ error: "Assistant response timed out." });
            }

    } while (runStatus.status !== "completed");

    // Get assistant messages
    const messages = await openai.beta.threads.messages.list(threadId);
    const assistantResponse = messages.data.find(m => m.role === "assistant");

    res.status(200).json({ response: assistantResponse ? assistantResponse.content[0].text.value : "No response received." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
