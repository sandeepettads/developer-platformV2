import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function analyzeCode(code: string, question: string): Promise<string> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    return "Error: OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert code analyzer. Analyze the provided code and answer questions about it clearly and concisely."
        },
        {
          role: "user",
          content: `Code:\n${code}\n\nQuestion: ${question}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    return response.choices[0].message.content || "No analysis available";
  } catch (error) {
    console.error('Code analysis error:', error);
    return "Failed to analyze code. Please try again.";
  }
}