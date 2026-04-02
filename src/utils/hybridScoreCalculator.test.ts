import { calculateHybridScore, DEFAULT_WEIGHTS } from './hybridScoreCalculator';
import fc from 'fast-check';

describe('Hybrid Score Calculator', () => {
  describe('calculateHybridScore', () => {
    it('should calculate correct hybrid score with default weights', () => {
      // 25% of 80 + 75% of 60 = 20 + 45 = 65
      const result = calculateHybridScore(80, 60);
      expect(result).toBe(65);
    });

    it('should calculate correct hybrid score with custom weights', () => {
      // 50% of 80 + 50% of 60 = 40 + 30 = 70
      const result = calculateHybridScore(80, 60, 0.5, 0.5);
      expect(result).toBe(70);
    });

    it('should handle equal scores', () => {
      const result = calculateHybridScore(75, 75);
      expect(result).toBe(75);
    });

    it('should handle boundary scores', () => {
      expect(calculateHybridScore(0, 0)).toBe(0);
      expect(calculateHybridScore(100, 100)).toBe(100);
      expect(calculateHybridScore(0, 100)).toBe(75);
      expect(calculateHybridScore(100, 0)).toBe(25);
    });

    it('should throw error for non-number scores', () => {
      expect(() => calculateHybridScore('80' as any, 60)).toThrow();
      expect(() => calculateHybridScore(80, '60' as any)).toThrow();
    });

    it('should throw error for non-number weights', () => {
      expect(() => calculateHybridScore(80, 60, '0.25' as any, 0.75)).toThrow();
      expect(() => calculateHybridScore(80, 60, 0.25, '0.75' as any)).toThrow();
    });

    it('should throw error for zero total weight', () => {
      expect(() => calculateHybridScore(80, 60, 0, 0)).toThrow();
    });

    it('should normalize scores outside [0, 100]', () => {
      // Negative scores should be clamped to 0
      // 0 * 0.25 + 60 * 0.75 = 45
      expect(calculateHybridScore(-10, 60)).toBe(45);
      // Scores above 100 should be clamped to 100
      // 100 * 0.25 + 60 * 0.75 = 25 + 45 = 70
      expect(calculateHybridScore(150, 60)).toBe(70);
    });

    it('should handle NaN and Infinity', () => {
      // NaN should be normalized to 0
      expect(calculateHybridScore(NaN, 60)).toBe(45);
      // Infinity should be normalized to 0
      expect(calculateHybridScore(Infinity, 60)).toBe(45);
    });

    it('should use default weights when not specified', () => {
      const withDefaults = calculateHybridScore(80, 60);
      const withExplicitDefaults = calculateHybridScore(80, 60, DEFAULT_WEIGHTS.diagram, DEFAULT_WEIGHTS.essay);
      expect(withDefaults).toBe(withExplicitDefaults);
    });
  });

  describe('Property 8: Hybrid Score Calculation Correctness', () => {
    // Feature: diagram-essay-grading-system, Property 8: Hybrid Score Calculation Correctness
    // Validates: Requirements 3.1, 3.2
    it('should calculate hybrid score as (D * w_d + E * w_e) / (w_d + w_e)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 1, max: 100 }).map(n => n / 10),
          fc.integer({ min: 1, max: 100 }).map(n => n / 10),
          (diagramScore, essayScore, diagramWeight, essayWeight) => {
            const result = calculateHybridScore(diagramScore, essayScore, diagramWeight, essayWeight);
            const expected = (diagramScore * diagramWeight + essayScore * essayWeight) / (diagramWeight + essayWeight);
            
            // Allow small floating point differences
            expect(Math.abs(result - expected)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9: Hybrid Score Range Validity', () => {
    // Feature: diagram-essay-grading-system, Property 9: Hybrid Score Range Validity
    // Validates: Requirements 3.3
    it('should always return a score between 0 and 100 inclusive', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -10000, max: 10000 }).map(n => n / 10),
          fc.integer({ min: -10000, max: 10000 }).map(n => n / 10),
          fc.integer({ min: 1, max: 100 }).map(n => n / 10),
          fc.integer({ min: 1, max: 100 }).map(n => n / 10),
          (diagramScore, essayScore, diagramWeight, essayWeight) => {
            const result = calculateHybridScore(diagramScore, essayScore, diagramWeight, essayWeight);
            
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(100);
            expect(typeof result).toBe('number');
            expect(isFinite(result)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
