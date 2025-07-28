/**
 * Chat API Route for Portfolio RAG Chatbot
 * Simplified version with direct API calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  for (const [ip, requests] of rateLimitMap.entries()) {
    const recentRequests = requests.filter(time => time > windowStart);
    if (recentRequests.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, recentRequests);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip);
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEmbedding(text) {
  const model = ai.getGenerativeModel({ model: 'text-embedding-004' });
  const response = await model.embedContent(text);
  return response.embedding.values;
}

function formatLinksInResponse(text) {
  // Aggressively clean up any HTML and return plain text only
  let cleanText = text;
  
  // Remove ALL HTML-like content step by step
  // First remove complete tags
  cleanText = cleanText.replace(/<[^>]*>/g, '');
  
  // Remove any remaining HTML attributes (with and without quotes)
  cleanText = cleanText.replace(/\s*(href|target|rel|style|class|id)\s*=\s*"[^"]*"/gi, '');
  cleanText = cleanText.replace(/\s*(href|target|rel|style|class|id)\s*=\s*'[^']*'/gi, '');
  cleanText = cleanText.replace(/\s*(href|target|rel|style|class|id)\s*=\s*[^\s"'>]*/gi, '');
  
  // Remove any remaining brackets, quotes, and HTML-like artifacts
  cleanText = cleanText.replace(/[<>"']/g, '');
  cleanText = cleanText.replace(/&[a-zA-Z0-9#]+;/g, ''); // Remove HTML entities
  
  // Clean up any double spaces
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  return cleanText;
}

async function searchRelevantContent(query, threshold = 0.6, limit = 3) {
  try {
    console.log(`🔍 Searching for: "${query}"`);
    
    const queryEmbedding = await generateEmbedding(query);
    console.log(`📊 Generated embedding with ${queryEmbedding.length} dimensions`);
    
    // Format embedding as PostgreSQL array string
    const embeddingString = `[${queryEmbedding.join(',')}]`;
    console.log(`🔧 Formatted embedding for database search`);
    
    const { data, error } = await supabase.rpc('search_chunks', {
      query_embedding: embeddingString,
      match_threshold: threshold,
      match_count: limit
    });
    
    if (error) {
      console.error('❌ Database search error:', error);
      throw error;
    }
    
    console.log(`✅ Database search completed: ${data ? data.length : 0} results`);
    if (data && data.length > 0) {
      console.log(`🎯 Top result: ${data[0].category} (similarity: ${data[0].similarity})`);
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Search function failed:', error);
    return [];
  }
}

async function generateResponse(query, context, conversationHistory = []) {
  try {
    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });
    
    const contextText = context.length > 0 
      ? context.map(item => `[${item.category}] ${item.content}`).join('\n\n')
      : '';
    
    // Format conversation history
    const historyText = conversationHistory.length > 0
      ? '\n\nPrevious conversation:\n' + conversationHistory.map(msg => 
          `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}`
        ).join('\n')
      : '';
    
    const systemPrompt = `You are Marvin Romero. Respond in first person using "I", "my", "me". Use the context below to answer questions about your background, skills, projects, and experience.

Context about yourself:
${contextText}${historyText}

Instructions:
- Respond in first person as Marvin Romero
- Use the information provided in the context above to answer questions
- Be conversational and professional
- Look at the previous conversation to avoid repeating the same information
- If you already mentioned certain projects/details, focus on different ones or provide additional details
- CRITICAL: When mentioning contact links, ALWAYS use the exact URLs, never descriptive text
- GitHub: ALWAYS say "github.com/marvcodething" - NEVER say "My GitHub" or "My GitHub Profile"
- LinkedIn: ALWAYS say "www.linkedin.com/in/marvin-romero" - NEVER say "My LinkedIn" 
- Portfolio: ALWAYS say "marvinromero.online" - NEVER say "My Portfolio"
- Email: ALWAYS say "marv.a.romero05@gmail.com"
- Phone: ALWAYS say "(301) 693-5984"
- NEVER use phrases like "My [platform]" or "[platform] Profile" - use actual URLs only
- You can rephrase and summarize information from the context
- Do NOT add personal details, locations, or experiences not mentioned in the context
- If you don't have enough relevant context to answer, say so
- IMPORTANT: Write URLs as plain text only - do NOT use HTML tags, links, or any HTML formatting
- NEVER use HTML tags like <a>, <href>, or any HTML attributes
- Output plain text only, no HTML whatsoever

User question: ${query}`;

    const response = await model.generateContent(systemPrompt);
    
    if (!response || !response.response || !response.response.text()) {
      throw new Error('Invalid response from Gemini');
    }
    
    let responseText = response.response.text().trim();
    
    // Debug logging
    console.log('🔍 Raw AI response:', responseText.substring(0, 200) + '...');
    
    // Convert URLs to clickable links (this function also cleans HTML)
    responseText = formatLinksInResponse(responseText);
    
    console.log('🔧 After link formatting:', responseText.substring(0, 200) + '...');
    
    // Final validation: Log any remaining artifacts
    const validLinks = responseText.match(/<a[^>]*>.*?<\/a>/g) || [];
    const htmlArtifacts = responseText.match(/[<>]|href=|target=|style=/g) || [];
    const expectedArtifacts = validLinks.length * 4; // Each link has <, >, href=, target=, style=
    
    if (htmlArtifacts.length > expectedArtifacts) {
      console.warn('⚠️ Potential HTML artifacts detected:', htmlArtifacts.slice(expectedArtifacts));
    }
    
    return responseText;
  } catch (error) {
    console.error('Generation error:', error);
    return "I'm sorry, I'm having trouble generating a response right now. Please try again.";
  }
}

export async function POST(request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { message, conversationHistory = [] } = body;
    
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message too long. Please keep messages under 1000 characters.' },
        { status: 400 }
      );
    }
    
    console.log(`Processing query: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
    
    // Search for relevant content with lower threshold
    const relevantContent = await searchRelevantContent(message, 0.3, 5); // Lower threshold, more results
    console.log(`Found ${relevantContent.length} relevant chunks`);
    
    // Debug: Log search details
    if (relevantContent.length > 0) {
      console.log('Top result:', {
        category: relevantContent[0].category,
        similarity: relevantContent[0].similarity,
        preview: relevantContent[0].content.substring(0, 100)
      });
    } else {
      console.log('No relevant content found - debugging search...');
    }
    
    // Generate response using RAG
    const response = await generateResponse(message, relevantContent, conversationHistory);
    
    return NextResponse.json({
      success: true,
      message: response,
      metadata: {
        relevantChunks: relevantContent.length,
        sources: relevantContent.map(chunk => chunk.category),
        processingTime: Date.now() // Simple timestamp
      }
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        success: false 
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint for health check
export async function GET() {
  try {
    // Test connections
    const { error } = await supabase.from('document_chunks').select('count', { count: 'exact', head: true });
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      database: !error ? 'connected' : 'error',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed', success: false },
      { status: 500 }
    );
  }
}