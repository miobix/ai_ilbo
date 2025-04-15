// pages/api/openai-assistant.js
import { OpenAI } from "openai";

export default async function handler(req, res) {
  if (req.method === "POST") {

    const { userInput, characterLimit, subheaderLimit, prompt, examplesId } = req.body;
    const formattedUserInput = `## *제목은 최대 ${characterLimit}자*\n\n## 기사 내용:\n${userInput}`;
   
    try {
      // Initialize OpenAI client with your Assistant API key
      const client = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPEN_AI_YN_API_KEY,
      });
      console.log(formattedUserInput)

      // Create a new thread
      const thread = await client.beta.threads.create();
      // Add a message to the thread
      const message = await client.beta.threads.messages.create(
        thread.id,
        {
          role: "user",
          content: formattedUserInput ,
        }
      );
      // Run the assistant on the thread
      const run = await client.beta.threads.runs.create(
        thread.id,
        {
          assistant_id: process.env.NEXT_PUBLIC_OPEN_AI_ASSISTANT_ID,
        }
      );
      // Wait for the run to complete
      const completedRun = await waitForRunCompletion(client, thread.id, run.id);
      if (completedRun.status === "completed") {
        // Retrieve messages added after the user's message
        const messages = await client.beta.threads.messages.list(
          thread.id,
          { order: "asc", after: message.id }
        );
        
        // Get the assistant's response
        const assistantMessages = messages.data.filter(msg => msg.role === "assistant");
        let responseContent = "";
        
        if (assistantMessages.length > 0) {
          // Extract text content from the assistant's message
          responseContent = assistantMessages[0].content
            .filter(content => content.type === "text")
            .map(content => content.text.value)
            .join("\n");
        }
        
        // Process the response to match your existing format
        const processedResponse = {
          choices: [
            {
              message: {
                content: responseContent
              }
            }
          ],
          usage: {
            // You won't get token usage from Assistants API,
            // but you can include placeholder values if needed
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          }
        };
        
        res.status(200).json(processedResponse);
      } else {
        res.status(500).json({ error: `Run ended with status: ${completedRun.status}` });
      }
    } catch (error) {
      console.error("API call error:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

// Helper function to wait for run completion
async function waitForRunCompletion(client, threadId, runId) {
  let run;
  do {
    run = await client.beta.threads.runs.retrieve(threadId, runId);
    
    if (run.status === "queued" || run.status === "in_progress") {
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } while (run.status === "queued" || run.status === "in_progress");
  
  return run;
}