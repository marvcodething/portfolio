import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({});

    const { prompt } = await request.json();
    
    const testPrompt = prompt || "Hello! Please respond with a brief, friendly message about AI and technology. Keep it under 50 words.";

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: testPrompt,
    });

    const text = response.text;

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