/**
 * Supabase Client Configuration for Portfolio RAG Chatbot
 * Purpose: Provides type-safe database client and interfaces for vector operations
 * Key Methods: createClient(), type definitions for all database operations
 * Integration: Used by vectorstore.ts and other database-dependent services
 */

import { createClient } from '@supabase/supabase-js';

// Type definitions for portfolio chunk data structure
export interface PortfolioChunk {
  id: string;
  content: string;                    // The actual text content
  category: string;                   // BIO, SKILLS, PROJECTS, etc.
  subcategory?: string;               // Optional: specific project name, skill area
  keywords: string[];                 // Extracted keywords for fast matching
  embedding: number[];                // 768-dimension vector from Gemini
  chunk_order: number;                // Order within original document
  importance_score: number;           // Relevance weight (1.0 = normal, >1.0 = important)
  token_count: number;                // Estimated tokens for cost tracking
  source_file?: string;               // Original file name
  created_at: string;
  updated_at: string;
}

// Search result interface with similarity scoring
export interface SearchResult extends Omit<PortfolioChunk, 'embedding'> {
  similarity: number;                 // Cosine similarity score (0-1)
}

// Database function parameter types
export interface CategorySearchParams {
  query_embedding: number[];          // 768-dimension query vector
  category_filter: string;            // Target category to search within
  match_threshold?: number;           // Minimum similarity (default: 0.5)
  match_count?: number;               // Maximum results (default: 5)
}

export interface FullSearchParams {
  query_embedding: number[];          // 768-dimension query vector
  match_threshold?: number;           // Minimum similarity (default: 0.4)
  match_count?: number;               // Maximum results (default: 8)
}

export interface KeywordSearchParams {
  search_keywords: string[];          // Keywords to match against
  match_count?: number;               // Maximum results (default: 3)
}

// Portfolio statistics interface
export interface PortfolioStats {
  category: string;
  chunk_count: number;
  total_tokens: number;
  avg_similarity_threshold: number;
}

// Database response types for RPC functions
export interface Database {
  public: {
    Functions: {
      search_portfolio_by_category: {
        Args: CategorySearchParams;
        Returns: SearchResult[];
      };
      search_portfolio_full: {
        Args: FullSearchParams;
        Returns: SearchResult[];
      };
      search_portfolio_by_keywords: {
        Args: KeywordSearchParams;
        Returns: Omit<SearchResult, 'similarity'>[];
      };
      get_portfolio_stats: {
        Args: {};
        Returns: PortfolioStats[];
      };
    };
    Tables: {
      portfolio_chunks: {
        Row: PortfolioChunk;
        Insert: Omit<PortfolioChunk, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PortfolioChunk, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

/**
 * Creates and configures the Supabase client
 * Purpose: Establish type-safe connection to Supabase with proper error handling
 * Returns: Configured Supabase client with Database typing
 * Error Handling: Validates required environment variables
 */
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,      // Disable session persistence for API routes
    },
    realtime: {
      params: {
        eventsPerSecond: 1,       // Limit realtime events for cost optimization
      },
    },
  });
}

// Export singleton client instance
export const supabase = createSupabaseClient();

/**
 * Validates vector embedding dimensions
 * Purpose: Ensure embeddings match expected 768-dimension format
 * Parameters: embedding - number array to validate
 * Returns: boolean indicating if embedding is valid
 * Error Handling: Checks array length and numeric values
 */
export function validateEmbedding(embedding: number[]): boolean {
  if (!Array.isArray(embedding)) {
    return false;
  }
  
  if (embedding.length !== 768) {
    return false;
  }
  
  return embedding.every(value => typeof value === 'number' && !isNaN(value));
}

/**
 * Validates portfolio category
 * Purpose: Ensure category matches allowed portfolio sections
 * Parameters: category - string to validate
 * Returns: boolean indicating if category is valid
 * Optimization: Prevents invalid queries that would waste tokens
 */
export function validateCategory(category: string): boolean {
  const validCategories = [
    'BIO',
    'CONTACT', 
    'EDUCATION',
    'EXPERIENCE',
    'SKILLS',
    'PROJECTS',
    'ACHIEVEMENTS',
    'LEADERSHIP',
    'INTERESTS'
  ];
  
  return validCategories.includes(category.toUpperCase());
}

/**
 * Formats database errors for client consumption
 * Purpose: Provide consistent error handling across the application
 * Parameters: error - unknown error object from database operations
 * Returns: formatted error message string
 * Error Handling: Safely extracts error messages with fallbacks
 */
export function formatDatabaseError(error: unknown): string {
  if (error instanceof Error) {
    return `Database error: ${error.message}`;
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return `Database error: ${(error as any).message}`;
  }
  
  return 'An unexpected database error occurred';
}

/**
 * Test database connection
 * Purpose: Verify Supabase connection and basic functionality
 * Returns: Promise<boolean> indicating connection success
 * Error Handling: Catches and logs connection errors
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('portfolio_chunks')
      .select('count', { count: 'exact', head: true });
    
    return !error;
  } catch (error) {
    console.error('Supabase connection test failed:', formatDatabaseError(error));
    return false;
  }
}