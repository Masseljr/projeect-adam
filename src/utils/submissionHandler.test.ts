import * as fc from 'fast-check';
import {
  submitAssignment,
  generateSubmissionId,
  validateFilesPresent,
  validateDiagramFormat,
  validateEssayFormat,
  SubmissionResult
} from './submissionHandler';
import { DiagramStructure, EssayContent } from '../models/types';

describe('Submission Handler', () => {
  describe('generateSubmissionId', () => {
    it('should generate a unique submission ID', () => {
      const id1 = generateSubmissionId();
      const id2 = generateSubmissionId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate submission ID with correct prefix', () => {
      const id = generateSubmissionId();
      expect(id).toMatch(/^submission_/);
    });
  });

  describe('validateFilesPresent', () => {
    it('should accept valid files', () => {
      const result = validateFilesPresent('{}', 'essay text');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept missing diagram file (essay-only submission)', () => {
      const result = validateFilesPresent(undefined, 'essay text');
      expect(result.valid).toBe(true);
      expect(result.essayOnly).toBe(true);
    });

    it('should reject missing essay file', () => {
      const result = validateFilesPresent('{}', undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Essay file is missing');
    });

    it('should accept null diagram file (essay-only submission)', () => {
      const result = validateFilesPresent(null as any, 'essay text');
      expect(result.valid).toBe(true);
      expect(result.essayOnly).toBe(true);
    });

    it('should reject null essay file', () => {
      const result = validateFilesPresent('{}', null as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Essay file is missing');
    });
  });

  describe('validateDiagramFormat', () => {
    it('should accept valid JSON string', () => {
      const result = validateDiagramFormat('{"nodes": [], "connections": []}');
      expect(result.valid).toBe(true);
    });

    it('should accept valid object', () => {
      const result = validateDiagramFormat({ nodes: [], connections: [] });
      expect(result.valid).toBe(true);
    });

    it('should accept undefined (essay-only submission)', () => {
      const result = validateDiagramFormat(undefined);
      expect(result.valid).toBe(true);
      expect(result.isEmpty).toBe(true);
    });

    it('should reject invalid JSON string', () => {
      const result = validateDiagramFormat('invalid json');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid diagram format');
    });

    it('should accept null (essay-only submission)', () => {
      const result = validateDiagramFormat(null as any);
      expect(result.valid).toBe(true);
      expect(result.isEmpty).toBe(true);
    });

    it('should reject non-object types', () => {
      const result = validateDiagramFormat(123 as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Diagram must be a valid JSON string or object');
    });
  });

  describe('validateEssayFormat', () => {
    it('should accept non-empty essay text', () => {
      const result = validateEssayFormat('This is an essay');
      expect(result.valid).toBe(true);
    });

    it('should reject empty essay text', () => {
      const result = validateEssayFormat('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Essay content cannot be empty');
    });

    it('should reject whitespace-only essay text', () => {
      const result = validateEssayFormat('   \n\t  ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Essay content cannot be empty');
    });

    it('should reject non-string essay', () => {
      const result = validateEssayFormat(123 as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Essay must be a string');
    });
  });

  describe('submitAssignment', () => {
    it('should successfully submit valid assignment', () => {
      const diagram = {
        nodes: [{ id: '1', label: 'Node A' }],
        connections: []
      };
      const essay = 'This is a valid essay with content.';

      const result = submitAssignment(diagram, essay);

      expect(result.success).toBe(true);
      expect(result.submissionId).toBeDefined();
      expect(result.diagramContent).toBeDefined();
      expect(result.essayContent).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should return error for missing diagram', () => {
      const result = submitAssignment(undefined, 'essay text');

      expect(result.success).toBe(true);
      expect(result.submissionId).toBeDefined();
      expect(result.diagramContent).toBeDefined();
      expect(result.diagramContent?.nodes).toHaveLength(0);
      expect(result.diagramContent?.connections).toHaveLength(0);
    });

    it('should return error for missing essay', () => {
      const diagram = { nodes: [], connections: [] };
      const result = submitAssignment(diagram, undefined);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Essay file is missing');
      expect(result.submissionId).toBeUndefined();
    });

    it('should return error for invalid diagram format', () => {
      const result = submitAssignment('invalid json', 'essay text');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid diagram format');
      expect(result.submissionId).toBeUndefined();
    });

    it('should return error for empty essay', () => {
      const diagram = { nodes: [], connections: [] };
      const result = submitAssignment(diagram, '   ');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Essay content cannot be empty');
      expect(result.submissionId).toBeUndefined();
    });

    it('should return error for invalid diagram structure', () => {
      const diagram = { nodes: 'not an array' };
      const result = submitAssignment(diagram, 'essay text');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse diagram');
      expect(result.submissionId).toBeUndefined();
    });

    it('should include timestamp in result', () => {
      const diagram = { nodes: [], connections: [] };
      const result = submitAssignment(diagram, 'essay text');

      expect(result.timestamp).toBeDefined();
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
    });

    it('should parse diagram content correctly', () => {
      const diagram = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [{ from: '1', to: '2' }]
      };
      const essay = 'This is an essay.';

      const result = submitAssignment(diagram, essay);

      expect(result.success).toBe(true);
      expect(result.diagramContent?.nodes).toHaveLength(2);
      expect(result.diagramContent?.connections).toHaveLength(1);
    });

    it('should parse essay content correctly', () => {
      const diagram = { nodes: [], connections: [] };
      const essay = 'This is a test essay with multiple words.';

      const result = submitAssignment(diagram, essay);

      expect(result.success).toBe(true);
      expect(result.essayContent?.rawText).toBe(essay);
      expect(result.essayContent?.tokens).toBeDefined();
      expect(result.essayContent?.tokens.length).toBeGreaterThan(0);
    });

    it('should accept diagram as JSON string', () => {
      const diagramJson = JSON.stringify({
        nodes: [{ id: '1', label: 'Node A' }],
        connections: []
      });
      const essay = 'This is an essay.';

      const result = submitAssignment(diagramJson, essay);

      expect(result.success).toBe(true);
      expect(result.diagramContent?.nodes).toHaveLength(1);
    });
  });

  // Property-Based Tests

  describe('Property 11: Submission Validation', () => {
    it('should accept submission when diagram file is missing (essay-only)', () => {
      // Feature: diagram-essay-grading-system, Property 11: Submission Validation
      // Validates: Requirements 4.3, 4.4 - Essay-only submissions are allowed

      fc.assert(
        fc.property(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), (essayText) => {
          const result = submitAssignment(undefined, essayText);

          // Verify: submission is accepted (essay-only)
          expect(result.success).toBe(true);

          // Verify: submission ID is generated
          expect(result.submissionId).toBeDefined();

          // Verify: diagram is empty
          expect(result.diagramContent?.nodes).toHaveLength(0);
          expect(result.diagramContent?.connections).toHaveLength(0);

          // Verify: essay is parsed
          expect(result.essayContent).toBeDefined();
        }),
        { numRuns: 100 }
      );
    });

    it('should reject submission when essay file is missing', () => {
      // Feature: diagram-essay-grading-system, Property 11: Submission Validation
      // Validates: Requirements 4.3, 4.4

      fc.assert(
        fc.property(
          fc.record({
            nodes: fc.array(
              fc.record({
                id: fc.string({ minLength: 1 }),
                label: fc.string({ minLength: 1 })
              }),
              { maxLength: 10 }
            ),
            connections: fc.array(
              fc.record({
                from: fc.string({ minLength: 1 }),
                to: fc.string({ minLength: 1 })
              }),
              { maxLength: 10 }
            )
          }),
          (diagram) => {
            const result = submitAssignment(diagram, undefined);

            // Verify: submission is rejected
            expect(result.success).toBe(false);

            // Verify: error message is descriptive
            expect(result.error).toBeDefined();
            expect(result.error).toContain('Essay');

            // Verify: no submission ID is generated
            expect(result.submissionId).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject submission when diagram format is invalid', () => {
      // Feature: diagram-essay-grading-system, Property 11: Submission Validation
      // Validates: Requirements 4.3, 4.4

      fc.assert(
        fc.property(
          fc.tuple(
            fc.string({ minLength: 1 }).filter((s) => {
              try {
                JSON.parse(s);
                return false; // Filter out valid JSON
              } catch {
                return true; // Keep invalid JSON
              }
            }),
            fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0)
          ),
          ([invalidDiagram, essayText]) => {
            const result = submitAssignment(invalidDiagram, essayText);

            // Verify: submission is rejected
            expect(result.success).toBe(false);

            // Verify: error message indicates format issue
            expect(result.error).toBeDefined();
            expect(result.error).toContain('diagram');

            // Verify: no submission ID is generated
            expect(result.submissionId).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject submission when essay is empty or whitespace-only', () => {
      // Feature: diagram-essay-grading-system, Property 11: Submission Validation
      // Validates: Requirements 4.3, 4.4

      fc.assert(
        fc.property(
          fc.tuple(
            fc.record({
              nodes: fc.array(
                fc.record({
                  id: fc.string({ minLength: 1 }),
                  label: fc.string({ minLength: 1 })
                }),
                { maxLength: 10 }
              ),
              connections: fc.array(
                fc.record({
                  from: fc.string({ minLength: 1 }),
                  to: fc.string({ minLength: 1 })
                }),
                { maxLength: 10 }
              )
            }),
            fc.oneof(
              fc.constant(''),
              fc.string({ minLength: 1, maxLength: 100 }).map((s) => s.replace(/\S/g, ' '))
            )
          ),
          ([diagram, emptyEssay]) => {
            const result = submitAssignment(diagram, emptyEssay);

            // Verify: submission is rejected
            expect(result.success).toBe(false);

            // Verify: error message is descriptive
            expect(result.error).toBeDefined();

            // Verify: no submission ID is generated
            expect(result.submissionId).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid submissions with both diagram and essay', () => {
      // Feature: diagram-essay-grading-system, Property 11: Submission Validation
      // Validates: Requirements 4.3, 4.4

      fc.assert(
        fc.property(
          fc.tuple(
            fc.record({
              nodes: fc.array(
                fc.record({
                  id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
                  label: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)
                }),
                { minLength: 1, maxLength: 10 }
              ),
              connections: fc.array(
                fc.record({
                  from: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
                  to: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)
                }),
                { maxLength: 10 }
              )
            }),
            fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0)
          ),
          ([diagram, essayText]) => {
            const result = submitAssignment(diagram, essayText);

            // Verify: submission is accepted
            expect(result.success).toBe(true);

            // Verify: submission ID is generated
            expect(result.submissionId).toBeDefined();
            expect(result.submissionId).toMatch(/^submission_/);

            // Verify: no error message
            expect(result.error).toBeUndefined();

            // Verify: parsed content is returned
            expect(result.diagramContent).toBeDefined();
            expect(result.essayContent).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
