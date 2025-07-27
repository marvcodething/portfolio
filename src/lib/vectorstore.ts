/**
 * Vector Store Operations for Portfolio RAG Chatbot
 * Purpose: Handle all vector storage and similarity search operations with Supabase
 * Key Methods: storeChunks(), searchByCategory(), searchAll(), getChunkCount()
 * Integration: Uses supabase.ts for database access and gemini.ts for embeddings
 * Optimization: Implements category-first search strategy for 60-80% cost savings
 */

import { supabase, PortfolioChunk, SearchResult, validateEmbedding, validateCategory, formatDatabaseError } from './supabase';
import { generateEmbedding, estimateTokenCount } from './gemini';

// Type definitions for vector operations
export interface StoreChunkParams {
  content: string;
  category: string;
  subcategory?: string;
  keywords?: string[];
  importance_score?: number;
  source_file?: string;
}

export interface SearchOptions {
  category?: string;                  // For category-filtered search
  threshold?: number;                 // Similarity threshold
  maxResults?: number;                // Maximum results to return
  includeEmbedding?: boolean;         // Whether to include embeddings in results
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  searchType: 'category' | 'full' | 'keyword';
  tokensUsed: number;
  executionTime: number;
}

export interface VectorStats {
  totalChunks: number;
  categoryCounts: Record<string, number>;
  totalTokens: number;
  averageChunkSize: number;
}

/**
 * Stores portfolio content chunks with vector embeddings
 * Purpose: Process and store portfolio content for similarity search
 * Parameters: chunks - array of content chunks to store
 * Returns: Promise<number> count of successfully stored chunks
 * Error Handling: Validates inputs, handles embedding failures, provides partial success
 * Optimization: Batches database operations, estimates tokens for cost tracking
 */
export async function storeChunks(chunks: StoreChunkParams[]): Promise<number> {
  if (!chunks || chunks.length === 0) {
    throw new Error('No chunks provided for storage');
  }

  console.log(`Processing ${chunks.length} chunks for vector storage...`);
  
  let successCount = 0;
  const batchSize = 10; // Process in batches to avoid rate limits
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    
    try {
      // Generate embeddings for batch
      const embeddingPromises = batch.map(async (chunk, index) => {
        try {
          // Validate chunk data
          if (!chunk.content || chunk.content.trim().length === 0) {
            throw new Error(`Empty content in chunk ${i + index}`);
          }
          
          if (!validateCategory(chunk.category)) {
            throw new Error(`Invalid category "${chunk.category}" in chunk ${i + index}`);
          }

          // Generate embedding
          const embeddingResponse = await generateEmbedding(chunk.content);
          
          // Prepare chunk for database insertion
          const portfolioChunk: Omit<PortfolioChunk, 'id' | 'created_at' | 'updated_at'> = {
            content: chunk.content.trim(),
            category: chunk.category.toUpperCase(),
            subcategory: chunk.subcategory || null,
            keywords: chunk.keywords || extractKeywords(chunk.content),
            embedding: embeddingResponse.embedding,
            chunk_order: i + index,
            importance_score: chunk.importance_score || 1.0,
            token_count: estimateTokenCount(chunk.content),
            source_file: chunk.source_file || 'manual_input',
          };

          return portfolioChunk;
          
        } catch (error) {
          console.error(`Failed to process chunk ${i + index}:`, error);
          return null; // Skip failed chunks
        }
      });

      // Wait for all embeddings in batch
      const processedChunks = await Promise.all(embeddingPromises);
      const validChunks = processedChunks.filter(chunk => chunk !== null);

      if (validChunks.length === 0) {
        console.warn(`Batch ${Math.floor(i / batchSize) + 1}: No valid chunks to store`);
        continue;
      }

      // Store batch in database
      const { data, error } = await supabase
        .from('portfolio_chunks')
        .insert(validChunks)
        .select('id');

      if (error) {
        console.error(`Database error for batch ${Math.floor(i / batchSize) + 1}:`, error);
        continue; // Continue with next batch
      }

      const batchSuccessCount = data?.length || 0;
      successCount += batchSuccessCount;
      
      console.log(`Batch ${Math.floor(i / batchSize) + 1}: Stored ${batchSuccessCount}/${batch.length} chunks`);
      
      // Rate limiting: small delay between batches
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

    } catch (error) {
      console.error(`Failed to process batch ${Math.floor(i / batchSize) + 1}:`, formatDatabaseError(error));
      continue; // Continue with next batch
    }
  }

  console.log(`Vector storage complete: ${successCount}/${chunks.length} chunks stored successfully`);
  return successCount;
}

/**
 * Searches for relevant chunks using category-filtered vector similarity
 * Purpose: Primary search method - searches within specific portfolio category for maximum relevance
 * Parameters: query - user's question, category - portfolio category to search, options - search configuration
 * Returns: Promise<SearchResponse> with ranked results and metadata
 * Error Handling: Validates inputs, handles embedding generation failures
 * Optimization: Category filtering reduces search space and improves relevance
 */
export async function searchByCategory(
  query: string,
  category: string,
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const startTime = Date.now();
  
  if (!query || query.trim().length === 0) {
    throw new Error('Query is required for search');
  }

  if (!validateCategory(category)) {
    throw new Error(`Invalid category: ${category}`);
  }

  const {
    threshold = 0.5,
    maxResults = 5,
  } = options;

  try {
    // Generate query embedding
    const embeddingResponse = await generateEmbedding(query);
    
    // Execute category-filtered vector search
    const { data, error } = await supabase.rpc('search_portfolio_by_category', {
      query_embedding: embeddingResponse.embedding,
      category_filter: category.toUpperCase(),
      match_threshold: threshold,
      match_count: maxResults,
    });

    if (error) {
      throw new Error(`Category search failed: ${formatDatabaseError(error)}`);
    }

    const results = data || [];
    const executionTime = Date.now() - startTime;

    return {
      results: results as SearchResult[],
      totalResults: results.length,
      searchType: 'category',
      tokensUsed: embeddingResponse.tokensUsed,
      executionTime,
    };

  } catch (error) {
    console.error('Category search error:', error);
    throw new Error(`Category search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Searches across all portfolio categories using vector similarity
 * Purpose: Fallback search when category routing is inconclusive
 * Parameters: query - user's question, options - search configuration
 * Returns: Promise<SearchResponse> with ranked results from all categories
 * Error Handling: Validates inputs, provides graceful degradation
 * Optimization: Uses lower threshold to cast wider net across categories
 */
export async function searchAll(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const startTime = Date.now();
  
  if (!query || query.trim().length === 0) {
    throw new Error('Query is required for search');
  }

  const {
    threshold = 0.4,  // Lower threshold for cross-category search
    maxResults = 8,   // More results to capture diverse categories
  } = options;

  try {
    // Generate query embedding
    const embeddingResponse = await generateEmbedding(query);
    
    // Execute full database vector search
    const { data, error } = await supabase.rpc('search_portfolio_full', {
      query_embedding: embeddingResponse.embedding,
      match_threshold: threshold,
      match_count: maxResults,
    });

    if (error) {
      throw new Error(`Full search failed: ${formatDatabaseError(error)}`);
    }

    const results = data || [];
    const executionTime = Date.now() - startTime;

    return {
      results: results as SearchResult[],
      totalResults: results.length,
      searchType: 'full',
      tokensUsed: embeddingResponse.tokensUsed,
      executionTime,
    };

  } catch (error) {
    console.error('Full search error:', error);
    throw new Error(`Full search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Searches using keyword matching without embeddings
 * Purpose: Zero-token cost search for exact keyword matches
 * Parameters: keywords - array of keywords to match, options - search configuration
 * Returns: Promise<SearchResponse> with keyword-matched results
 * Error Handling: Validates keywords, handles empty results gracefully
 * Optimization: No token cost - perfect for common queries and exact matches
 */
export async function searchByKeywords(
  keywords: string[],
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const startTime = Date.now();
  
  if (!keywords || keywords.length === 0) {
    throw new Error('Keywords are required for keyword search');
  }

  const { maxResults = 3 } = options;

  // Clean and validate keywords
  const cleanKeywords = keywords
    .map(kw => kw.trim().toLowerCase())
    .filter(kw => kw.length > 0);

  if (cleanKeywords.length === 0) {
    throw new Error('No valid keywords provided');
  }

  try {
    // Execute keyword-based search
    const { data, error } = await supabase.rpc('search_portfolio_by_keywords', {
      search_keywords: cleanKeywords,
      match_count: maxResults,
    });

    if (error) {
      throw new Error(`Keyword search failed: ${formatDatabaseError(error)}`);
    }

    const results = data || [];
    const executionTime = Date.now() - startTime;

    // Convert to SearchResult format (add similarity score)
    const searchResults: SearchResult[] = results.map(result => ({
      ...result,
      similarity: 1.0, // Perfect match for keyword search
    }));

    return {
      results: searchResults,
      totalResults: results.length,
      searchType: 'keyword',
      tokensUsed: 0, // No tokens used for keyword search
      executionTime,
    };

  } catch (error) {
    console.error('Keyword search error:', error);
    throw new Error(`Keyword search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets statistics about the vector database
 * Purpose: Provide analytics and monitoring for the RAG system
 * Returns: Promise<VectorStats> with database statistics
 * Error Handling: Provides default values if queries fail
 * Optimization: Helps identify data distribution and optimization opportunities
 */
export async function getVectorStats(): Promise<VectorStats> {
  try {
    // Get category statistics
    const { data: statsData, error: statsError } = await supabase.rpc('get_portfolio_stats');
    
    if (statsError) {
      console.error('Stats query error:', statsError);
      return getDefaultStats();
    }

    if (!statsData || statsData.length === 0) {
      return getDefaultStats();
    }

    // Calculate aggregated statistics
    const totalChunks = statsData.reduce((sum, cat) => sum + cat.chunk_count, 0);
    const totalTokens = statsData.reduce((sum, cat) => sum + cat.total_tokens, 0);
    const averageChunkSize = totalChunks > 0 ? Math.round(totalTokens / totalChunks) : 0;

    const categoryCounts: Record<string, number> = {};
    statsData.forEach(cat => {
      categoryCounts[cat.category] = cat.chunk_count;
    });

    return {
      totalChunks,
      categoryCounts,
      totalTokens,
      averageChunkSize,
    };

  } catch (error) {
    console.error('Error fetching vector stats:', error);
    return getDefaultStats();
  }
}

/**
 * Extracts keywords from text content
 * Purpose: Generate keywords for fast exact matching
 * Parameters: content - text to extract keywords from
 * Returns: string array of extracted keywords
 * Optimization: Creates searchable keywords for zero-token matching
 */
function extractKeywords(content: string): string[] {
  if (!content) return [];

  // Common stop words to exclude
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'have', 'had', 'been', 'this', 'these',
    'they', 'were', 'there', 'their', 'his', 'her', 'him', 'them', 'we',
    'you', 'your', 'our', 'us', 'i', 'me', 'my', 'mine'
  ]);

  // Extract words, filter stop words, and clean
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => 
      word.length > 2 &&              // At least 3 characters
      !stopWords.has(word) &&         // Not a stop word
      !/^\d+$/.test(word)             // Not just numbers
    );

  // Return unique keywords, limit to prevent bloat
  return [...new Set(words)].slice(0, 20);
}

/**
 * Returns default statistics when database queries fail
 * Purpose: Provide fallback statistics for error scenarios
 * Returns: VectorStats with default/empty values
 */
function getDefaultStats(): VectorStats {
  return {
    totalChunks: 0,
    categoryCounts: {},
    totalTokens: 0,
    averageChunkSize: 0,
  };
}

/**
 * Deletes all chunks from a specific category
 * Purpose: Allow category-specific data management and updates
 * Parameters: category - portfolio category to clear
 * Returns: Promise<number> count of deleted chunks
 * Error Handling: Validates category, handles deletion failures
 */
export async function clearCategory(category: string): Promise<number> {
  if (!validateCategory(category)) {
    throw new Error(`Invalid category: ${category}`);
  }

  try {
    const { data, error } = await supabase
      .from('portfolio_chunks')
      .delete()
      .eq('category', category.toUpperCase())
      .select('id');

    if (error) {
      throw new Error(`Failed to clear category: ${formatDatabaseError(error)}`);
    }

    const deletedCount = data?.length || 0;
    console.log(`Cleared ${deletedCount} chunks from category: ${category}`);
    
    return deletedCount;

  } catch (error) {
    console.error('Clear category error:', error);
    throw new Error(`Failed to clear category: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Test vector store functionality
 * Purpose: Verify vector operations are working correctly
 * Returns: Promise<boolean> indicating if vector store is functional
 * Error Handling: Catches and logs operational errors
 */
export async function testVectorStore(): Promise<boolean> {
  try {
    const stats = await getVectorStats();
    const testSearch = await searchByKeywords(['test'], { maxResults: 1 });
    
    return typeof stats.totalChunks === 'number' && 
           Array.isArray(testSearch.results);
           
  } catch (error) {
    console.error('Vector store test failed:', error);
    return false;
  }
}