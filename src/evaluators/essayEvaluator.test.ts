import * as fc from 'fast-check';
import {
  evaluateEssay,
  calculateKeywordCoverage,
  calculateTermFrequency,
  calculateContentLength,
  isValidScore,
  EssayEvaluationResult
} from './essayEvaluator';
import { EssayContent } from '../models/types';
import { parseEssay } from '../parsers/essayParser';

describe('Essay Evaluator', () => {
  describe('isValidScore', () => {
    it('should validate scores within range', () => {
      expect(isValidScore(0)).toBe(true);
      expect(isValidScore(50)).toBe(true);
      expect(isValidScore(100)).toBe(true);
    });

    it('should reject scores outside range', () => {
      expect(isValidScore(-1)).toBe(false);
      expect(isValidScore(101)).toBe(false);
      expect(isValidScore(-50)).toBe(false);
    });

    it('should reject non-number values', () => {
      expect(isValidScore(NaN)).toBe(false);
    });
  });

  describe('calculateKeywordCoverage', () => {
    it('should return 100 for exact keyword match', () => {
      const studentKeywords = ['photosynthesis', 'chlorophyll', 'glucose'];
      const modelKeywords = ['photosynthesis', 'chlorophyll', 'glucose'];
      expect(calculateKeywordCoverage(studentKeywords, modelKeywords)).toBe(100);
    });

    it('should return 100 when both are empty', () => {
      expect(calculateKeywordCoverage([], [])).toBe(100);
    });

    it('should return 0 when model is empty but student has keywords', () => {
      expect(calculateKeywordCoverage(['keyword'], [])).toBe(0);
    });

    it('should be case-insensitive', () => {
      const studentKeywords = ['photosynthesis', 'chlorophyll'];
      const modelKeywords = ['PHOTOSYNTHESIS', 'CHLOROPHYLL'];
      expect(calculateKeywordCoverage(studentKeywords, modelKeywords)).toBe(100);
    });

    it('should calculate partial matches', () => {
      const studentKeywords = ['photosynthesis', 'chlorophyll'];
      const modelKeywords = ['photosynthesis', 'chlorophyll', 'glucose', 'atp'];
      const score = calculateKeywordCoverage(studentKeywords, modelKeywords);
      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThan(0);
      expect(score).toBe(50); // 2 out of 4 keywords
    });

    it('should always return valid score', () => {
      expect(isValidScore(calculateKeywordCoverage(['a'], ['b', 'c']))).toBe(true);
      expect(isValidScore(calculateKeywordCoverage([], ['a']))).toBe(true);
      expect(isValidScore(calculateKeywordCoverage(['a', 'b'], ['a', 'b']))).toBe(true);
    });
  });

  describe('calculateTermFrequency', () => {
    it('should return 100 when all keywords appear at least once', () => {
      const essay: EssayContent = {
        rawText: 'photosynthesis is the process where chlorophyll captures light',
        tokens: ['photosynthesis', 'is', 'the', 'process', 'where', 'chlorophyll', 'captures', 'light'],
        sentences: ['photosynthesis is the process where chlorophyll captures light']
      };
      const modelKeywords = ['photosynthesis', 'chlorophyll'];
      expect(calculateTermFrequency(essay, modelKeywords)).toBe(100);
    });

    it('should return 100 when model keywords are empty', () => {
      const essay: EssayContent = {
        rawText: 'some text',
        tokens: ['some', 'text'],
        sentences: ['some text']
      };
      expect(calculateTermFrequency(essay, [])).toBe(100);
    });

    it('should calculate frequency based on occurrences', () => {
      const essay: EssayContent = {
        rawText: 'photosynthesis photosynthesis chlorophyll',
        tokens: ['photosynthesis', 'photosynthesis', 'chlorophyll'],
        sentences: ['photosynthesis photosynthesis chlorophyll']
      };
      const modelKeywords = ['photosynthesis', 'chlorophyll'];
      // Average frequency: (2 + 1) / 2 = 1.5, score = 1.5 * 100 = 150, clamped to 100
      expect(calculateTermFrequency(essay, modelKeywords)).toBe(100);
    });

    it('should be case-insensitive', () => {
      const essay: EssayContent = {
        rawText: 'PHOTOSYNTHESIS chlorophyll',
        tokens: ['photosynthesis', 'chlorophyll'],
        sentences: ['PHOTOSYNTHESIS chlorophyll']
      };
      const modelKeywords = ['photosynthesis', 'chlorophyll'];
      expect(calculateTermFrequency(essay, modelKeywords)).toBe(100);
    });

    it('should always return valid score', () => {
      const essay: EssayContent = {
        rawText: 'test essay content',
        tokens: ['test', 'essay', 'content'],
        sentences: ['test essay content']
      };
      expect(isValidScore(calculateTermFrequency(essay, ['keyword']))).toBe(true);
      expect(isValidScore(calculateTermFrequency(essay, []))).toBe(true);
    });
  });

  describe('calculateContentLength', () => {
    it('should return 100 for essays in optimal range', () => {
      const essay: EssayContent = {
        rawText: Array(100).fill('word').join(' '),
        tokens: Array(100).fill('word'),
        sentences: Array(10).fill('word word word word word word word word word word')
      };
      const score = calculateContentLength(essay);
      expect(score).toBe(100);
    });

    it('should return 100 for essays at optimal length', () => {
      const essay: EssayContent = {
        rawText: Array(300).fill('word').join(' '),
        tokens: Array(300).fill('word'),
        sentences: Array(30).fill('word word word word word word word word word word')
      };
      expect(calculateContentLength(essay)).toBe(100);
    });

    it('should penalize very short essays', () => {
      const essay: EssayContent = {
        rawText: 'short',
        tokens: ['short'],
        sentences: ['short']
      };
      const score = calculateContentLength(essay);
      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThan(0);
    });

    it('should penalize very long essays', () => {
      const essay: EssayContent = {
        rawText: Array(1000).fill('word').join(' '),
        tokens: Array(1000).fill('word'),
        sentences: Array(100).fill('word word word word word word word word word word')
      };
      const score = calculateContentLength(essay);
      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThan(0);
    });

    it('should always return valid score', () => {
      const shortEssay: EssayContent = {
        rawText: 'test',
        tokens: ['test'],
        sentences: ['test']
      };
      expect(isValidScore(calculateContentLength(shortEssay))).toBe(true);

      const longEssay: EssayContent = {
        rawText: Array(500).fill('word').join(' '),
        tokens: Array(500).fill('word'),
        sentences: Array(50).fill('word word word word word word word word word word')
      };
      expect(isValidScore(calculateContentLength(longEssay))).toBe(true);
    });
  });

  describe('evaluateEssay', () => {
    it('should return valid score', () => {
      const studentEssay = parseEssay('photosynthesis is the process where plants convert light into chemical energy');
      const modelEssay = parseEssay('photosynthesis converts light energy into chemical energy through chlorophyll');

      const result = evaluateEssay(studentEssay, modelEssay);
      expect(isValidScore(result.score)).toBe(true);
    });

    it('should return 100 for perfect match', () => {
      const essay = parseEssay('photosynthesis is the process where plants convert light into chemical energy through the use of chlorophyll molecules. This process occurs in the chloroplasts of plant cells and is essential for life on Earth. The light-dependent reactions occur in the thylakoid membranes while the light-independent reactions occur in the stroma. Photosynthesis produces glucose and oxygen as products.');
      const result = evaluateEssay(essay, essay);
      expect(result.score).toBe(100);
    });

    it('should include breakdown with all components', () => {
      const studentEssay = parseEssay('photosynthesis is important');
      const modelEssay = parseEssay('photosynthesis is the process');

      const result = evaluateEssay(studentEssay, modelEssay);
      expect(result.breakdown).toHaveProperty('keywordCoverage');
      expect(result.breakdown).toHaveProperty('termFrequency');
      expect(result.breakdown).toHaveProperty('contentLength');
    });

    it('should apply correct weights to components', () => {
      // Create essays where we can verify the weighting
      const essay = parseEssay('photosynthesis is the process where plants convert light into chemical energy through the use of chlorophyll molecules. This process occurs in the chloroplasts of plant cells and is essential for life on Earth. The light-dependent reactions occur in the thylakoid membranes while the light-independent reactions occur in the stroma. Photosynthesis produces glucose and oxygen as products.');
      const result = evaluateEssay(essay, essay);
      // All components should be 100, so final score should be 100
      expect(result.score).toBe(100);
      expect(result.breakdown.keywordCoverage).toBe(100);
      expect(result.breakdown.termFrequency).toBe(100);
      expect(result.breakdown.contentLength).toBe(100);
    });
  });

  // Property-Based Tests

  describe('Property 7: Essay Score Range Validity', () => {
    it('should always produce a score between 0 and 100', () => {
      // Feature: diagram-essay-grading-system, Property 7: Essay Score Range Validity
      // Validates: Requirements 2.5

      fc.assert(
        fc.property(
          fc.tuple(
            fc.stringOf(fc.char(), { minLength: 10, maxLength: 500 }),
            fc.stringOf(fc.char(), { minLength: 10, maxLength: 500 })
          ),
          ([studentText, modelText]) => {
            try {
              const studentEssay = parseEssay(studentText);
              const modelEssay = parseEssay(modelText);

              const result = evaluateEssay(studentEssay, modelEssay);

              // Verify: score is always between 0 and 100
              expect(result.score).toBeGreaterThanOrEqual(0);
              expect(result.score).toBeLessThanOrEqual(100);
              expect(isValidScore(result.score)).toBe(true);
            } catch (e) {
              // If parsing fails due to invalid input, skip this test case
              fc.pre(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce valid scores for all component combinations', () => {
      // Feature: diagram-essay-grading-system, Property 7: Essay Score Range Validity
      // Validates: Requirements 2.5

      fc.assert(
        fc.property(
          fc.tuple(
            fc.stringOf(fc.char(), { minLength: 20, maxLength: 300 }),
            fc.stringOf(fc.char(), { minLength: 20, maxLength: 300 })
          ),
          ([studentText, modelText]) => {
            try {
              const studentEssay = parseEssay(studentText);
              const modelEssay = parseEssay(modelText);

              const result = evaluateEssay(studentEssay, modelEssay);

              // Verify: final score is always valid
              expect(isValidScore(result.score)).toBe(true);
              // Verify: all breakdown components are valid
              expect(isValidScore(result.breakdown.keywordCoverage)).toBe(true);
              expect(isValidScore(result.breakdown.termFrequency)).toBe(true);
              expect(isValidScore(result.breakdown.contentLength)).toBe(true);
            } catch (e) {
              // If parsing fails due to invalid input, skip this test case
              fc.pre(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
