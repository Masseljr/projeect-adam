import {
  isValidScore,
  normalizeScore,
  calculateWeightedAverage,
  isValidPercentage,
  roundScore
} from './scoreUtils';

describe('Score Utilities', () => {
  describe('isValidScore', () => {
    it('should return true for valid scores', () => {
      expect(isValidScore(0)).toBe(true);
      expect(isValidScore(50)).toBe(true);
      expect(isValidScore(100)).toBe(true);
      expect(isValidScore(75.5)).toBe(true);
    });

    it('should return false for invalid scores', () => {
      expect(isValidScore(-1)).toBe(false);
      expect(isValidScore(101)).toBe(false);
      expect(isValidScore(NaN)).toBe(false);
      expect(isValidScore(Infinity)).toBe(false);
    });

    it('should return false for non-number values', () => {
      expect(isValidScore('50' as any)).toBe(false);
      expect(isValidScore(null as any)).toBe(false);
      expect(isValidScore(undefined as any)).toBe(false);
    });
  });

  describe('normalizeScore', () => {
    it('should return score as-is for valid scores', () => {
      expect(normalizeScore(0)).toBe(0);
      expect(normalizeScore(50)).toBe(50);
      expect(normalizeScore(100)).toBe(100);
    });

    it('should clamp scores below 0 to 0', () => {
      expect(normalizeScore(-10)).toBe(0);
      expect(normalizeScore(-0.1)).toBe(0);
    });

    it('should clamp scores above 100 to 100', () => {
      expect(normalizeScore(101)).toBe(100);
      expect(normalizeScore(150)).toBe(100);
    });

    it('should return 0 for non-finite values', () => {
      expect(normalizeScore(NaN)).toBe(0);
      expect(normalizeScore(Infinity)).toBe(0);
      expect(normalizeScore(-Infinity)).toBe(0);
    });
  });

  describe('calculateWeightedAverage', () => {
    it('should calculate correct weighted average', () => {
      const scores = [80, 60];
      const weights = [0.25, 0.75];
      const result = calculateWeightedAverage(scores, weights);
      expect(result).toBe(65);
    });

    it('should normalize result to [0, 100]', () => {
      const scores = [100, 100];
      const weights = [0.5, 0.5];
      const result = calculateWeightedAverage(scores, weights);
      expect(result).toBe(100);
    });

    it('should handle single score', () => {
      const scores = [75];
      const weights = [1];
      const result = calculateWeightedAverage(scores, weights);
      expect(result).toBe(75);
    });

    it('should throw error for mismatched array lengths', () => {
      const scores = [80, 60];
      const weights = [0.5];
      expect(() => calculateWeightedAverage(scores, weights)).toThrow();
    });

    it('should throw error for zero total weight', () => {
      const scores = [80, 60];
      const weights = [0, 0];
      expect(() => calculateWeightedAverage(scores, weights)).toThrow();
    });

    it('should return 0 for empty arrays', () => {
      expect(calculateWeightedAverage([], [])).toBe(0);
    });
  });

  describe('isValidPercentage', () => {
    it('should validate percentages correctly', () => {
      expect(isValidPercentage(0)).toBe(true);
      expect(isValidPercentage(50)).toBe(true);
      expect(isValidPercentage(100)).toBe(true);
      expect(isValidPercentage(-1)).toBe(false);
      expect(isValidPercentage(101)).toBe(false);
    });
  });

  describe('roundScore', () => {
    it('should round to 2 decimal places by default', () => {
      expect(roundScore(75.556)).toBe(75.56);
      expect(roundScore(75.554)).toBe(75.55);
    });

    it('should round to specified decimal places', () => {
      expect(roundScore(75.5555, 1)).toBe(75.6);
      expect(roundScore(75.5555, 3)).toBe(75.556);
    });

    it('should handle whole numbers', () => {
      expect(roundScore(75, 2)).toBe(75);
    });
  });
});
