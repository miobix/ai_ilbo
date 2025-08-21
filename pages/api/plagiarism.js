// pages/api/plagiarism.js (for Pages Router)
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reporterText, pressReleaseText } = req.body;

    if (!reporterText || !pressReleaseText) {
      return res.status(400).json({ message: 'Both texts are required' });
    }

    const prompt = `다음은 기사 내용과 비교 원본(보도자료 등)입니다. 영남일보 자체기사 기준에 따라 분석해 주세요.

[기사 내용]
${reporterText}

[비교 원본]
${pressReleaseText}

[분석 요청사항]
1. 기사 내용과 원본의 텍스트 유사도를 정확하게 비교하여 표절률을 정밀하게 산출해 주세요. 임의의 수치를 주지 마십시오.
2. 아래 자체기사 기준의 모든 항목을 기자 기사에 엄격히 적용하여 판정해 주세요.
3. 자체기사로 판정되려면 모든 기준을 통과해야 합니다. 미통과한 기준별로 구체적인 개선 제안을 제시해 주세요.
4. 자체기사 여부 판정은 기자 기사에 한정하며, 원본에는 적용하지 마십시오.

[출력 형식]
표절률: [정확한 숫자]%
판정: 자체기사 / 비자체기사
이유: [2~3줄로 명확하게 설명]

##개선제안##  
1. [미통과 기준 1에 대한 구체적인 제안]  
2. [미통과 기준 2에 대한 구체적인 제안]  
3. [미통과 기준 3에 대한 구체적인 제안]  

[판정 기준]  
- 기자가 직접 기획·취재(현장, 전화, 인터뷰 등)한 내용이 포함되어 있는가?  
- 단순 보도자료, 판결문, 타사 기사 그대로 전재한 것이 아닌가?  
- 기사 내용의 절반 이상이 기자의 해석, 분석, 비교, 전망 등으로 구성되어 있는가?  
- 지역성(대구·경북 데이터, 인물, 기관, 현장성)이 뚜렷한가?  
- 원본과의 직접적인 복사나 최소한의 수정만 있는가?  

위 요건과 원본 비교를 종합하여 판정하세요.`;

    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4o",
    //   messages: [
    //     {
    //       role: "system",
    //       content: "당신은 영남일보의 편집 전문가입니다. 기사의 독창성과 자체기사 여부를 정확하게 판단하고 건설적인 피드백을 제공합니다."
    //     },
    //     {
    //       role: "user",
    //       content: prompt
    //     }
    //   ],
    //   max_tokens: 1000,
    //   temperature: 0.3,
    // });

    // res.status(200).json({
    //   choices: completion.choices,
    //   usage: completion.usage
    // });


// GPT 5 try

const result = await openai.responses.create({
  model: "gpt-5",
  input: [
    {
      role: "system",
      content: "당신은 영남일보의 편집 전문가입니다. 기사의 독창성과 자체기사 여부를 정확하게 판단하고 건설적인 피드백을 제공합니다."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  reasoning: { effort: "low" },
  text: { verbosity: "low" },
});

res.status(200).json({
  text: result.output_text,
  raw: result
});



  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}