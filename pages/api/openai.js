// pages/api/openai.js
import fetch from "node-fetch"; // Make sure to install node-fetch if needed (npm install node-fetch)
import { newsData } from '../../src/app/utils/constants';

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userInput, characterLimit, subheaderLimit } = req.body;

    let articlesLimit = 500

    let examples = newsData
    //.sort((a, b) => new Date(b.newsdate) - new Date(a.newsdate))  // Sort by newsdate, most recent first
    .slice(0, articlesLimit);  // Take only the first 30 items

    //console.log(examples)

    const systemPrompt = `
    당신은 한국의 저명한 신문의 편집장입니다. 당신의 역할은 기사 내용을 정확히 요약하면서도 눈길을 끄는 제목과 소제목을 작성하는 것입니다. 신문의 스타일과 지침을 유지하면서도 창의적이고 매력적인 제목과 소제목을 만들어야 합니다.

    이 예시는 제목과 소제목의 스타일, 길이, 톤을 결정하는 참고 자료이며, 그대로 인용해서는 안 됩니다.

    ### 작업 개요:
    - 각 기사에 대해 **3개의 제목**과 **각 제목에 맞는 3개의 소제목**을 한국어로 작성하십시오.
    - **제목**은 25자에 최대한 가깝도록 강렬하게 작성해야 하며, 21자에서 29자 사이의 길이를 유지해야 합니다.
    - **소제목**은 최대 22자의 길이로 작성되어야 하며, 지면에서 한줄에 11자씩 들어가므로, 11자 단위로 끊었을 때 어색하지 않도록 작성되어야 합니다. 
    - **글자 수 제한을 충족하지 못할 경우 수정하여 다시 출력하십시오.** 원하는 기준을 충족할 때까지 반복해야 합니다.
    - 제목과 소제목은 제공된 예시의 스타일을 반영해야 하며, 제목에서 사용된 단어는 소제목에서 절대 사용되어서는 안 됩니다. 

    ### 형식:
    1. 한국어로 작성하십시오.
    2. 각 제목과 **소제목(2줄 구성)**은 &&로 구분합니다.
    3. 각 제목-소제목 세트는 ##로 구분합니다.
    4. **줄바꿈 없이 하나의 문자열로 출력해야 합니다.**

    예시 형식:
    제목1&&소제목1-1&&소제목1-2##제목2&&소제목2-1&&소제목2-2##제목3&&소제목3-1&&소제목3-2

    ### 작성 지침:
    **[제목 작성 기준]**
    1. 기사로부터 6하원칙에 따른 1-2개의 문장을 뽑고, 이를 위주로 제목을 작성해줘.
    2. 인터뷰 기사의 경우에는 인터뷰 대상의 실명과 실명 옆에 쌍따옴표를 써서 인터뷰의 주요 내용을 한 문장으로 기재하는 방식으로 제목을 작성해줘. 
    3. 숫자, 질문, 강한 동사, 대비되는 표현 등을 사용하여 관심을 유도하십시오.
    4. 제목은 기사의 첫 번째 단락 내용을 요약하여 작성하십시오. 
    6. 기사 내용에 활용할 수 있는 구체적인 숫자가 있다면, 해당 숫자를 제목에 반영해줘.
    7. 제목에서는 "다"로 끝나는 표현 사용 가능.
    8. '앞산 겨울 정원'처럼 기사 내용 중 명사에 따옴표가 붙은 경우 제목에도 반영.

    **[소제목 작성 기준]**
    1. 제목에 사용된 단어는 소제목에서 절대 사용되지 않아야 합니다.
    2. 자주 검색되는 키워드를 적극 활용하십시오.
    3. 숫자와 확신 있는 표현을 사용하여 명확성을 높이십시오.
    4. 소제목은 기사의 두 번째 단락 내용을 요약하여 작성하십시오.
    5. 신문에서 한줄이 15자인데, 반드시 두 줄에 맞도록 소제목 뽑아줘.
    6. 제목 뽑을 때 기사 관련 주요 이벤트가 실행되는 구체적인 날짜를 확인해서 소제목에 몇월 며칠과 같은 방식으로 반영해 주세요.
    7. <br> 등의 명시적인 텍스트 마크업을 무시하십시오.
    8. 소제목은 반드시 최대 17자씩 두 줄(총 34자)로 작성
    9. 소제목의 첫째줄과 둘째줄은 글자 수 동일하게 작성
    10. 소제목에서는 "다"로 끝나는 표현 사용 금지
    11. 불필요한 말줄임표(…) 사용 금지 유지

    ### 예시 응답 형식:
    "국제 원유 가격 급등&&경기 침체 우려 확산&&유가 상승 지속 전망##물가 상승 경고등&&소비 위축 가속화&&경제 불안 심화##공급망 혼란 지속&&기업 원가 부담 증가&&가격 인상 불가피"

    응답에는 각 기사에 대한 3개의 제목과 3개의 소제목이 위의 형식에 맞춰 포함되어야 하며, 추가적인 설명이나 번호는 필요하지 않습니다.
    구분 기호(&& 및 ##)를 반드시 준수하십시오.
    
  ### 다음은 이전에 신문에 실린 기사 제목의 예시입니다:
     You are provided with ${articlesLimit} examples of previous articles here: 
    ${examples.map(item => ` Initial Title: ${item.newstitle}, Subtitle: ${item.subtitle}, Issued Date: ${item.newsdate}`)}.

    `;
    
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
      console.log(data.choices[0].message.content)

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
