/**
 * Essay Parser - Extracts text content, tokenizes, and normalizes keywords
 * Supports plain text essay content
 */

import { EssayContent } from '../models/types';

/**
 * Normalizes text by trimming and converting to lowercase
 * @param text - The text to normalize
 * @returns Normalized text
 */
function normalizeText(text: string): string {
  return text.trim().toLowerCase();
}

/**
 * Tokenizes essay text into words
 * Removes punctuation and empty tokens
 * @param text - The text to tokenize
 * @returns Array of word tokens
 */
export function tokenizeWords(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Split by whitespace and punctuation, filter empty strings
  const tokens = text
    .split(/[\s\p{P}]+/u) // Split on whitespace and punctuation (including Unicode)
    .map(token => normalizeText(token))
    .filter(token => token.length > 0);

  return tokens;
}

/**
 * Splits essay text into sentences
 * Handles common sentence delimiters
 * @param text - The text to split
 * @returns Array of sentences
 */
export function tokenizeSentences(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Split on sentence boundaries (. ! ? followed by space or end of string)
  const sentences = text
    .split(/[.!?]+(?=\s|$)/u)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);

  return sentences;
}

/**
 * Extracts and normalizes keywords from essay text
 * Keywords are significant words (typically nouns, verbs, adjectives)
 * Filters out common stop words
 * @param text - The text to extract keywords from
 * @returns Array of normalized keywords
 */
export function extractKeywords(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Common English stop words to filter out
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that',
    'the', 'to', 'was', 'will', 'with', 'this', 'but', 'they', 'have',
    'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how', 'all',
    'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'can', 'just', 'should', 'now', 'i', 'you', 'we', 'me', 'him', 'her',
    'us', 'them', 'my', 'your', 'our', 'their', 'am', 'being', 'been', 'over'
  ]);

  // Tokenize into words
  const tokens = tokenizeWords(text);

  // Filter out stop words and return unique keywords
  const keywords = tokens.filter(token => !stopWords.has(token));

  // Return unique keywords while preserving order
  const uniqueKeywords: string[] = [];
  const seen = new Set<string>();

  for (const keyword of keywords) {
    if (!seen.has(keyword)) {
      uniqueKeywords.push(keyword);
      seen.add(keyword);
    }
  }

  return uniqueKeywords;
}

/**
 * Validates that essay content is not empty
 * @param text - The text to validate
 * @returns true if essay has content, false otherwise
 */
export function isValidEssayContent(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Check if there's at least some non-whitespace content
  return text.trim().length > 0;
}

/**
 * Parses an essay from text content
 * Extracts raw text, tokenizes into words and sentences, extracts keywords
 * @param essayText - Raw essay text
 * @returns Parsed EssayContent
 * @throws Error if essay format is invalid or empty
 */
export function parseEssay(essayText: string): EssayContent {
  // Validate input type
  if (typeof essayText !== 'string') {
    throw new Error('Essay text must be a non-empty string');
  }

  // Validate content
  if (!isValidEssayContent(essayText)) {
    throw new Error('Essay content cannot be empty');
  }

  // Extract raw text
  const rawText = essayText.trim();

  // Tokenize into words
  const tokens = tokenizeWords(rawText);

  // Tokenize into sentences
  const sentences = tokenizeSentences(rawText);

  return {
    rawText,
    tokens,
    sentences
  };
}

/**
 * Gets the word count of an essay
 * @param essay - The parsed essay content
 * @returns Number of words
 */
export function getWordCount(essay: EssayContent): number {
  return essay.tokens.length;
}

/**
 * Gets the sentence count of an essay
 * @param essay - The parsed essay content
 * @returns Number of sentences
 */
export function getSentenceCount(essay: EssayContent): number {
  return essay.sentences.length;
}

/**
 * Calculates average words per sentence
 * @param essay - The parsed essay content
 * @returns Average words per sentence
 */
export function getAverageWordsPerSentence(essay: EssayContent): number {
  if (essay.sentences.length === 0) {
    return 0;
  }

  return essay.tokens.length / essay.sentences.length;
}
