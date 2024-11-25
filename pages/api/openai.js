// pages/api/openai.js
import fetch from "node-fetch"; // Make sure to install node-fetch if needed (npm install node-fetch)
import { newsData } from '../../src/app/utils/constants';

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userInput, characterLimit, subheaderLimit } = req.body;

    let articlesLimit = 30

    let examples = newsData
    .sort((a, b) => new Date(b.newsdate) - new Date(a.newsdate))  // Sort by newsdate, most recent first
    .slice(0, articlesLimit);  // Take only the first 30 items

    //console.log(examples)

    const systemPrompt = `
    You are a chief editor for a renowned Korean newspaper. Your job is to create eye-catching and relevant titles and subtitles that accurately summarize the central idea of an article. 
    You are provided with ${articlesLimit} examples of previous articles here: 
    ${examples.map(item => `News Text: ${item.news_text}, Subtitle: ${item.subtitle}, Initial Title: ${item.newstitle}, Final Revised Title: ${item.used_title}`)}.

    Some articles also include a corresponding subtitle, but not all of them. These examples are provided for guidance on the writing style of our newspaper and should not be quoted directly in your response.
    
    Please generate a fitting title and subtitle for a new article based on the following criteria:
    1. The title must be strictly **within** the range of ${characterLimit - 4} and ${characterLimit} characters long. 
    2. The subtitle must be strictly **within** the range of ${subheaderLimit - 8} and ${subheaderLimit} characters long.  
    3. The title captures the writing style of our newspaper, as shown on the examples
    4. The subtitle is a soft introduction from the title into the body of the article as it is on printed media    

    ### Guidelines:
    - Titles should be short, compelling, and directly related to the content.
    - Subtitles should summarize the key takeaway from the article.
    - Provide 3 unique title suggestions, separated by '##', and 3 unique subtitle suggestions, separated by '##'.
    - The titles and subtitles should be different from one another, with no repetition of phrasing.
    
    Respond in Korean, and format your response as follows:
    1. Titles first: 3 distinct titles separated by '##'.
    2. Followed by a separator "&&".
    3. Then, provide 3 distinct subtitles, separated by '##'.
    
    Your response should only include the 6 phrases (3 titles and 3 subtitles), with no additional explanation or numbering.
    `;
    
    console.log(systemPrompt)

    const userPrompt = `The target text is as follows: ${userInput}`;

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
