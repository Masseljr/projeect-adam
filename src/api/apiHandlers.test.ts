/**
 * Integration tests for REST API endpoints
 * Tests submission, model upload, and result retrieval endpoints
 */

import {
  handleSubmitAssignment,
  handleUploadModelDiagram,
  handleUploadModelEssay,
  handleGetResult,
  clearAllResults
} from './apiHandlers';
import { clearAllModelAnswers } from '../utils/modelAnswerManager';

describe('REST API Endpoints', () => {
  beforeEach(() => {
    // Clear all data before each test
    clearAllResults();
    clearAllModelAnswers();
  });

  describe('POST /model/diagram - Upload model diagram', () => {
    it('should successfully upload a valid model diagram', () => {
      const diagramData = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [{ from: '1', to: '2' }]
      };

      const response = handleUploadModelDiagram(diagramData);

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(201);
      expect(response.data).toBeDefined();
      expect(response.data?.modelId).toBeDefined();
      expect(response.data?.modelId).toMatch(/^model_/);
    });

    it('should successfully upload a model diagram from JSON string', () => {
      const diagramData = JSON.stringify({
        nodes: [{ id: '1', label: 'Node A' }],
        connections: []
      });

      const response = handleUploadModelDiagram(diagramData);

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(201);
      expect(response.data?.modelId).toBeDefined();
    });

    it('should reject upload when diagram file is missing', () => {
      const response = handleUploadModelDiagram(undefined);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.error).toContain('Diagram file is required');
    });

    it('should reject upload when diagram has no nodes', () => {
      const diagramData = {
        nodes: [],
        connections: []
      };

      const response = handleUploadModelDiagram(diagramData);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.error).toContain('at least one node');
    });

    it('should reject upload when diagram has invalid JSON', () => {
      const response = handleUploadModelDiagram('{ invalid json }');

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /model/essay - Upload model essay', () => {
    it('should successfully upload a valid model essay', () => {
      const essayText = 'This is a model essay with important concepts and keywords.';

      const response = handleUploadModelEssay(essayText);

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(201);
      expect(response.data).toBeDefined();
      expect(response.data?.modelId).toBeDefined();
      expect(response.data?.modelId).toMatch(/^model_/);
    });

    it('should reject upload when essay file is missing', () => {
      const response = handleUploadModelEssay(undefined);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.error).toContain('Essay file is required');
    });

    it('should reject upload when essay is empty', () => {
      const response = handleUploadModelEssay('');

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      // Empty string is caught by the "file is required" check
      expect(response.error).toBeDefined();
    });

    it('should reject upload when essay is only whitespace', () => {
      const response = handleUploadModelEssay('   \n\t  ');

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /submit - Submit assignment', () => {
    it('should successfully submit a valid assignment', () => {
      // First, upload model answers
      const modelDiagramResponse = handleUploadModelDiagram({
        nodes: [
          { id: '1', label: 'Concept A' },
          { id: '2', label: 'Concept B' }
        ],
        connections: [{ from: '1', to: '2' }]
      });

      const modelEssayResponse = handleUploadModelEssay('This is a model essay about concepts.');

      const modelDiagramId = modelDiagramResponse.data?.modelId;
      const modelEssayId = modelEssayResponse.data?.modelId;

      // Now submit an assignment
      const studentDiagram = {
        nodes: [
          { id: '1', label: 'Concept A' },
          { id: '2', label: 'Concept B' }
        ],
        connections: [{ from: '1', to: '2' }]
      };

      const studentEssay = 'This is a student essay about concepts and ideas.';

      const response = handleSubmitAssignment(
        studentDiagram,
        studentEssay,
        modelDiagramId,
        modelEssayId
      );

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data?.submissionId).toBeDefined();
      expect(response.data?.diagramScore).toBeDefined();
      expect(response.data?.essayScore).toBeDefined();
      expect(response.data?.hybridScore).toBeDefined();
    });

    it('should reject submission when modelDiagramId is missing', () => {
      const response = handleSubmitAssignment(
        { nodes: [], connections: [] },
        'essay text',
        undefined,
        'model_essay_123'
      );

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.error).toContain('modelDiagramId is required');
    });

    it('should reject submission when modelEssayId is missing', () => {
      const response = handleSubmitAssignment(
        { nodes: [], connections: [] },
        'essay text',
        'model_diagram_123',
        undefined
      );

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.error).toContain('modelEssayId is required');
    });

    it('should reject submission when model diagram does not exist', () => {
      const response = handleSubmitAssignment(
        { nodes: [], connections: [] },
        'essay text',
        'nonexistent_model_123',
        'model_essay_123'
      );

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
      expect(response.error).toContain('Model diagram not found');
    });

    it('should reject submission when model essay does not exist', () => {
      // Upload a model diagram first
      const modelDiagramResponse = handleUploadModelDiagram({
        nodes: [{ id: '1', label: 'Node' }],
        connections: []
      });

      const response = handleSubmitAssignment(
        { nodes: [], connections: [] },
        'essay text',
        modelDiagramResponse.data?.modelId,
        'nonexistent_model_123'
      );

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
      expect(response.error).toContain('Model essay not found');
    });

    it('should accept submission when diagram file is missing (essay-only)', () => {
      // Upload model answers
      const modelDiagramResponse = handleUploadModelDiagram({
        nodes: [{ id: '1', label: 'Node' }],
        connections: []
      });

      const modelEssayResponse = handleUploadModelEssay('Model essay text');

      const response = handleSubmitAssignment(
        undefined,
        'essay text',
        modelDiagramResponse.data?.modelId,
        modelEssayResponse.data?.modelId
      );

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      // Empty diagram vs model with 1 node: 0 nodes match (0) + 0 connections match (100) + 0 labels (0) = 30
      expect(response.data?.diagramScore).toBe(30);
    });

    it('should reject submission when essay file is missing', () => {
      // Upload model answers
      const modelDiagramResponse = handleUploadModelDiagram({
        nodes: [{ id: '1', label: 'Node' }],
        connections: []
      });

      const modelEssayResponse = handleUploadModelEssay('Model essay text');

      const response = handleSubmitAssignment(
        { nodes: [{ id: '1', label: 'Node' }], connections: [] },
        undefined,
        modelDiagramResponse.data?.modelId,
        modelEssayResponse.data?.modelId
      );

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.error).toContain('Essay file is missing');
    });
  });

  describe('GET /result/:submissionId - Get grading result', () => {
    it('should successfully retrieve a grading result', () => {
      // First, submit an assignment to generate a result
      const modelDiagramResponse = handleUploadModelDiagram({
        nodes: [{ id: '1', label: 'Node A' }],
        connections: []
      });

      const modelEssayResponse = handleUploadModelEssay('Model essay');

      const submitResponse = handleSubmitAssignment(
        { nodes: [{ id: '1', label: 'Node A' }], connections: [] },
        'Student essay',
        modelDiagramResponse.data?.modelId,
        modelEssayResponse.data?.modelId
      );

      const submissionId = submitResponse.data?.submissionId;

      // Now retrieve the result
      const response = handleGetResult(submissionId);

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data?.submissionId).toBe(submissionId);
      expect(response.data?.diagramScore).toBeDefined();
      expect(response.data?.essayScore).toBeDefined();
      expect(response.data?.hybridScore).toBeDefined();
    });

    it('should reject retrieval when submissionId is missing', () => {
      const response = handleGetResult(undefined);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.error).toContain('submissionId is required');
    });

    it('should return 404 when result does not exist', () => {
      const response = handleGetResult('nonexistent_submission_123');

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
      expect(response.error).toContain('Result not found');
    });
  });

  describe('Integration: Complete workflow', () => {
    it('should complete full workflow: upload models, submit assignment, retrieve result', () => {
      // Step 1: Upload model diagram
      const modelDiagramResponse = handleUploadModelDiagram({
        nodes: [
          { id: '1', label: 'Introduction' },
          { id: '2', label: 'Body' },
          { id: '3', label: 'Conclusion' }
        ],
        connections: [
          { from: '1', to: '2' },
          { from: '2', to: '3' }
        ]
      });

      expect(modelDiagramResponse.success).toBe(true);
      const modelDiagramId = modelDiagramResponse.data?.modelId;

      // Step 2: Upload model essay
      const modelEssayResponse = handleUploadModelEssay(
        'This essay discusses important concepts including structure, clarity, and coherence.'
      );

      expect(modelEssayResponse.success).toBe(true);
      const modelEssayId = modelEssayResponse.data?.modelId;

      // Step 3: Submit student assignment
      const submitResponse = handleSubmitAssignment(
        {
          nodes: [
            { id: '1', label: 'Introduction' },
            { id: '2', label: 'Body' },
            { id: '3', label: 'Conclusion' }
          ],
          connections: [
            { from: '1', to: '2' },
            { from: '2', to: '3' }
          ]
        },
        'The student essay covers structure and clarity in their writing.',
        modelDiagramId,
        modelEssayId
      );

      expect(submitResponse.success).toBe(true);
      const submissionId = submitResponse.data?.submissionId;

      // Step 4: Retrieve the result
      const resultResponse = handleGetResult(submissionId);

      expect(resultResponse.success).toBe(true);
      expect(resultResponse.data?.submissionId).toBe(submissionId);
      expect(resultResponse.data?.diagramScore).toBeGreaterThanOrEqual(0);
      expect(resultResponse.data?.diagramScore).toBeLessThanOrEqual(100);
      expect(resultResponse.data?.essayScore).toBeGreaterThanOrEqual(0);
      expect(resultResponse.data?.essayScore).toBeLessThanOrEqual(100);
      expect(resultResponse.data?.hybridScore).toBeGreaterThanOrEqual(0);
      expect(resultResponse.data?.hybridScore).toBeLessThanOrEqual(100);
    });

    it('should handle multiple submissions with same models', () => {
      // Upload models once
      const modelDiagramResponse = handleUploadModelDiagram({
        nodes: [{ id: '1', label: 'Concept' }],
        connections: []
      });

      const modelEssayResponse = handleUploadModelEssay('Model essay text');

      const modelDiagramId = modelDiagramResponse.data?.modelId;
      const modelEssayId = modelEssayResponse.data?.modelId;

      // Submit first assignment
      const submit1 = handleSubmitAssignment(
        { nodes: [{ id: '1', label: 'Concept' }], connections: [] },
        'First student essay',
        modelDiagramId,
        modelEssayId
      );

      expect(submit1.success).toBe(true);
      const submissionId1 = submit1.data?.submissionId;

      // Submit second assignment
      const submit2 = handleSubmitAssignment(
        { nodes: [{ id: '1', label: 'Concept' }], connections: [] },
        'Second student essay',
        modelDiagramId,
        modelEssayId
      );

      expect(submit2.success).toBe(true);
      const submissionId2 = submit2.data?.submissionId;

      // Verify both results are stored separately
      const result1 = handleGetResult(submissionId1);
      const result2 = handleGetResult(submissionId2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data?.submissionId).not.toBe(result2.data?.submissionId);
    });
  });
});

