import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const { prompt } = await request.json();
    
    const testPrompt = prompt || "Hello! Please respond with a brief, friendly message about AI and technology. Keep it under 50 words.";

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(testPrompt);

    const text = response.response.text();

    return Response.json({
      success: true,
      response: text,
      model: 'gemini-1.5-flash'
    });

  } catch (error) {
    console.error('AI API Error:', error);
    return Response.json(
      { 
        error: 'Failed to generate AI response',
        details: error.message 
      },
      { status: 500 }
    );
  }
}