/**
 * Essay Evaluator - Evaluates student essays against model essays
 * Uses NLP-based analysis for content evaluation
 */

import { EssayContent, EssayBreakdown } from '../models/types';
import { extractKeywords, getWordCount } from '../parsers/essayParser';
import { normalizeScore } from '../utils/scoreUtils';

/**
 * Represents the result of essay evaluation
 */
export interface EssayEvaluationResult {
  score: number;
  breakdown: EssayBreakdown;
}

/**
 * Validates that a score is within the valid range [0, 100]
 * @param score - The score to validate
 * @returns true if score is valid, false otherwise
 */
export function isValidScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100;
}

/**
 * Calculates keyword coverage score
 * Compares keywords found in student essay against model essay keywords
 * @param studentKeywords - Keywords extracted from student essay
 * @param modelKeywords - Keywords extracted from model essay
 * @returns Score between 0 and 100
 */
export function calculateKeywordCoverage(studentKeywords: string[], modelKeywords: string[]): number {
  if (modelKeywords.length === 0) {
    return studentKeywords.length === 0 ? 100 : 0;
  }

  // Create a set of student keywords for efficient lookup
  const studentKeywordSet = new Set(studentKeywords.map(k => k.toLowerCase()));

  // Count how many model keywords are present in student keywords
  let matchCount = 0;
  for (const keyword of modelKeywords) {
    if (studentKeywordSet.has(keyword.toLowerCase())) {
      matchCount++;
    }
  }

  // Calculate coverage as percentage of model keywords found
  const coverage = (matchCount / modelKeywords.length) * 100;
  return normalizeScore(coverage);
}

/**
 * Calculates term frequency score
 * Analyzes how frequently key terms appear in the student essay
 * @param studentEssay - The student's parsed essay
 * @param modelKeywords - Keywords from the model essay
 * @returns Score between 0 and 100
 */
export function calculateTermFrequency(studentEssay: EssayContent, modelKeywords: string[]): number {
  if (modelKeywords.length === 0) {
    return 100;
  }

  // Count occurrences of model keywords in student essay tokens
  let totalOccurrences = 0;
  const modelKeywordSet = new Set(modelKeywords.map(k => k.toLowerCase()));

  for (const token of studentEssay.tokens) {
    if (modelKeywordSet.has(token.toLowerCase())) {
      totalOccurrences++;
    }
  }

  // Calculate average frequency per keyword
  const averageFrequency = totalOccurrences / modelKeywords.length;

  // Score based on frequency: 0 occurrences = 0, 1+ occurrences = 100
  // This encourages at least one mention of each key term
  const score = Math.min(100, averageFrequency * 100);
  return normalizeScore(score);
}

/**
 * Calculates content length score
 * Validates that the essay has sufficient length
 * @param studentEssay - The student's parsed essay
 * @returns Score between 0 and 100
 */
export function calculateContentLength(studentEssay: EssayContent): number {
  const wordCount = getWordCount(studentEssay);

  // Minimum expected word count for a complete essay
  const minimumWords = 50;
  // Optimal word count range
  const optimalWords = 300;

  if (wordCount < minimumWords) {
    // Score decreases linearly from 0 to minimumWords
    const score = (wordCount / minimumWords) * 100;
    return normalizeScore(score);
  }

  if (wordCount <= optimalWords) {
    // Full score for essays in optimal range
    return 100;
  }

  // Essays longer than optimal still get good scores, but slightly penalized
  // Score decreases gradually for very long essays
  const excessWords = wordCount - optimalWords;
  const penaltyPerWord = 0.1; // 0.1 points per word over optimal
  const score = Math.max(0, 100 - (excessWords * penaltyPerWord));
  return normalizeScore(score);
}

/**
 * Evaluates a student essay against a model essay
 * Compares keywords, term frequency, and content length
 * Produces a combined essay score using weighted components
 * @param studentEssay - The student's parsed essay
 * @param modelEssay - The model/reference essay
 * @returns EssayEvaluationResult with score and breakdown
 */
export function evaluateEssay(studentEssay: EssayContent, modelEssay: EssayContent): EssayEvaluationResult {
  // Extract keywords from both essays
  const studentKeywords = extractKeywords(studentEssay.rawText);
  const modelKeywords = extractKeywords(modelEssay.rawText);

  // Calculate component scores
  const keywordCoverage = calculateKeywordCoverage(studentKeywords, modelKeywords);
  const termFrequency = calculateTermFrequency(studentEssay, modelKeywords);
  const contentLength = calculateContentLength(studentEssay);

  // Calculate weighted essay score
  // 50% keyword coverage + 30% term frequency + 20% content length
  const essayScore = (keywordCoverage * 0.5) + (termFrequency * 0.3) + (contentLength * 0.2);

  // Ensure final score is within valid range
  const finalScore = normalizeScore(essayScore);

  return {
    score: finalScore,
    breakdown: {
      keywordCoverage,
      termFrequency,
      contentLength
    }
  };
}
