import fetch from 'node-fetch';

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function getGroqAdvisor({ itemName, category, originCountry, quantity, newsHeadlines }: {
  itemName: string;
  category: string;
  originCountry: string;
  quantity: number;
  newsHeadlines: string[];
}) {
  const prompt = `You are an expert business advisor for small and medium enterprises. Given the following:
- Item: ${itemName}
- Category: ${category}
- Origin Country: ${originCountry}
- Quantity: ${quantity}
- Recent News Headlines: ${newsHeadlines.map(h => `\n  - ${h}`).join('')}

Write an investment thesis for a business owner. Include:
1. Market context and current risks.
2. A forecast for tariffs/prices over the next 3–12 months.
3. A clear recommendation: invest/stock up now, wait, or stagger purchases, with reasoning and confidence.
4. Scenario analysis: what if tariffs rise/fall?
5. Key dates/events to watch.
6. A simple graph (as a list of (date, predicted price/tariff) points).
7. A 2–3 sentence summary for executives.
`;

  const body = {
    model: 'mixtral-8x7b-32768',
    messages: [
      { role: 'system', content: 'You are a helpful business advisor for SMEs.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 700,
    temperature: 0.7
  };

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Groq advisor response');
  }

  const data = await response.json();
  return data.choices[0].message.content;
} 