import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePromptSuggestion(context?: string): Promise<string> {
  try {
    const prompt = context
      ? `Generate a thoughtful prompt for a time capsule message. Context: ${context}. Keep it brief and inspiring.`
      : 'Generate a thoughtful prompt for a time capsule message. Keep it brief and inspiring.';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates thoughtful prompts for time capsule messages. Keep suggestions brief, personal, and inspiring.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content || 'What do you want your future self to know?';
  } catch (error) {
    console.error('Error generating prompt suggestion:', error);
    return 'What do you want your future self to know?';
  }
}

export async function suggestDeliveryDate(
  content: string,
  title: string
): Promise<{ suggestedDate: Date; reasoning: string }> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI that analyzes time capsule content and suggests optimal delivery dates. Consider:
- Content themes (goals, memories, emotions)
- Natural time horizons (3 months for short-term goals, 1 year for annual reflection, 5 years for major life milestones)
- Seasonal relevance
- Personal growth timelines

Respond with a JSON object: { "months": <number>, "reasoning": "<brief explanation>" }`,
        },
        {
          role: 'user',
          content: `Title: ${title}\n\nContent: ${content}\n\nSuggest when this capsule should be delivered.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const months = response.months || 12;
    const reasoning = response.reasoning || 'Suggested based on content analysis';

    const suggestedDate = new Date();
    suggestedDate.setMonth(suggestedDate.getMonth() + months);

    return { suggestedDate, reasoning };
  } catch (error) {
    console.error('Error suggesting delivery date:', error);
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() + 1);
    return {
      suggestedDate: defaultDate,
      reasoning: 'Default 1-year delivery suggested',
    };
  }
}

export async function generateReflectionSummary(
  originalContent: string,
  title: string,
  createdAt: Date,
  deliveredAt: Date
): Promise<string> {
  try {
    const timeElapsed = Math.floor(
      (deliveredAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const timeUnit = timeElapsed >= 12 ? `${Math.floor(timeElapsed / 12)} year(s)` : `${timeElapsed} month(s)`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a reflective AI assistant that creates thoughtful summaries for time capsule deliveries. 
Analyze the original message and create a brief, warm reflection on what the past self wanted to communicate. 
Keep it personal, encouraging, and thought-provoking. Maximum 3 sentences.`,
        },
        {
          role: 'user',
          content: `This time capsule was created ${timeUnit} ago.

Title: ${title}

Original message:
${originalContent}

Generate a reflection summary for the recipient to read alongside their past message.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    return (
      completion.choices[0]?.message?.content ||
      `${timeUnit} ago, you wrote this message to your future self. Take a moment to reflect on how much has changed—and what has stayed the same.`
    );
  } catch (error) {
    console.error('Error generating reflection summary:', error);
    const timeElapsed = Math.floor(
      (deliveredAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const timeUnit = timeElapsed >= 12 ? `${Math.floor(timeElapsed / 12)} year(s)` : `${timeElapsed} month(s)`;
    return `${timeUnit} ago, you wrote this message to your future self. Take a moment to reflect on how much has changed—and what has stayed the same.`;
  }
}

export async function generateWordCloud(capsules: Array<{ content: string }>): Promise<string[]> {
  try {
    const allContent = capsules.map(c => c.content).join('\n\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract the 20 most meaningful words from the text. Exclude common words (the, and, is, etc.). 
Return a JSON array of strings. Focus on themes, emotions, and significant concepts.`,
        },
        { role: 'user', content: allContent.substring(0, 3000) },
      ],
      max_tokens: 150,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || '{"words":[]}');
    return response.words || [];
  } catch (error) {
    console.error('Error generating word cloud:', error);
    return [];
  }
}

export async function analyzeSentiment(content: string): Promise<'positive' | 'neutral' | 'negative'> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of the text. Respond with only: positive, neutral, or negative',
        },
        { role: 'user', content: content.substring(0, 1000) },
      ],
      max_tokens: 10,
      temperature: 0.3,
    });

    const sentiment = completion.choices[0]?.message?.content?.trim().toLowerCase();
    if (sentiment === 'positive' || sentiment === 'negative') {
      return sentiment;
    }
    return 'neutral';
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return 'neutral';
  }
}
