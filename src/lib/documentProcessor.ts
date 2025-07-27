/**
 * Document Processor for Portfolio RAG Chatbot
 * Purpose: Parse labeled portfolio data into optimized, searchable chunks
 * Key Methods: processLabeledDocument(), mapLabelToCategory(), extractKeywords()
 * Integration: Prepares data for vectorstore.ts storage operations
 * Optimization: Creates semantic chunks with proper categorization for efficient search
 */

import { StoreChunkParams } from './vectorstore';
import { estimateTokenCount } from './gemini';

// Type definitions for document processing
export interface LabeledSection {
  label: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

export interface ProcessingOptions {
  maxChunkSize?: number;              // Maximum tokens per chunk
  chunkOverlap?: number;              // Overlap between adjacent chunks
  minChunkSize?: number;              // Minimum tokens per chunk
  prioritySections?: string[];        // Sections to mark as high importance
  sourceFile?: string;                // Source filename for tracking
}

export interface ProcessingResult {
  chunks: StoreChunkParams[];
  totalChunks: number;
  totalTokens: number;
  categoryDistribution: Record<string, number>;
  processingErrors: string[];
}

// Label to category mapping for portfolio organization
const LABEL_CATEGORY_MAP: Record<string, string> = {
  // Personal Information
  'BIO': 'BIO',
  'ABOUT': 'BIO',
  'BACKGROUND': 'BIO',
  'PERSONAL': 'BIO',
  'INTRO': 'BIO',
  'INTRODUCTION': 'BIO',
  
  // Contact Information
  'CONTACT': 'CONTACT',
  'REACH': 'CONTACT',
  'EMAIL': 'CONTACT',
  'PHONE': 'CONTACT',
  'SOCIAL': 'CONTACT',
  'LINKEDIN': 'CONTACT',
  'GITHUB': 'CONTACT',
  
  // Education
  'EDUCATION': 'EDUCATION',
  'SCHOOL': 'EDUCATION',
  'COLLEGE': 'EDUCATION',
  'UNIVERSITY': 'EDUCATION',
  'DEGREE': 'EDUCATION',
  'ACADEMIC': 'EDUCATION',
  
  // Professional Experience
  'EXPERIENCE': 'EXPERIENCE',
  'WORK': 'EXPERIENCE',
  'JOB': 'EXPERIENCE',
  'EMPLOYMENT': 'EXPERIENCE',
  'CAREER': 'EXPERIENCE',
  'INTERN': 'EXPERIENCE',
  'INTERNSHIP': 'EXPERIENCE',
  
  // Technical Skills
  'SKILLS': 'SKILLS',
  'TECHNICAL': 'SKILLS',
  'TECH': 'SKILLS',
  'PROGRAMMING': 'SKILLS',
  'LANGUAGES': 'SKILLS',
  'TOOLS': 'SKILLS',
  'TECHNOLOGIES': 'SKILLS',
  
  // Projects
  'PROJECTS': 'PROJECTS',
  'PROJECT': 'PROJECTS',
  'BUILD': 'PROJECTS',
  'CREATED': 'PROJECTS',
  'DEVELOPED': 'PROJECTS',
  'PORTFOLIO': 'PROJECTS',
  
  // Achievements
  'ACHIEVEMENTS': 'ACHIEVEMENTS',
  'AWARDS': 'ACHIEVEMENTS',
  'HONORS': 'ACHIEVEMENTS',
  'RECOGNITION': 'ACHIEVEMENTS',
  'ACCOMPLISHMENTS': 'ACHIEVEMENTS',
  
  // Leadership
  'LEADERSHIP': 'LEADERSHIP',
  'LEAD': 'LEADERSHIP',
  'VOLUNTEER': 'LEADERSHIP',
  'ORGANIZATIONS': 'LEADERSHIP',
  'ACTIVITIES': 'LEADERSHIP',
  
  // Interests
  'INTERESTS': 'INTERESTS',
  'HOBBIES': 'INTERESTS',
  'PERSONAL_INTERESTS': 'INTERESTS',
  'OUTSIDE_WORK': 'INTERESTS',
};

// High-priority sections that should be marked for better search ranking
const HIGH_PRIORITY_LABELS = new Set([
  'BIO', 'ABOUT', 'SKILLS', 'EXPERIENCE', 'PROJECTS', 'CONTACT'
]);

/**
 * Processes labeled portfolio document into optimized chunks
 * Purpose: Main processing function that converts labeled text into vector-ready chunks
 * Parameters: document - labeled portfolio text, options - processing configuration
 * Returns: Promise<ProcessingResult> with processed chunks and metadata
 * Error Handling: Validates input format, handles malformed sections gracefully
 * Optimization: Creates semantic chunks optimized for category-based search
 */
export async function processLabeledDocument(
  document: string,
  options: ProcessingOptions = {}
): Promise<ProcessingResult> {
  const {
    maxChunkSize = 300,        // ~300 tokens per chunk for optimal retrieval
    chunkOverlap = 50,         // 50 token overlap for context preservation
    minChunkSize = 50,         // Minimum viable chunk size
    prioritySections = [],     // Additional priority sections
    sourceFile = 'portfolio_data'
  } = options;

  console.log('Processing labeled portfolio document...');
  
  const processingErrors: string[] = [];
  const chunks: StoreChunkParams[] = [];
  const categoryDistribution: Record<string, number> = {};
  let totalTokens = 0;

  try {
    // Extract labeled sections from document
    const sections = extractLabeledSections(document);
    
    if (sections.length === 0) {
      throw new Error('No labeled sections found in document. Expected format: [LABEL] content');
    }

    console.log(`Found ${sections.length} labeled sections`);

    // Process each section
    for (const section of sections) {
      try {
        const category = mapLabelToCategory(section.label);
        if (!category) {
          processingErrors.push(`Unknown label: ${section.label}`);
          continue;
        }

        // Determine importance score
        const allPriorityLabels = new Set([...HIGH_PRIORITY_LABELS, ...prioritySections]);
        const importanceScore = allPriorityLabels.has(section.label.toUpperCase()) ? 1.5 : 1.0;

        // Split section into chunks if needed
        const sectionChunks = createOptimalChunks(
          section.content,
          maxChunkSize,
          chunkOverlap,
          minChunkSize
        );

        // Process each chunk
        for (let i = 0; i < sectionChunks.length; i++) {
          const chunkContent = sectionChunks[i];
          const tokenCount = estimateTokenCount(chunkContent);
          
          if (tokenCount < minChunkSize) {
            continue; // Skip chunks that are too small
          }

          // Extract keywords for fast matching
          const keywords = extractSemanticKeywords(chunkContent, section.label);

          // Create subcategory for multi-chunk sections
          const subcategory = sectionChunks.length > 1 
            ? `${section.label.toLowerCase()}_part_${i + 1}`
            : section.label.toLowerCase();

          const chunk: StoreChunkParams = {
            content: chunkContent.trim(),
            category,
            subcategory,
            keywords,
            importance_score: importanceScore,
            source_file: sourceFile,
          };

          chunks.push(chunk);
          totalTokens += tokenCount;

          // Update category distribution
          categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
        }

      } catch (error) {
        const errorMsg = `Error processing section [${section.label}]: ${error instanceof Error ? error.message : 'Unknown error'}`;
        processingErrors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(`Document processing complete: ${chunks.length} chunks created`);
    
    return {
      chunks,
      totalChunks: chunks.length,
      totalTokens,
      categoryDistribution,
      processingErrors,
    };

  } catch (error) {
    const errorMsg = `Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Extracts labeled sections from formatted document
 * Purpose: Parse [LABEL] formatted text into structured sections
 * Parameters: document - text with [LABEL] markers
 * Returns: array of LabeledSection objects
 * Error Handling: Handles malformed labels, overlapping sections
 * Optimization: Efficient regex-based parsing with position tracking
 */
export function extractLabeledSections(document: string): LabeledSection[] {
  if (!document || document.trim().length === 0) {
    return [];
  }

  const sections: LabeledSection[] = [];
  
  // Regex to match [LABEL] patterns at start of lines or after whitespace
  const labelRegex = /(?:^|\s)\[([A-Z_]+)\]/gm;
  let match;
  const labelPositions: Array<{label: string, start: number, end: number}> = [];

  // Find all label positions
  while ((match = labelRegex.exec(document)) !== null) {
    labelPositions.push({
      label: match[1],
      start: match.index + match[0].indexOf('['),
      end: match.index + match[0].length,
    });
  }

  if (labelPositions.length === 0) {
    return [];
  }

  // Extract content between labels
  for (let i = 0; i < labelPositions.length; i++) {
    const currentLabel = labelPositions[i];
    const nextLabel = labelPositions[i + 1];
    
    // Content starts after the current label
    const contentStart = currentLabel.end;
    
    // Content ends at the next label or end of document
    const contentEnd = nextLabel ? nextLabel.start : document.length;
    
    const content = document.substring(contentStart, contentEnd).trim();
    
    if (content.length > 0) {
      sections.push({
        label: currentLabel.label,
        content,
        startIndex: contentStart,
        endIndex: contentEnd,
      });
    }
  }

  return sections;
}

/**
 * Maps section labels to standardized categories
 * Purpose: Convert various label formats to consistent portfolio categories
 * Parameters: label - section label to map
 * Returns: standardized category string or null if unknown
 * Optimization: Fast lookup using pre-defined mapping table
 */
export function mapLabelToCategory(label: string): string | null {
  if (!label) return null;
  
  const normalizedLabel = label.toUpperCase().trim();
  return LABEL_CATEGORY_MAP[normalizedLabel] || null;
}

/**
 * Creates optimal chunks from content while preserving semantic boundaries
 * Purpose: Split large content into search-optimized chunks with context preservation
 * Parameters: content - text to chunk, maxSize - max tokens per chunk, overlap - overlap tokens, minSize - min chunk size
 * Returns: array of content chunks
 * Error Handling: Handles edge cases like very short content
 * Optimization: Respects sentence boundaries for better semantic coherence
 */
function createOptimalChunks(
  content: string,
  maxSize: number,
  overlap: number,
  minSize: number
): string[] {
  if (!content || content.trim().length === 0) {
    return [];
  }

  const estimatedTokens = estimateTokenCount(content);
  
  // If content is small enough, return as single chunk
  if (estimatedTokens <= maxSize) {
    return [content.trim()];
  }

  const chunks: string[] = [];
  
  // Split into sentences for better semantic boundaries
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let currentTokens = 0;
  
  for (const sentence of sentences) {
    const sentenceTokens = estimateTokenCount(sentence);
    
    // If adding this sentence would exceed max size, finalize current chunk
    if (currentTokens + sentenceTokens > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap from previous chunk
      const overlapText = getLastWords(currentChunk, overlap);
      currentChunk = overlapText + ' ' + sentence;
      currentTokens = estimateTokenCount(currentChunk);
    } else {
      // Add sentence to current chunk
      currentChunk += (currentChunk ? '. ' : '') + sentence;
      currentTokens += sentenceTokens;
    }
  }
  
  // Add final chunk if it meets minimum size
  if (currentChunk.trim().length > 0 && estimateTokenCount(currentChunk) >= minSize) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [content.trim()];
}

/**
 * Extracts semantic keywords optimized for portfolio search
 * Purpose: Generate high-quality keywords for exact matching and search optimization
 * Parameters: content - text to extract keywords from, sectionLabel - context label
 * Returns: array of extracted keywords
 * Error Handling: Handles empty content, filters invalid keywords
 * Optimization: Uses section context to prioritize relevant terms
 */
function extractSemanticKeywords(content: string, sectionLabel: string): string[] {
  if (!content) return [];

  const keywords = new Set<string>();
  
  // Add section-specific keywords
  keywords.add(sectionLabel.toLowerCase());
  
  // Common portfolio terms that should always be searchable
  const portfolioTerms = [
    'react', 'javascript', 'python', 'node', 'express', 'mongodb', 'sql', 'postgresql',
    'nextjs', 'tailwind', 'css', 'html', 'typescript', 'git', 'github', 'api', 'rest',
    'frontend', 'backend', 'fullstack', 'web', 'mobile', 'app', 'application',
    'intern', 'internship', 'project', 'experience', 'work', 'job', 'developer',
    'engineering', 'software', 'computer', 'science', 'university', 'college',
    'marvin', 'romero', 'portfolio', 'resume', 'contact', 'email', 'hire', 'available'
  ];

  // Extract technical terms and technologies
  const techPattern = /\b(?:react|vue|angular|node|python|java|javascript|typescript|css|html|sql|mongodb|postgresql|mysql|redis|aws|docker|kubernetes|git|github|api|rest|graphql|nextjs|express|flask|django|tailwind|bootstrap)\b/gi;
  const techMatches = content.match(techPattern) || [];
  techMatches.forEach(tech => keywords.add(tech.toLowerCase()));

  // Extract proper nouns (likely company names, technologies, etc.)
  const properNounPattern = /\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\b/g;
  const properNouns = content.match(properNounPattern) || [];
  properNouns.forEach(noun => {
    if (noun.length > 2 && noun.length < 20) {
      keywords.add(noun.toLowerCase());
    }
  });

  // Add relevant portfolio terms that appear in content
  const contentLower = content.toLowerCase();
  portfolioTerms.forEach(term => {
    if (contentLower.includes(term)) {
      keywords.add(term);
    }
  });

  // Extract years (for experience dating)
  const yearPattern = /\b(19|20)\d{2}\b/g;
  const years = content.match(yearPattern) || [];
  years.forEach(year => keywords.add(year));

  // Common action words for experience
  const actionWords = ['developed', 'built', 'created', 'designed', 'implemented', 'managed', 'led', 'collaborated'];
  actionWords.forEach(word => {
    if (contentLower.includes(word)) {
      keywords.add(word);
    }
  });

  // Convert to array and limit size
  return Array.from(keywords).slice(0, 25);
}

/**
 * Gets last N words from text for chunk overlap
 * Purpose: Create semantic overlap between chunks for context preservation
 * Parameters: text - source text, tokenCount - approximate number of tokens to extract
 * Returns: string with last N words
 * Optimization: Maintains context across chunk boundaries
 */
function getLastWords(text: string, tokenCount: number): string {
  if (!text || tokenCount <= 0) return '';
  
  const words = text.trim().split(/\s+/);
  const wordCount = Math.ceil(tokenCount / 1.3); // Rough conversion from tokens to words
  
  if (words.length <= wordCount) {
    return text;
  }
  
  return words.slice(-wordCount).join(' ');
}

/**
 * Validates document format before processing
 * Purpose: Check if document follows expected [LABEL] format
 * Parameters: document - text to validate
 * Returns: validation result with errors
 * Error Handling: Provides specific feedback on format issues
 */
export function validateDocumentFormat(document: string): {isValid: boolean, errors: string[]} {
  const errors: string[] = [];
  
  if (!document || document.trim().length === 0) {
    errors.push('Document is empty');
    return { isValid: false, errors };
  }

  // Check for at least one label
  const labelPattern = /\[([A-Z_]+)\]/;
  if (!labelPattern.test(document)) {
    errors.push('No labels found. Expected format: [LABEL] content');
  }

  // Check for required sections
  const requiredLabels = ['BIO', 'CONTACT', 'SKILLS'];
  const foundLabels = new Set();
  
  const labelMatches = document.match(/\[([A-Z_]+)\]/g);
  if (labelMatches) {
    labelMatches.forEach(match => {
      const label = match.replace(/[\[\]]/g, '');
      foundLabels.add(label);
    });
  }

  requiredLabels.forEach(required => {
    if (!foundLabels.has(required)) {
      errors.push(`Missing required section: [${required}]`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Test document processor functionality
 * Purpose: Verify document processing is working correctly
 * Returns: Promise<boolean> indicating if processor is functional
 * Error Handling: Catches and logs processing errors
 */
export async function testDocumentProcessor(): Promise<boolean> {
  try {
    const testDocument = `
[BIO]
Marvin Romero is a software developer.

[SKILLS]
JavaScript, React, Node.js

[CONTACT]
Email: test@example.com
    `;

    const result = await processLabeledDocument(testDocument, {
      maxChunkSize: 100,
      sourceFile: 'test_document'
    });

    return result.chunks.length > 0 && result.processingErrors.length === 0;
    
  } catch (error) {
    console.error('Document processor test failed:', error);
    return false;
  }
}