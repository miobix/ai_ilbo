// pages/api/openai.js
import fetch from "node-fetch"; // Make sure to install node-fetch if needed (npm install node-fetch)
import { newsData } from '../../src/app/utils/constants';
import { google } from "googleapis";
import { readFileSync } from "fs";


export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userInput, characterLimit, subheaderLimit, prompt } = req.body;
    let sheetsSystemPrompt = prompt[0]
    let sheetsUserPrompt = prompt[1]
    let articlesLimit = 1050

    let examples = newsData
    //.sort((a, b) => new Date(b.newsdate) - new Date(a.newsdate))  // Sort by newsdate, most recent first
    .slice(0, articlesLimit);  // Take only the first 30 items

    //console.log(examples)

    const systemPrompt = `${sheetsSystemPrompt}
     You are provided with ${articlesLimit} examples of previous articles here: 
    ${examples.map(item => ` Initial Title: ${item.newstitle}, Subtitle: ${item.subtitle}, Issued Date: ${item.newsdate}`)}.`;
    
    const userPrompt = `${sheetsUserPrompt}: ${userInput}`;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPEN_AI_API}`, 
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
          ],
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        res.status(500).json({ error: data.error.message });
      } else {
        res.status(200).json(data);
      }
    } catch (error) {
      console.error("API call error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

//
