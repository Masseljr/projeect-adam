import fc from 'fast-check';
import {
  generateReport,
  reportToJSON,
  reportToString,
  isValidEvaluationResult
} from './reportGenerator';
import { EvaluationResult, Report } from '../models/types';

describe('Report Generator', () => {
  // Helper function to create valid evaluation results
  const createValidEvaluationResult = (overrides?: Partial<EvaluationResult>): EvaluationResult => {
    return {
      submissionId: 'sub-123',
      diagramScore: 85,
      essayScore: 90,
      hybridScore: 88.75,
      diagramBreakdown: {
        nodeCountMatch: 80,
        connectionCountMatch: 85,
        labelAccuracy: 90
      },
      essayBreakdown: {
        keywordCoverage: 85,
        termFrequency: 90,
        contentLength: 95
      },
      timestamp: '2024-01-01T00:00:00Z',
      ...overrides
    };
  };

  describe('isValidEvaluationResult', () => {
    it('should return true for valid evaluation results', () => {
      const result = createValidEvaluationResult();
      expect(isValidEvaluationResult(result)).toBe(true);
    });

    it('should return false when submissionId is missing', () => {
      const result = createValidEvaluationResult();
      delete (result as any).submissionId;
      expect(isValidEvaluationResult(result)).toBe(false);
    });

    it('should return false when scores are out of range', () => {
      const result = createValidEvaluationResult({ diagramScore: 101 });
      expect(isValidEvaluationResult(result)).toBe(false);
    });

    it('should return false when breakdown is missing', () => {
      const result = createValidEvaluationResult();
      delete (result as any).diagramBreakdown;
      expect(isValidEvaluationResult(result)).toBe(false);
    });

    it('should return false when timestamp is missing', () => {
      const result = createValidEvaluationResult();
      delete (result as any).timestamp;
      expect(isValidEvaluationResult(result)).toBe(false);
    });
  });

  describe('generateReport', () => {
    it('should generate a valid report from evaluation result', () => {
      const evalResult = createValidEvaluationResult();
      const report = generateReport(evalResult);

      expect(report.submissionId).toBe(evalResult.submissionId);
      expect(report.diagramScore).toBe(85);
      expect(report.essayScore).toBe(90);
      expect(report.hybridScore).toBe(88.75);
      expect(report.timestamp).toBe(evalResult.timestamp);
    });

    it('should include diagram details in report', () => {
      const evalResult = createValidEvaluationResult();
      const report = generateReport(evalResult);

      expect(report.diagramDetails).toBeDefined();
      expect(report.diagramDetails.nodeCountMatch).toBe(80);
      expect(report.diagramDetails.connectionCountMatch).toBe(85);
      expect(report.diagramDetails.labelAccuracy).toBe(90);
    });

    it('should include essay details in report', () => {
      const evalResult = createValidEvaluationResult();
      const report = generateReport(evalResult);

      expect(report.essayDetails).toBeDefined();
      expect(report.essayDetails.keywordCoverage).toBe(85);
      expect(report.essayDetails.termFrequency).toBe(90);
      expect(report.essayDetails.contentLength).toBe(95);
    });

    it('should round scores to 2 decimal places', () => {
      const evalResult = createValidEvaluationResult({
        diagramScore: 85.556,
        essayScore: 90.444,
        hybridScore: 88.123
      });
      const report = generateReport(evalResult);

      expect(report.diagramScore).toBe(85.56);
      expect(report.essayScore).toBe(90.44);
      expect(report.hybridScore).toBe(88.12);
    });

    it('should throw error for invalid evaluation result', () => {
      const invalidResult = createValidEvaluationResult({ diagramScore: 101 });
      expect(() => generateReport(invalidResult)).toThrow();
    });

    it('should throw error when required fields are missing', () => {
      const incompleteResult = createValidEvaluationResult();
      delete (incompleteResult as any).diagramBreakdown;
      expect(() => generateReport(incompleteResult)).toThrow();
    });
  });

  describe('reportToJSON', () => {
    it('should convert report to JSON string', () => {
      const evalResult = createValidEvaluationResult();
      const report = generateReport(evalResult);
      const json = reportToJSON(report);

      expect(typeof json).toBe('string');
      expect(json).toContain(report.submissionId);
    });

    it('should parse back to valid object', () => {
      const evalResult = createValidEvaluationResult();
      const report = generateReport(evalResult);
      const json = reportToJSON(report);
      const parsed = JSON.parse(json);

      expect(parsed.submissionId).toBe(report.submissionId);
      expect(parsed.diagramScore).toBe(report.diagramScore);
      expect(parsed.essayScore).toBe(report.essayScore);
      expect(parsed.hybridScore).toBe(report.hybridScore);
    });

    it('should format with indentation when pretty=true', () => {
      const evalResult = createValidEvaluationResult();
      const report = generateReport(evalResult);
      const json = reportToJSON(report, true);

      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });

    it('should format without indentation when pretty=false', () => {
      const evalResult = createValidEvaluationResult();
      const report = generateReport(evalResult);
      const json = reportToJSON(report, false);

      expect(json).not.toContain('\n');
    });
  });

  describe('reportToString', () => {
    it('should convert report to human-readable string', () => {
      const evalResult = createValidEvaluationResult();
      const report = generateReport(evalResult);
      const str = reportToString(report);

      expect(typeof str).toBe('string');
      expect(str).toContain('GRADING REPORT');
      expect(str).toContain(report.submissionId);
    });

    it('should include all scores in string format', () => {
      const evalResult = createValidEvaluationResult();
      const report = generateReport(evalResult);
      const str = reportToString(report);

      expect(str).toContain('Diagram Score');
      expect(str).toContain('Essay Score');
      expect(str).toContain('Hybrid Score');
    });

    it('should include diagram details in string format', () => {
      const evalResult = createValidEvaluationResult();
      const report = generateReport(evalResult);
      const str = reportToString(report);

      expect(str).toContain('DIAGRAM EVALUATION DETAILS');
      expect(str).toContain('Node Count Match');
      expect(str).toContain('Connection Count Match');
      expect(str).toContain('Label Accuracy');
    });

    it('should include essay details in string format', () => {
      const evalResult = createValidEvaluationResult();
      const report = generateReport(evalResult);
      const str = reportToString(report);

      expect(str).toContain('ESSAY EVALUATION DETAILS');
      expect(str).toContain('Keyword Coverage');
      expect(str).toContain('Term Frequency');
      expect(str).toContain('Content Length');
    });
  });

  // Property-Based Tests
  describe('Property 10: Report Completeness', () => {
    it('should generate complete reports for all valid evaluation results', () => {
      // Validates: Requirements 3.4, 5.1, 5.2, 5.3, 5.4
      fc.assert(
        fc.property(
          fc.record({
            submissionId: fc.string({ minLength: 1 }),
            diagramScore: fc.integer({ min: 0, max: 100 }),
            essayScore: fc.integer({ min: 0, max: 100 }),
            hybridScore: fc.integer({ min: 0, max: 100 }),
            diagramBreakdown: fc.record({
              nodeCountMatch: fc.integer({ min: 0, max: 100 }),
              connectionCountMatch: fc.integer({ min: 0, max: 100 }),
              labelAccuracy: fc.integer({ min: 0, max: 100 })
            }),
            essayBreakdown: fc.record({
              keywordCoverage: fc.integer({ min: 0, max: 100 }),
              termFrequency: fc.integer({ min: 0, max: 100 }),
              contentLength: fc.integer({ min: 0, max: 100 })
            }),
            timestamp: fc.date().map(d => d.toISOString())
          }),
          (evalResult) => {
            const report = generateReport(evalResult);

            // Verify all required fields are present
            expect(report.submissionId).toBeDefined();
            expect(report.diagramScore).toBeDefined();
            expect(report.essayScore).toBeDefined();
            expect(report.hybridScore).toBeDefined();
            expect(report.diagramDetails).toBeDefined();
            expect(report.essayDetails).toBeDefined();
            expect(report.timestamp).toBeDefined();

            // Verify diagram details are complete
            expect(report.diagramDetails.nodeCountMatch).toBeDefined();
            expect(report.diagramDetails.connectionCountMatch).toBeDefined();
            expect(report.diagramDetails.labelAccuracy).toBeDefined();

            // Verify essay details are complete
            expect(report.essayDetails.keywordCoverage).toBeDefined();
            expect(report.essayDetails.termFrequency).toBeDefined();
            expect(report.essayDetails.contentLength).toBeDefined();

            // Verify all scores are valid (0-100)
            expect(report.diagramScore).toBeGreaterThanOrEqual(0);
            expect(report.diagramScore).toBeLessThanOrEqual(100);
            expect(report.essayScore).toBeGreaterThanOrEqual(0);
            expect(report.essayScore).toBeLessThanOrEqual(100);
            expect(report.hybridScore).toBeGreaterThanOrEqual(0);
            expect(report.hybridScore).toBeLessThanOrEqual(100);

            // Verify breakdown scores are valid
            expect(report.diagramDetails.nodeCountMatch).toBeGreaterThanOrEqual(0);
            expect(report.diagramDetails.nodeCountMatch).toBeLessThanOrEqual(100);
            expect(report.diagramDetails.connectionCountMatch).toBeGreaterThanOrEqual(0);
            expect(report.diagramDetails.connectionCountMatch).toBeLessThanOrEqual(100);
            expect(report.diagramDetails.labelAccuracy).toBeGreaterThanOrEqual(0);
            expect(report.diagramDetails.labelAccuracy).toBeLessThanOrEqual(100);

            expect(report.essayDetails.keywordCoverage).toBeGreaterThanOrEqual(0);
            expect(report.essayDetails.keywordCoverage).toBeLessThanOrEqual(100);
            expect(report.essayDetails.termFrequency).toBeGreaterThanOrEqual(0);
            expect(report.essayDetails.termFrequency).toBeLessThanOrEqual(100);
            expect(report.essayDetails.contentLength).toBeGreaterThanOrEqual(0);
            expect(report.essayDetails.contentLength).toBeLessThanOrEqual(100);

            // Verify report can be serialized to JSON
            const json = reportToJSON(report);
            expect(typeof json).toBe('string');
            const parsed = JSON.parse(json);
            expect(parsed.submissionId).toBe(report.submissionId);
            expect(parsed.diagramScore).toBe(report.diagramScore);
            expect(parsed.essayScore).toBe(report.essayScore);
            expect(parsed.hybridScore).toBe(report.hybridScore);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
