// Vector Store Operations for Portfolio RAG Chatbot

import { supabase, PortfolioChunk, SearchResult, validateEmbedding, validateCategory, formatDatabaseError } from './supabase';
import { generateEmbedding, estimateTokenCount } from './gemini';

export interface StoreChunkParams {
  content: string;
  category: string;
  subcategory?: string;
  keywords?: string[];
  importance_score?: number;
  source_file?: string;
}

export interface SearchOptions {
  category?: string;
  threshold?: number;
  maxResults?: number;
  includeEmbedding?: boolean;
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

export async function storeChunks(chunks: StoreChunkParams[]): Promise<number> {
  if (!chunks || chunks.length === 0) {
    throw new Error('No chunks provided for storage');
  }

  let successCount = 0;
  const batchSize = 10;
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    
    try {
      // Generate embeddings for batch
      const embeddingPromises = batch.map(async (chunk, index) => {
        try {
          if (!chunk.content || chunk.content.trim().length === 0) {
            throw new Error(`Empty content in chunk ${i + index}`);
          }
          
          if (!validateCategory(chunk.category)) {
            throw new Error(`Invalid category "${chunk.category}" in chunk ${i + index}`);
          }

          const embeddingResponse = await generateEmbedding(chunk.content);
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
          return null;
        }
      });

      const processedChunks = await Promise.all(embeddingPromises);
      const validChunks = processedChunks.filter(chunk => chunk !== null);

      if (validChunks.length === 0) {
        continue;
      }
      const { data, error } = await supabase
        .from('portfolio_chunks')
        .insert(validChunks)
        .select('id');

      if (error) {
        console.error(`Database error for batch ${Math.floor(i / batchSize) + 1}:`, error);
        continue;
      }

      const batchSuccessCount = data?.length || 0;
      successCount += batchSuccessCount;
      
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

    } catch (error) {
      console.error(`Failed to process batch ${Math.floor(i / batchSize) + 1}:`, formatDatabaseError(error));
      continue;
    }
  }

  return successCount;
}

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
    const embeddingResponse = await generateEmbedding(query);
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

export async function searchAll(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const startTime = Date.now();
  
  if (!query || query.trim().length === 0) {
    throw new Error('Query is required for search');
  }

  const {
    threshold = 0.4,
    maxResults = 8,
  } = options;

  try {
    const embeddingResponse = await generateEmbedding(query);
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

export async function searchByKeywords(
  keywords: string[],
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const startTime = Date.now();
  
  if (!keywords || keywords.length === 0) {
    throw new Error('Keywords are required for keyword search');
  }

  const { maxResults = 3 } = options;

  const cleanKeywords = keywords
    .map(kw => kw.trim().toLowerCase())
    .filter(kw => kw.length > 0);

  if (cleanKeywords.length === 0) {
    throw new Error('No valid keywords provided');
  }

  try {
    const { data, error } = await supabase.rpc('search_portfolio_by_keywords', {
      search_keywords: cleanKeywords,
      match_count: maxResults,
    });

    if (error) {
      throw new Error(`Keyword search failed: ${formatDatabaseError(error)}`);
    }

    const results = data || [];
    const executionTime = Date.now() - startTime;

    const searchResults: SearchResult[] = results.map(result => ({
      ...result,
      similarity: 1.0,
    }));

    return {
      results: searchResults,
      totalResults: results.length,
      searchType: 'keyword',
      tokensUsed: 0,
      executionTime,
    };

  } catch (error) {
    console.error('Keyword search error:', error);
    throw new Error(`Keyword search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getVectorStats(): Promise<VectorStats> {
  try {
    const { data: statsData, error: statsError } = await supabase.rpc('get_portfolio_stats');
    
    if (statsError) {
      console.error('Stats query error:', statsError);
      return getDefaultStats();
    }

    if (!statsData || statsData.length === 0) {
      return getDefaultStats();
    }

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

function extractKeywords(content: string): string[] {
  if (!content) return [];

  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'have', 'had', 'been', 'this', 'these',
    'they', 'were', 'there', 'their', 'his', 'her', 'him', 'them', 'we',
    'you', 'your', 'our', 'us', 'i', 'me', 'my', 'mine'
  ]);

  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 2 &&
      !stopWords.has(word) &&
      !/^\d+$/.test(word)
    );

  return [...new Set(words)].slice(0, 20);
}

function getDefaultStats(): VectorStats {
  return {
    totalChunks: 0,
    categoryCounts: {},
    totalTokens: 0,
    averageChunkSize: 0,
  };
}

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
    return deletedCount;

  } catch (error) {
    console.error('Clear category error:', error);
    throw new Error(`Failed to clear category: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

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