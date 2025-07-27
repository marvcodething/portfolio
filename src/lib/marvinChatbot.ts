/**
 * Marvin Chatbot - Main Orchestrator for Portfolio RAG System
 * Purpose: Coordinates all services to provide intelligent, cost-optimized portfolio responses
 * Key Methods: initialize(), chat(), getUsageStats()
 * Integration: Orchestrates queryRouter, vectorstore, gemini, and tokenTracker
 * Optimization: Implements progressive routing strategy for maximum cost efficiency
 */

import { ChatMessage, ChatResponse, chatCompletion, estimateTokenCount } from './gemini';
import { analyzeQuery, makeRoutingDecision, getExactMatch, QueryAnalysis, RoutingDecision } from './queryRouter';
import { searchByKeywords, searchByCategory, searchAll, SearchResponse } from './vectorstore';
import { addTokens, canMakeRequest, getUsageStats, estimateCost, UsageStats } from './tokenTracker';

// Type definitions for chatbot operations
export interface ChatbotConfig {
  strictPortfolioMode: boolean;      // Reject non-portfolio queries
  maxContextLength: number;          // Maximum context tokens for responses
  enableExactMatches: boolean;       // Use pre-defined responses
  enableKeywordSearch: boolean;      // Use zero-cost keyword search
  enableCategoryRouting: boolean;    // Use category-filtered search
  budgetEnforcement: boolean;        // Enforce token budget limits
  responseStyle: 'professional' | 'casual' | 'friendly';
}

export interface ChatbotResponse {
  message: string;
  confidence: number;
  route: 'exact' | 'keyword' | 'category' | 'full' | 'rejected';
  tokensUsed: number;
  cost: number;
  context: string[];                 // Retrieved context chunks
  analysis: QueryAnalysis;
  usageStats: UsageStats;
  processingTime: number;
}

export interface ChatbotState {
  isInitialized: boolean;
  config: ChatbotConfig;
  conversationHistory: ChatMessage[];
  totalInteractions: number;
  successfulResponses: number;
  averageResponseTime: number;
}

// Default configuration optimized for $0.60/month budget
const DEFAULT_CONFIG: ChatbotConfig = {
  strictPortfolioMode: true,         // Only portfolio-related queries
  maxContextLength: 1000,            // Reasonable context limit
  enableExactMatches: true,          // Free responses for common questions
  enableKeywordSearch: true,         // Free keyword-based search
  enableCategoryRouting: true,       // Cost-efficient category search
  budgetEnforcement: true,           // Strict budget controls
  responseStyle: 'friendly',         // Marvin's personality
};

// Portfolio scope validation messages
const REJECTION_MESSAGES = [
  "I'm Marvin's portfolio assistant and can only answer questions about his background, skills, projects, and experience. Please ask me something about Marvin!",
  "I'm here to help you learn about Marvin Romero's work and experience. What would you like to know about his portfolio?",
  "I can only discuss Marvin's professional background, projects, and skills. How can I help you learn about his work?",
];

// Chatbot state management
let chatbotState: ChatbotState = {
  isInitialized: false,
  config: DEFAULT_CONFIG,
  conversationHistory: [],
  totalInteractions: 0,
  successfulResponses: 0,
  averageResponseTime: 0,
};

/**
 * Initializes the chatbot with optional configuration
 * Purpose: Set up chatbot system and validate all dependencies
 * Parameters: config - optional chatbot configuration
 * Returns: Promise<boolean> indicating initialization success
 * Error Handling: Validates all services and provides detailed error feedback
 * Optimization: Performs dependency checks to prevent runtime failures
 */
export async function initialize(config?: Partial<ChatbotConfig>): Promise<boolean> {
  console.log('Initializing Marvin Portfolio Chatbot...');
  
  try {
    // Merge configuration
    chatbotState.config = { ...DEFAULT_CONFIG, ...config };
    
    // Test core dependencies
    const dependencyTests = [
      testTokenTracker(),
      testQueryRouter(),
      testVectorStore(),
      testGeminiConnection(),
    ];
    
    const testResults = await Promise.allSettled(dependencyTests);
    const failures = testResults
      .map((result, index) => ({ result, service: ['TokenTracker', 'QueryRouter', 'VectorStore', 'Gemini'][index] }))
      .filter(({ result }) => result.status === 'rejected' || !result.value);
    
    if (failures.length > 0) {
      console.error('Dependency test failures:', failures.map(f => f.service));
      return false;
    }
    
    // Reset conversation state
    chatbotState.conversationHistory = [];
    chatbotState.totalInteractions = 0;
    chatbotState.successfulResponses = 0;
    chatbotState.averageResponseTime = 0;
    chatbotState.isInitialized = true;
    
    console.log('Marvin Portfolio Chatbot initialized successfully');
    return true;
    
  } catch (error) {
    console.error('Failed to initialize chatbot:', error);
    return false;
  }
}

/**
 * Main chat function - processes user queries and generates responses
 * Purpose: Orchestrate the complete RAG pipeline with cost optimization
 * Parameters: userMessage - user's question, conversationHistory - previous messages
 * Returns: Promise<ChatbotResponse> with generated response and metadata
 * Error Handling: Graceful degradation with fallback responses
 * Optimization: Progressive routing strategy for maximum cost efficiency
 */
export async function chat(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatbotResponse> {
  const startTime = Date.now();
  
  if (!chatbotState.isInitialized) {
    throw new Error('Chatbot not initialized. Call initialize() first.');
  }
  
  if (!userMessage || userMessage.trim().length === 0) {
    throw new Error('Message is required');
  }

  // Update conversation tracking
  chatbotState.totalInteractions++;
  
  try {
    // Step 1: Query Analysis
    console.log('Analyzing query:', userMessage);
    const analysis = analyzeQuery(userMessage, { 
      strictMode: chatbotState.config.strictPortfolioMode 
    });
    
    // Step 2: Portfolio Scope Validation
    if (!analysis.isPortfolioRelated && chatbotState.config.strictPortfolioMode) {
      return createRejectionResponse(analysis, startTime);
    }
    
    // Step 3: Routing Decision
    const routingDecision = makeRoutingDecision(userMessage, analysis);
    console.log('Routing decision:', routingDecision.route, routingDecision.reasoning);
    
    // Step 4: Budget Check (for operations with cost)
    if (routingDecision.estimatedCost > 0 && chatbotState.config.budgetEnforcement) {
      const estimatedTokens = estimateTokenCount(userMessage) + 300; // Response estimate
      
      if (!canMakeRequest(estimatedTokens, routingDecision.estimatedCost)) {
        return createBudgetExceededResponse(analysis, startTime);
      }
    }
    
    // Step 5: Execute Routing Strategy
    let response: ChatbotResponse;
    
    switch (routingDecision.route) {
      case 'exact':
        response = await handleExactMatch(userMessage, analysis, startTime);
        break;
        
      case 'keyword':
        response = await handleKeywordSearch(userMessage, analysis, startTime);
        break;
        
      case 'category':
        response = await handleCategorySearch(userMessage, analysis, routingDecision, startTime);
        break;
        
      case 'full':
        response = await handleFullSearch(userMessage, analysis, conversationHistory, startTime);
        break;
        
      case 'reject':
        response = createRejectionResponse(analysis, startTime);
        break;
        
      default:
        throw new Error(`Unknown routing decision: ${routingDecision.route}`);
    }
    
    // Step 6: Update Statistics
    if (response.route !== 'rejected') {
      chatbotState.successfulResponses++;
      updateAverageResponseTime(Date.now() - startTime);
    }
    
    // Step 7: Update Conversation History
    updateConversationHistory(userMessage, response.message);
    
    return response;
    
  } catch (error) {
    console.error('Chat processing error:', error);
    return createErrorResponse(null, error, startTime);
  }
}

/**
 * Handles exact match responses (0 token cost)
 * Purpose: Provide instant responses for common questions
 * Parameters: query - user query, analysis - query analysis, startTime - processing start time
 * Returns: Promise<ChatbotResponse> with exact match response
 * Optimization: Zero cost operation - perfect for budget conservation
 */
async function handleExactMatch(
  query: string,
  analysis: QueryAnalysis,
  startTime: number
): Promise<ChatbotResponse> {
  const exactMatch = getExactMatch(query);
  
  if (!exactMatch) {
    // Fallback to keyword search if no exact match
    return handleKeywordSearch(query, analysis, startTime);
  }
  
  return {
    message: exactMatch.answer,
    confidence: 1.0,
    route: 'exact',
    tokensUsed: 0,
    cost: 0,
    context: [exactMatch.answer],
    analysis,
    usageStats: getUsageStats(),
    processingTime: Date.now() - startTime,
  };
}

/**
 * Handles keyword-based search (0 token cost)
 * Purpose: Search using keywords without AI operations
 * Parameters: query - user query, analysis - query analysis, startTime - processing start time
 * Returns: Promise<ChatbotResponse> with keyword search response
 * Optimization: No API calls - uses database keyword matching only
 */
async function handleKeywordSearch(
  query: string,
  analysis: QueryAnalysis,
  startTime: number
): Promise<ChatbotResponse> {
  try {
    const keywords = analysis.extractedKeywords.length > 0 
      ? analysis.extractedKeywords 
      : [query.toLowerCase()];
    
    const searchResult = await searchByKeywords(keywords, { maxResults: 3 });
    
    if (searchResult.results.length === 0) {
      // Fallback to category search if no keyword matches
      if (analysis.detectedCategories.length > 0) {
        return handleCategorySearch(query, analysis, {
          route: 'category',
          category: analysis.detectedCategories[0].category,
          reasoning: 'Fallback to category search',
          estimatedCost: 0.001,
        }, startTime);
      }
      
      return createNoResultsResponse(analysis, startTime);
    }
    
    const context = searchResult.results.map(r => r.content);
    const contextString = context.join('\n\n');
    
    // Generate simple response without AI
    const response = generateKeywordResponse(searchResult.results, query);
    
    return {
      message: response,
      confidence: 0.8,
      route: 'keyword',
      tokensUsed: 0,
      cost: 0,
      context,
      analysis,
      usageStats: getUsageStats(),
      processingTime: Date.now() - startTime,
    };
    
  } catch (error) {
    console.error('Keyword search error:', error);
    throw new Error(`Keyword search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handles category-filtered search with AI response
 * Purpose: Search within specific portfolio category for relevant results
 * Parameters: query, analysis, routingDecision, startTime
 * Returns: Promise<ChatbotResponse> with category search response
 * Optimization: Category filtering reduces search space and improves relevance
 */
async function handleCategorySearch(
  query: string,
  analysis: QueryAnalysis,
  routingDecision: RoutingDecision,
  startTime: number
): Promise<ChatbotResponse> {
  if (!routingDecision.category) {
    throw new Error('Category required for category search');
  }
  
  try {
    // Search within category
    const searchResult = await searchByCategory(query, routingDecision.category, {
      threshold: 0.5,
      maxResults: 5,
    });
    
    if (searchResult.results.length === 0) {
      // Fallback to full search
      return handleFullSearch(query, analysis, [], startTime);
    }
    
    const context = searchResult.results.map(r => r.content);
    const contextString = context.join('\n\n');
    
    // Generate AI response with context
    const aiResponse = await chatCompletion(
      [{ role: 'user', content: query }],
      contextString,
      { maxTokens: 300, temperature: 0.7 }
    );
    
    // Track token usage
    addTokens(aiResponse.tokensUsed, estimateCost(
      estimateTokenCount(query + contextString),
      aiResponse.tokensUsed,
      'chat_completion'
    ), 'chat_completion', 'category');
    
    return {
      message: aiResponse.message,
      confidence: aiResponse.confidence || 0.7,
      route: 'category',
      tokensUsed: aiResponse.tokensUsed + searchResult.tokensUsed,
      cost: estimateCost(
        estimateTokenCount(query + contextString),
        aiResponse.tokensUsed,
        'chat_completion'
      ),
      context,
      analysis,
      usageStats: getUsageStats(),
      processingTime: Date.now() - startTime,
    };
    
  } catch (error) {
    console.error('Category search error:', error);
    throw new Error(`Category search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handles full database search with AI response
 * Purpose: Search across all categories when other methods are insufficient
 * Parameters: query, analysis, conversationHistory, startTime
 * Returns: Promise<ChatbotResponse> with full search response
 * Optimization: Most expensive option - used only when necessary
 */
async function handleFullSearch(
  query: string,
  analysis: QueryAnalysis,
  conversationHistory: ChatMessage[],
  startTime: number
): Promise<ChatbotResponse> {
  try {
    // Search across all categories
    const searchResult = await searchAll(query, {
      threshold: 0.4,
      maxResults: 8,
    });
    
    if (searchResult.results.length === 0) {
      return createNoResultsResponse(analysis, startTime);
    }
    
    const context = searchResult.results.map(r => r.content);
    const contextString = context.join('\n\n');
    
    // Prepare conversation context
    const messages: ChatMessage[] = [
      ...conversationHistory.slice(-3), // Last 3 messages for context
      { role: 'user', content: query }
    ];
    
    // Generate AI response with full context
    const aiResponse = await chatCompletion(
      messages,
      contextString,
      { maxTokens: 400, temperature: 0.7 }
    );
    
    // Track token usage
    const totalCost = estimateCost(
      estimateTokenCount(query + contextString),
      aiResponse.tokensUsed,
      'chat_completion'
    );
    
    addTokens(aiResponse.tokensUsed, totalCost, 'chat_completion', 'full');
    
    return {
      message: aiResponse.message,
      confidence: aiResponse.confidence || 0.6,
      route: 'full',
      tokensUsed: aiResponse.tokensUsed + searchResult.tokensUsed,
      cost: totalCost,
      context,
      analysis,
      usageStats: getUsageStats(),
      processingTime: Date.now() - startTime,
    };
    
  } catch (error) {
    console.error('Full search error:', error);
    throw new Error(`Full search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper functions for response generation

function createRejectionResponse(analysis: QueryAnalysis | null, startTime: number): ChatbotResponse {
  const randomMessage = REJECTION_MESSAGES[Math.floor(Math.random() * REJECTION_MESSAGES.length)];
  
  return {
    message: randomMessage,
    confidence: 1.0,
    route: 'rejected',
    tokensUsed: 0,
    cost: 0,
    context: [],
    analysis: analysis || getDefaultAnalysis(),
    usageStats: getUsageStats(),
    processingTime: Date.now() - startTime,
  };
}

function createBudgetExceededResponse(analysis: QueryAnalysis, startTime: number): ChatbotResponse {
  const stats = getUsageStats();
  const message = `I've reached my monthly usage limit to keep costs low. Current usage: $${stats.currentUsage.totalCost.toFixed(3)} of $${stats.budgetLimits.monthlyBudget}. Please try again next month!`;
  
  return {
    message,
    confidence: 1.0,
    route: 'rejected',
    tokensUsed: 0,
    cost: 0,
    context: [],
    analysis,
    usageStats: stats,
    processingTime: Date.now() - startTime,
  };
}

function createNoResultsResponse(analysis: QueryAnalysis, startTime: number): ChatbotResponse {
  const message = "I don't have specific information about that in Marvin's portfolio. Could you try asking about his skills, projects, experience, or background in a different way?";
  
  return {
    message,
    confidence: 0.3,
    route: 'full',
    tokensUsed: 0,
    cost: 0,
    context: [],
    analysis,
    usageStats: getUsageStats(),
    processingTime: Date.now() - startTime,
  };
}

function createErrorResponse(analysis: QueryAnalysis | null, error: unknown, startTime: number): ChatbotResponse {
  const message = "I'm having trouble processing your request right now. Please try asking about Marvin's background, skills, or projects in a simpler way.";
  
  return {
    message,
    confidence: 0,
    route: 'rejected',
    tokensUsed: 0,
    cost: 0,
    context: [],
    analysis: analysis || getDefaultAnalysis(),
    usageStats: getUsageStats(),
    processingTime: Date.now() - startTime,
  };
}

function generateKeywordResponse(results: any[], query: string): string {
  if (results.length === 0) {
    return "I couldn't find specific information about that in Marvin's portfolio.";
  }
  
  const topResult = results[0];
  const category = topResult.category.toLowerCase();
  
  return `Based on Marvin's ${category}, here's what I found: ${topResult.content.substring(0, 200)}${topResult.content.length > 200 ? '...' : ''}`;
}

function updateConversationHistory(userMessage: string, botResponse: string): void {
  chatbotState.conversationHistory.push(
    { role: 'user', content: userMessage, timestamp: Date.now() },
    { role: 'assistant', content: botResponse, timestamp: Date.now() }
  );
  
  // Keep only last 10 messages for performance
  if (chatbotState.conversationHistory.length > 10) {
    chatbotState.conversationHistory = chatbotState.conversationHistory.slice(-10);
  }
}

function updateAverageResponseTime(responseTime: number): void {
  const totalResponses = chatbotState.successfulResponses;
  const currentAverage = chatbotState.averageResponseTime;
  
  chatbotState.averageResponseTime = (currentAverage * (totalResponses - 1) + responseTime) / totalResponses;
}

function getDefaultAnalysis(): QueryAnalysis {
  return {
    isPortfolioRelated: false,
    detectedCategories: [],
    confidence: 0,
    suggestedRoute: 'reject',
    extractedKeywords: [],
    queryType: 'general',
  };
}

// Import test functions
async function testTokenTracker(): Promise<boolean> {
  const { testTokenTracker } = await import('./tokenTracker');
  return testTokenTracker();
}

async function testQueryRouter(): Promise<boolean> {
  const { testQueryRouter } = await import('./queryRouter');
  return testQueryRouter();
}

async function testVectorStore(): Promise<boolean> {
  const { testVectorStore } = await import('./vectorstore');
  return testVectorStore();
}

async function testGeminiConnection(): Promise<boolean> {
  const { testGeminiConnection } = await import('./gemini');
  return testGeminiConnection();
}

/**
 * Gets current chatbot statistics
 * Purpose: Provide analytics about chatbot performance
 * Returns: comprehensive statistics object
 */
export function getChatbotStats() {
  return {
    ...chatbotState,
    usageStats: getUsageStats(),
    successRate: chatbotState.totalInteractions > 0 
      ? (chatbotState.successfulResponses / chatbotState.totalInteractions) * 100 
      : 0,
  };
}

/**
 * Updates chatbot configuration
 * Purpose: Allow runtime configuration changes
 * Parameters: newConfig - partial configuration to update
 * Returns: boolean indicating success
 */
export function updateConfig(newConfig: Partial<ChatbotConfig>): boolean {
  try {
    chatbotState.config = { ...chatbotState.config, ...newConfig };
    return true;
  } catch (error) {
    console.error('Failed to update config:', error);
    return false;
  }
}

/**
 * Test complete chatbot functionality
 * Purpose: Verify entire system is working correctly
 * Returns: Promise<boolean> indicating if chatbot is functional
 */
export async function testChatbot(): Promise<boolean> {
  try {
    const initialized = await initialize();
    if (!initialized) return false;
    
    const testResponse = await chat("What skills does Marvin have?");
    return testResponse.message.length > 0;
    
  } catch (error) {
    console.error('Chatbot test failed:', error);
    return false;
  }
}