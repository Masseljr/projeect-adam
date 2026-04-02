import * as fc from 'fast-check';
import { gradeSubmission, GradingPipelineResult } from './gradingPipeline';
import { uploadModelDiagram, uploadModelEssay, clearAllModelAnswers } from './modelAnswerManager';
import { DiagramStructure, EssayContent } from '../models/types';

describe('Grading Pipeline', () => {
  beforeEach(() => {
    // Clear model answers before each test
    clearAllModelAnswers();
  });

  describe('gradeSubmission', () => {
    it('should return success for valid submission', () => {
      // Set up model answers
      const modelDiagram: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Concept A' },
          { id: '2', label: 'Concept B' }
        ],
        connections: [{ from: '1', to: '2' }]
      };

      const modelEssay = 'This essay discusses Concept A and Concept B in detail.';

      const modelDiagramId = uploadModelDiagram(modelDiagram);
      const modelEssayId = uploadModelEssay(modelEssay);

      // Create student submission
      const studentDiagram: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Concept A' },
          { id: '2', label: 'Concept B' }
        ],
        connections: [{ from: '1', to: '2' }]
      };

      const studentEssay = 'This essay discusses Concept A and Concept B in detail.';

      // Grade submission
      const result = gradeSubmission({
        diagramFile: studentDiagram,
        essayFile: studentEssay,
        modelDiagramId,
        modelEssayId
      });

      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
      expect(result.submissionId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should return success for essay-only submission (missing diagram file)', () => {
      const modelDiagram: DiagramStructure = {
        nodes: [{ id: '1', label: 'Node' }],
        connections: []
      };

      const modelEssay = 'Test essay';

      const modelDiagramId = uploadModelDiagram(modelDiagram);
      const modelEssayId = uploadModelEssay(modelEssay);

      // Essay-only submission should succeed with empty diagram
      const result = gradeSubmission({
        diagramFile: undefined as any,
        essayFile: 'Student essay',
        modelDiagramId,
        modelEssayId
      });

      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
      // Empty diagram vs model with 1 node: 0 nodes match (0) + 0 connections match (100) + 0 labels (0) = 30
      expect(result.report?.diagramScore).toBe(30);
    });

    it('should return error for missing essay file', () => {
      const modelDiagram: DiagramStructure = {
        nodes: [{ id: '1', label: 'Node' }],
        connections: []
      };

      const modelEssay = 'Test essay';

      const modelDiagramId = uploadModelDiagram(modelDiagram);
      const modelEssayId = uploadModelEssay(modelEssay);

      const result = gradeSubmission({
        diagramFile: modelDiagram,
        essayFile: undefined as any,
        modelDiagramId,
        modelEssayId
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.report).toBeUndefined();
    });

    it('should return error for invalid model diagram ID', () => {
      const modelEssay = 'Test essay';
      const modelEssayId = uploadModelEssay(modelEssay);

      const studentDiagram: DiagramStructure = {
        nodes: [{ id: '1', label: 'Node' }],
        connections: []
      };

      const result = gradeSubmission({
        diagramFile: studentDiagram,
        essayFile: 'Student essay',
        modelDiagramId: 'invalid_model_id',
        modelEssayId
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.report).toBeUndefined();
    });

    it('should return error for invalid model essay ID', () => {
      const modelDiagram: DiagramStructure = {
        nodes: [{ id: '1', label: 'Node' }],
        connections: []
      };

      const modelDiagramId = uploadModelDiagram(modelDiagram);

      const studentDiagram: DiagramStructure = {
        nodes: [{ id: '1', label: 'Node' }],
        connections: []
      };

      const result = gradeSubmission({
        diagramFile: studentDiagram,
        essayFile: 'Student essay',
        modelDiagramId,
        modelEssayId: 'invalid_model_id'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.report).toBeUndefined();
    });

    it('should include all required report fields', () => {
      const modelDiagram: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [{ from: '1', to: '2' }]
      };

      const modelEssay = 'This is a test essay with Node A and Node B concepts.';

      const modelDiagramId = uploadModelDiagram(modelDiagram);
      const modelEssayId = uploadModelEssay(modelEssay);

      const studentDiagram: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [{ from: '1', to: '2' }]
      };

      const studentEssay = 'This is a test essay with Node A and Node B concepts.';

      const result = gradeSubmission({
        diagramFile: studentDiagram,
        essayFile: studentEssay,
        modelDiagramId,
        modelEssayId
      });

      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();

      const report = result.report!;
      expect(report.submissionId).toBeDefined();
      expect(report.diagramScore).toBeDefined();
      expect(report.essayScore).toBeDefined();
      expect(report.hybridScore).toBeDefined();
      expect(report.diagramDetails).toBeDefined();
      expect(report.essayDetails).toBeDefined();
      expect(report.timestamp).toBeDefined();

      // Verify all scores are valid (0-100)
      expect(report.diagramScore).toBeGreaterThanOrEqual(0);
      expect(report.diagramScore).toBeLessThanOrEqual(100);
      expect(report.essayScore).toBeGreaterThanOrEqual(0);
      expect(report.essayScore).toBeLessThanOrEqual(100);
      expect(report.hybridScore).toBeGreaterThanOrEqual(0);
      expect(report.hybridScore).toBeLessThanOrEqual(100);
    });

    it('should calculate hybrid score correctly', () => {
      const modelDiagram: DiagramStructure = {
        nodes: [{ id: '1', label: 'Node' }],
        connections: []
      };

      const modelEssay = 'This is a comprehensive test essay content with sufficient length to meet minimum requirements for proper evaluation.';

      const modelDiagramId = uploadModelDiagram(modelDiagram);
      const modelEssayId = uploadModelEssay(modelEssay);

      const studentDiagram: DiagramStructure = {
        nodes: [{ id: '1', label: 'Node' }],
        connections: []
      };

      const studentEssay = 'This is a comprehensive test essay content with sufficient length to meet minimum requirements for proper evaluation.';

      const result = gradeSubmission({
        diagramFile: studentDiagram,
        essayFile: studentEssay,
        modelDiagramId,
        modelEssayId
      });

      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();

      const report = result.report!;
      // Hybrid score should be weighted combination: 25% diagram + 75% essay
      // Verify the calculation: hybridScore = (diagramScore * 0.25) + (essayScore * 0.75)
      const expectedHybrid = (report.diagramScore * 0.25) + (report.essayScore * 0.75);
      expect(Math.abs(report.hybridScore - expectedHybrid)).toBeLessThan(0.01);
    });
  });

  // Property-Based Tests

  describe('Property 12: Valid Submission Processing', () => {
    it('should successfully process any valid submission with matching model answers', () => {
      // Feature: diagram-essay-grading-system, Property 12: Valid Submission Processing
      // Validates: Requirements 4.5

      fc.assert(
        fc.property(
          fc.tuple(
            fc.array(
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 10 }),
                label: fc.string({ minLength: 1, maxLength: 20 })
              }),
              { minLength: 1, maxLength: 10 }
            ),
            fc.array(
              fc.record({
                from: fc.string({ minLength: 1, maxLength: 10 }),
                to: fc.string({ minLength: 1, maxLength: 10 })
              }),
              { minLength: 0, maxLength: 10 }
            ),
            fc.string({ minLength: 10, maxLength: 200 })
          ),
          ([nodeArray, connectionArray, essayText]) => {
            // Create model answers
            const modelDiagram: DiagramStructure = {
              nodes: nodeArray.map((node, i) => ({
                id: `model_node_${i}`,
                label: node.label
              })),
              connections: connectionArray.map((conn, i) => ({
                from: `model_node_${i % nodeArray.length}`,
                to: `model_node_${(i + 1) % nodeArray.length}`
              }))
            };

            const modelEssay = essayText;

            const modelDiagramId = uploadModelDiagram(modelDiagram);
            const modelEssayId = uploadModelEssay(modelEssay);

            // Create student submission (same as model for valid processing)
            const studentDiagram: DiagramStructure = {
              nodes: nodeArray.map((node, i) => ({
                id: `student_node_${i}`,
                label: node.label
              })),
              connections: connectionArray.map((conn, i) => ({
                from: `student_node_${i % nodeArray.length}`,
                to: `student_node_${(i + 1) % nodeArray.length}`
              }))
            };

            const studentEssay = essayText;

            // Grade submission
            const result = gradeSubmission({
              diagramFile: studentDiagram,
              essayFile: studentEssay,
              modelDiagramId,
              modelEssayId
            });

            // Verify: submission should be processed successfully
            expect(result.success).toBe(true);
            expect(result.report).toBeDefined();
            expect(result.submissionId).toBeDefined();
            expect(result.error).toBeUndefined();

            // Verify: report contains all required fields
            const report = result.report!;
            expect(report.submissionId).toBeDefined();
            expect(report.diagramScore).toBeDefined();
            expect(report.essayScore).toBeDefined();
            expect(report.hybridScore).toBeDefined();
            expect(report.diagramDetails).toBeDefined();
            expect(report.essayDetails).toBeDefined();
            expect(report.timestamp).toBeDefined();

            // Verify: all scores are valid (0-100)
            expect(report.diagramScore).toBeGreaterThanOrEqual(0);
            expect(report.diagramScore).toBeLessThanOrEqual(100);
            expect(report.essayScore).toBeGreaterThanOrEqual(0);
            expect(report.essayScore).toBeLessThanOrEqual(100);
            expect(report.hybridScore).toBeGreaterThanOrEqual(0);
            expect(report.hybridScore).toBeLessThanOrEqual(100);

            // Verify: hybrid score is weighted combination of diagram and essay
            // With default weights: 25% diagram + 75% essay
            const expectedHybrid = (report.diagramScore * 0.25) + (report.essayScore * 0.75);
            expect(Math.abs(report.hybridScore - expectedHybrid)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle submissions with different diagram and essay content', () => {
      // Feature: diagram-essay-grading-system, Property 12: Valid Submission Processing
      // Validates: Requirements 4.5

      fc.assert(
        fc.property(
          fc.tuple(
            fc.array(
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 10 }),
                label: fc.string({ minLength: 1, maxLength: 20 })
              }),
              { minLength: 1, maxLength: 5 }
            ),
            fc.string({ minLength: 10, maxLength: 100 }),
            fc.array(
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 10 }),
                label: fc.string({ minLength: 1, maxLength: 20 })
              }),
              { minLength: 1, maxLength: 5 }
            ),
            fc.string({ minLength: 10, maxLength: 100 })
          ),
          ([modelNodeArray, modelEssayText, studentNodeArray, studentEssayText]) => {
            // Create model answers
            const modelDiagram: DiagramStructure = {
              nodes: modelNodeArray.map((node, i) => ({
                id: `model_node_${i}`,
                label: node.label
              })),
              connections: []
            };

            const modelDiagramId = uploadModelDiagram(modelDiagram);
            const modelEssayId = uploadModelEssay(modelEssayText);

            // Create student submission (different from model)
            const studentDiagram: DiagramStructure = {
              nodes: studentNodeArray.map((node, i) => ({
                id: `student_node_${i}`,
                label: node.label
              })),
              connections: []
            };

            // Grade submission
            const result = gradeSubmission({
              diagramFile: studentDiagram,
              essayFile: studentEssayText,
              modelDiagramId,
              modelEssayId
            });

            // Verify: submission should be processed successfully even with different content
            expect(result.success).toBe(true);
            expect(result.report).toBeDefined();
            expect(result.submissionId).toBeDefined();

            // Verify: report contains all required fields
            const report = result.report!;
            expect(report.diagramScore).toBeGreaterThanOrEqual(0);
            expect(report.diagramScore).toBeLessThanOrEqual(100);
            expect(report.essayScore).toBeGreaterThanOrEqual(0);
            expect(report.essayScore).toBeLessThanOrEqual(100);
            expect(report.hybridScore).toBeGreaterThanOrEqual(0);
            expect(report.hybridScore).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

