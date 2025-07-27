/**
 * Gemini AI Service for Portfolio RAG Chatbot
 * Purpose: Handle all Gemini AI operations including embeddings and chat completions
 * Key Methods: generateEmbedding(), chatCompletion(), estimateTokens(), formatMessages()
 * Integration: Used by vectorstore.ts for embeddings and marvinChatbot.ts for responses
 * Optimization: Implements token counting and rate limiting for budget control
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Type definitions for Gemini operations
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatResponse {
  message: string;
  tokensUsed: number;
  model: string;
  confidence?: number;
}

export interface EmbeddingResponse {
  embedding: number[];
  tokensUsed: number;
  model: string;
}

export interface TokenEstimate {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;        // Estimated cost in USD
}

// Model configurations for cost optimization
export const MODELS = {
  EMBEDDING: 'text-embedding-004',    // Free tier, 768 dimensions
  CHAT: 'gemini-1.5-flash',          // ~$0.50/1M tokens
} as const;

// Token cost estimates (as of 2024)
export const TOKEN_COSTS = {
  EMBEDDING: 0,                       // Free tier
  CHAT_INPUT: 0.000000075,           // $0.075 per 1M input tokens
  CHAT_OUTPUT: 0.0000003,            // $0.30 per 1M output tokens
} as const;

/**
 * Generates text embedding using Gemini's text-embedding-004 model
 * Purpose: Convert text to 768-dimension vector for similarity search
 * Parameters: text - string to embed, options - optional configuration
 * Returns: Promise<EmbeddingResponse> with embedding vector and metadata
 * Error Handling: Retries on transient failures, validates output dimensions
 * Optimization: Uses free embedding model to minimize costs
 */
export async function generateEmbedding(
  text: string,
  options: {
    retries?: number;
    timeout?: number;
  } = {}
): Promise<EmbeddingResponse> {
  const { retries = 2, timeout = 10000 } = options;
  
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for embedding generation');
  }

  // Trim text to prevent excessive token usage
  const trimmedText = text.length > 8000 ? text.substring(0, 8000) + '...' : text;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create timeout promise for API call
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Embedding generation timeout')), timeout);
      });

      // Generate embedding with timeout protection
      const model = ai.getGenerativeModel({ model: MODELS.EMBEDDING });
      const embeddingPromise = model.embedContent(trimmedText);

      const response = await Promise.race([embeddingPromise, timeoutPromise]);
      
      if (!response || !response.embedding) {
        throw new Error('Invalid embedding response from Gemini');
      }

      // Validate embedding dimensions (should be 768 for text-embedding-004)
      if (!Array.isArray(response.embedding.values) || response.embedding.values.length !== 768) {
        throw new Error(`Invalid embedding dimensions: expected 768, got ${response.embedding.values?.length || 0}`);
      }

      return {
        embedding: response.embedding.values,
        tokensUsed: 0,                    // Free tier
        model: MODELS.EMBEDDING,
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown embedding error');
      
      if (attempt < retries) {
        // Exponential backoff for retries
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
    }
  }

  throw new Error(`Failed to generate embedding after ${retries + 1} attempts: ${lastError?.message}`);
}

/**
 * Generates chat completion using Gemini 1.5 Flash
 * Purpose: Generate portfolio-focused responses with context from vector search
 * Parameters: messages - conversation history, context - retrieved portfolio data, options - configuration
 * Returns: Promise<ChatResponse> with generated response and token usage
 * Error Handling: Validates input, handles rate limits, filters inappropriate content
 * Optimization: Includes token counting for budget tracking
 */
export async function chatCompletion(
  messages: ChatMessage[],
  context: string = '',
  options: {
    maxTokens?: number;
    temperature?: number;
    retries?: number;
  } = {}
): Promise<ChatResponse> {
  const { maxTokens = 500, temperature = 0.7, retries = 2 } = options;

  if (!messages || messages.length === 0) {
    throw new Error('Messages are required for chat completion');
  }

  // Get the latest user message
  const userMessage = messages[messages.length - 1];
  if (userMessage.role !== 'user') {
    throw new Error('Last message must be from user');
  }

  // Construct system prompt with portfolio context
  const systemPrompt = `You are Marvin Romero's portfolio assistant. You can ONLY answer questions about Marvin's background, skills, projects, experience, and contact information.

IMPORTANT RULES:
1. ONLY answer questions about Marvin Romero and his portfolio
2. If asked about anything else (other people, general topics, current events, etc.), respond: "I'm Marvin's portfolio assistant and can only answer questions about his background, skills, projects, and experience. Please ask me something about Marvin!"
3. Be conversational but professional
4. Keep responses concise (under 150 words)
5. Use the provided context to give accurate, specific answers

PORTFOLIO CONTEXT:
${context}

Remember: You represent Marvin professionally, so be helpful, accurate, and enthusiastic about his work.`;

  // Format conversation for Gemini
  const conversationText = `${systemPrompt}\n\nUser: ${userMessage.content}\n\nAssistant:`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const model = ai.getGenerativeModel({ 
        model: MODELS.CHAT,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
        },
      });
      const response = await model.generateContent(conversationText);

      if (!response || !response.response || !response.response.text()) {
        throw new Error('Invalid response from Gemini chat completion');
      }

      const responseText = response.response.text().trim();
      
      // Estimate token usage for cost tracking
      const inputTokens = estimateTokenCount(conversationText);
      const outputTokens = estimateTokenCount(responseText);
      const totalTokens = inputTokens + outputTokens;

      // Validate response is portfolio-focused
      if (isOffTopicResponse(responseText, userMessage.content)) {
        return {
          message: "I'm Marvin's portfolio assistant and can only answer questions about his background, skills, projects, and experience. Please ask me something about Marvin!",
          tokensUsed: totalTokens,
          model: MODELS.CHAT,
          confidence: 1.0,
        };
      }

      return {
        message: responseText,
        tokensUsed: totalTokens,
        model: MODELS.CHAT,
        confidence: calculateResponseConfidence(context, responseText),
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown chat completion error');
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
    }
  }

  throw new Error(`Failed to generate chat completion after ${retries + 1} attempts: ${lastError?.message}`);
}

/**
 * Estimates token count for text
 * Purpose: Approximate token usage for cost calculation and budget enforcement
 * Parameters: text - string to estimate tokens for
 * Returns: number of estimated tokens
 * Optimization: Uses fast approximation (4 chars ≈ 1 token) for real-time tracking
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  
  // Rough approximation: ~4 characters per token for English text
  // This is conservative to avoid budget overruns
  return Math.ceil(text.length / 4);
}

/**
 * Calculates estimated cost for token usage
 * Purpose: Provide cost estimates for budget tracking and user transparency
 * Parameters: inputTokens - estimated input tokens, outputTokens - estimated output tokens
 * Returns: TokenEstimate with breakdown and total cost
 * Optimization: Helps enforce monthly budget limits
 */
export function calculateTokenCost(inputTokens: number, outputTokens: number): TokenEstimate {
  const inputCost = inputTokens * TOKEN_COSTS.CHAT_INPUT;
  const outputCost = outputTokens * TOKEN_COSTS.CHAT_OUTPUT;
  
  return {
    inputTokens,
    outputTokens,
    totalCost: inputCost + outputCost,
  };
}

/**
 * Formats message history for Gemini API
 * Purpose: Convert ChatMessage array to format expected by Gemini
 * Parameters: messages - array of ChatMessage objects
 * Returns: formatted string for Gemini API
 * Optimization: Keeps only recent messages to control token usage
 */
export function formatMessages(messages: ChatMessage[], maxMessages: number = 10): string {
  // Keep only recent messages to control token usage
  const recentMessages = messages.slice(-maxMessages);
  
  return recentMessages
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');
}

/**
 * Validates if query is portfolio-related
 * Purpose: Filter out off-topic queries before expensive AI calls
 * Parameters: query - user's question
 * Returns: boolean indicating if query is portfolio-appropriate
 * Optimization: Prevents wasted tokens on irrelevant queries
 */
export function isPortfolioQuery(query: string): boolean {
  const portfolioKeywords = [
    // Personal
    'marvin', 'romero', 'background', 'bio', 'about',
    // Professional
    'experience', 'work', 'job', 'intern', 'project', 'skill', 'tech', 'programming',
    'education', 'college', 'university', 'degree',
    // Contact
    'contact', 'email', 'reach', 'hire', 'available',
    // Specific technologies (add as needed)
    'react', 'next', 'javascript', 'python', 'node', 'database',
  ];

  const offTopicKeywords = [
    'weather', 'news', 'stock', 'crypto', 'bitcoin',
    'politics', 'sports', 'celebrity', 'entertainment',
    'recipe', 'health', 'medical', 'legal',
  ];

  const queryLower = query.toLowerCase();
  
  // Check for off-topic indicators first
  if (offTopicKeywords.some(keyword => queryLower.includes(keyword))) {
    return false;
  }
  
  // Check for portfolio-related keywords
  return portfolioKeywords.some(keyword => queryLower.includes(keyword)) ||
         queryLower.includes('you') || // Questions directed at Marvin
         queryLower.includes('your'); // Questions about Marvin's things
}

/**
 * Detects if response went off-topic
 * Purpose: Catch and correct responses that stray from portfolio focus
 * Parameters: response - AI generated response, originalQuery - user's question
 * Returns: boolean indicating if response is off-topic
 * Error Handling: Provides safeguard against inappropriate responses
 */
function isOffTopicResponse(response: string, originalQuery: string): boolean {
  const responseLower = response.toLowerCase();
  
  // Red flags that indicate off-topic response
  const offTopicIndicators = [
    'i don\'t know about marvin',
    'i cannot provide information about',
    'as an ai',
    'current events',
    'weather',
    'news',
  ];
  
  return offTopicIndicators.some(indicator => responseLower.includes(indicator));
}

/**
 * Calculates confidence score for response
 * Purpose: Assess response quality based on context relevance
 * Parameters: context - retrieved portfolio context, response - generated response
 * Returns: confidence score between 0 and 1
 * Optimization: Helps improve response quality over time
 */
function calculateResponseConfidence(context: string, response: string): number {
  if (!context || !response) return 0.5;
  
  // Simple confidence calculation based on context overlap
  const contextWords = context.toLowerCase().split(/\s+/);
  const responseWords = response.toLowerCase().split(/\s+/);
  
  const overlap = responseWords.filter(word => 
    word.length > 3 && contextWords.includes(word)
  ).length;
  
  const maxPossibleOverlap = Math.min(contextWords.length, responseWords.length);
  
  if (maxPossibleOverlap === 0) return 0.5;
  
  return Math.min(1.0, overlap / maxPossibleOverlap + 0.3); // Baseline confidence of 0.3
}

/**
 * Test Gemini API connection and functionality
 * Purpose: Verify API key and basic functionality
 * Returns: Promise<boolean> indicating if API is working
 * Error Handling: Catches and logs API errors
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const testEmbedding = await generateEmbedding('test');
    return testEmbedding.embedding.length === 768;
  } catch (error) {
    console.error('Gemini API test failed:', error);
    return false;
  }
}