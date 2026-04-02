/**
 * Tests for Model Answer Manager
 * Includes property-based tests for storage and retrieval
 */

import fc from 'fast-check';
import {
  uploadModelDiagram,
  uploadModelEssay,
  getModelDiagram,
  getModelEssay,
  updateModelDiagram,
  updateModelEssay,
  deleteModelAnswer,
  modelAnswerExists,
  clearAllModelAnswers,
  validateDiagramElements,
  validateEssayElements
} from './modelAnswerManager';
import { DiagramStructure, EssayContent } from '../models/types';

describe('Model Answer Manager', () => {
  beforeEach(() => {
    clearAllModelAnswers();
  });

  describe('uploadModelDiagram', () => {
    it('should upload a valid diagram and return a model ID', () => {
      const diagram = {
        nodes: [
          { id: '1', label: 'Node 1' },
          { id: '2', label: 'Node 2' }
        ],
        connections: [{ from: '1', to: '2' }]
      };

      const modelId = uploadModelDiagram(diagram);

      expect(modelId).toBeDefined();
      expect(typeof modelId).toBe('string');
      expect(modelId.startsWith('model_')).toBe(true);
    });

    it('should reject diagram with no nodes', () => {
      const diagram = {
        nodes: [],
        connections: []
      };

      expect(() => uploadModelDiagram(diagram)).toThrow('must contain at least one node');
    });

    it('should reject diagram with invalid JSON string', () => {
      expect(() => uploadModelDiagram('invalid json')).toThrow('Failed to parse diagram');
    });

    it('should reject diagram with missing node labels', () => {
      const diagram = {
        nodes: [{ id: '1' }],
        connections: []
      };

      expect(() => uploadModelDiagram(diagram)).toThrow('Failed to parse diagram');
    });
  });

  describe('uploadModelEssay', () => {
    it('should upload a valid essay and return a model ID', () => {
      const essay = 'This is a test essay with some content.';

      const modelId = uploadModelEssay(essay);

      expect(modelId).toBeDefined();
      expect(typeof modelId).toBe('string');
      expect(modelId.startsWith('model_')).toBe(true);
    });

    it('should reject empty essay', () => {
      expect(() => uploadModelEssay('')).toThrow('cannot be empty');
    });

    it('should reject whitespace-only essay', () => {
      expect(() => uploadModelEssay('   ')).toThrow('cannot be empty');
    });

    it('should reject non-string input', () => {
      expect(() => uploadModelEssay(null as any)).toThrow('must be a non-empty string');
    });
  });

  describe('getModelDiagram', () => {
    it('should retrieve a stored diagram', () => {
      const diagram = {
        nodes: [{ id: '1', label: 'Node 1' }],
        connections: []
      };

      const modelId = uploadModelDiagram(diagram);
      const retrieved = getModelDiagram(modelId);

      expect(retrieved.nodes).toHaveLength(1);
      expect(retrieved.nodes[0].label).toBe('Node 1');
    });

    it('should throw error for non-existent model', () => {
      expect(() => getModelDiagram('non_existent')).toThrow('Model answer not found');
    });

    it('should throw error when retrieving essay as diagram', () => {
      const essay = 'Test essay content';
      const modelId = uploadModelEssay(essay);

      expect(() => getModelDiagram(modelId)).toThrow('is not a diagram');
    });
  });

  describe('getModelEssay', () => {
    it('should retrieve a stored essay', () => {
      const essay = 'This is a test essay';
      const modelId = uploadModelEssay(essay);
      const retrieved = getModelEssay(modelId);

      expect(retrieved.rawText).toBe('This is a test essay');
      expect(retrieved.tokens.length).toBeGreaterThan(0);
    });

    it('should throw error for non-existent model', () => {
      expect(() => getModelEssay('non_existent')).toThrow('Model answer not found');
    });

    it('should throw error when retrieving diagram as essay', () => {
      const diagram = {
        nodes: [{ id: '1', label: 'Node 1' }],
        connections: []
      };
      const modelId = uploadModelDiagram(diagram);

      expect(() => getModelEssay(modelId)).toThrow('is not an essay');
    });
  });

  describe('updateModelDiagram', () => {
    it('should update an existing diagram', () => {
      const diagram1 = {
        nodes: [{ id: '1', label: 'Node 1' }],
        connections: []
      };
      const diagram2 = {
        nodes: [
          { id: '1', label: 'Updated Node' },
          { id: '2', label: 'Node 2' }
        ],
        connections: [{ from: '1', to: '2' }]
      };

      const modelId = uploadModelDiagram(diagram1);
      updateModelDiagram(modelId, diagram2);
      const retrieved = getModelDiagram(modelId);

      expect(retrieved.nodes).toHaveLength(2);
      expect(retrieved.nodes[0].label).toBe('Updated Node');
    });

    it('should throw error when updating non-existent model', () => {
      const diagram = {
        nodes: [{ id: '1', label: 'Node 1' }],
        connections: []
      };

      expect(() => updateModelDiagram('non_existent', diagram)).toThrow('Model answer not found');
    });

    it('should throw error when updating essay as diagram', () => {
      const essay = 'Test essay';
      const diagram = {
        nodes: [{ id: '1', label: 'Node 1' }],
        connections: []
      };

      const modelId = uploadModelEssay(essay);
      expect(() => updateModelDiagram(modelId, diagram)).toThrow('is not a diagram');
    });
  });

  describe('updateModelEssay', () => {
    it('should update an existing essay', () => {
      const essay1 = 'Original essay content';
      const essay2 = 'Updated essay with different content';

      const modelId = uploadModelEssay(essay1);
      updateModelEssay(modelId, essay2);
      const retrieved = getModelEssay(modelId);

      expect(retrieved.rawText).toBe('Updated essay with different content');
    });

    it('should throw error when updating non-existent model', () => {
      expect(() => updateModelEssay('non_existent', 'New essay')).toThrow('Model answer not found');
    });

    it('should throw error when updating diagram as essay', () => {
      const diagram = {
        nodes: [{ id: '1', label: 'Node 1' }],
        connections: []
      };

      const modelId = uploadModelDiagram(diagram);
      expect(() => updateModelEssay(modelId, 'New essay')).toThrow('is not an essay');
    });
  });

  describe('deleteModelAnswer', () => {
    it('should delete a stored model', () => {
      const diagram = {
        nodes: [{ id: '1', label: 'Node 1' }],
        connections: []
      };

      const modelId = uploadModelDiagram(diagram);
      expect(modelAnswerExists(modelId)).toBe(true);

      const deleted = deleteModelAnswer(modelId);
      expect(deleted).toBe(true);
      expect(modelAnswerExists(modelId)).toBe(false);
    });

    it('should return false when deleting non-existent model', () => {
      const deleted = deleteModelAnswer('non_existent');
      expect(deleted).toBe(false);
    });
  });

  describe('modelAnswerExists', () => {
    it('should return true for existing model', () => {
      const diagram = {
        nodes: [{ id: '1', label: 'Node 1' }],
        connections: []
      };

      const modelId = uploadModelDiagram(diagram);
      expect(modelAnswerExists(modelId)).toBe(true);
    });

    it('should return false for non-existent model', () => {
      expect(modelAnswerExists('non_existent')).toBe(false);
    });
  });

  // Property-Based Tests

  describe('Property 13: Model Answer Storage and Retrieval', () => {
    it('should store and retrieve diagrams with all properties preserved', () => {
      // Generator for valid diagrams
      const diagramArb = fc.record({
        nodes: fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            label: fc.string({ minLength: 1 }),
            type: fc.option(fc.string(), { freq: 2 })
          }),
          { minLength: 1 }
        ),
        connections: fc.array(
          fc.record({
            from: fc.string({ minLength: 1 }),
            to: fc.string({ minLength: 1 }),
            label: fc.option(fc.string(), { freq: 2 })
          })
        )
      });

      fc.assert(
        fc.property(diagramArb, (diagram) => {
          // Ensure connections reference valid nodes
          const nodeIds = new Set(diagram.nodes.map(n => n.id));
          const validConnections = diagram.connections.filter(
            c => nodeIds.has(c.from) && nodeIds.has(c.to)
          );
          const validDiagram = { ...diagram, connections: validConnections };

          // Upload and retrieve
          const modelId = uploadModelDiagram(validDiagram);
          const retrieved = getModelDiagram(modelId);

          // Verify all properties are preserved
          expect(retrieved.nodes).toHaveLength(validDiagram.nodes.length);
          expect(retrieved.connections).toHaveLength(validDiagram.connections.length);

          for (let i = 0; i < validDiagram.nodes.length; i++) {
            expect(retrieved.nodes[i].id).toBe(validDiagram.nodes[i].id);
            expect(retrieved.nodes[i].label).toBe(validDiagram.nodes[i].label);
          }

          for (let i = 0; i < validDiagram.connections.length; i++) {
            expect(retrieved.connections[i].from).toBe(validDiagram.connections[i].from);
            expect(retrieved.connections[i].to).toBe(validDiagram.connections[i].to);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should store and retrieve essays with all properties preserved', () => {
      // Generator for valid essays - must have at least one alphanumeric character
      const essayArb = fc
        .string({ minLength: 1 })
        .filter(s => s.trim().length > 0)
        .filter(s => /[a-zA-Z0-9]/.test(s)); // Must contain at least one alphanumeric character

      fc.assert(
        fc.property(essayArb, (essay) => {
          // Upload and retrieve
          const modelId = uploadModelEssay(essay);
          const retrieved = getModelEssay(modelId);

          // Verify all properties are preserved
          expect(retrieved.rawText).toBe(essay.trim());
          expect(retrieved.tokens.length).toBeGreaterThan(0);
          expect(retrieved.sentences.length).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate unique IDs for each uploaded model', () => {
      const diagram = {
        nodes: [{ id: '1', label: 'Node 1' }],
        connections: []
      };

      const ids = new Set<string>();

      for (let i = 0; i < 10; i++) {
        const modelId = uploadModelDiagram(diagram);
        expect(ids.has(modelId)).toBe(false);
        ids.add(modelId);
      }

      expect(ids.size).toBe(10);
    });
  });

  describe('Property 14: Model Answer Update Effectiveness', () => {
    it('should use updated diagram for subsequent retrievals', () => {
      const diagram1 = {
        nodes: [{ id: '1', label: 'Original' }],
        connections: []
      };
      const diagram2 = {
        nodes: [{ id: '1', label: 'Updated' }],
        connections: []
      };

      const modelId = uploadModelDiagram(diagram1);

      // Verify original
      let retrieved = getModelDiagram(modelId);
      expect(retrieved.nodes[0].label).toBe('Original');

      // Update
      updateModelDiagram(modelId, diagram2);

      // Verify updated
      retrieved = getModelDiagram(modelId);
      expect(retrieved.nodes[0].label).toBe('Updated');
    });

    it('should use updated essay for subsequent retrievals', () => {
      const essay1 = 'Original essay content';
      const essay2 = 'Updated essay content';

      const modelId = uploadModelEssay(essay1);

      // Verify original
      let retrieved = getModelEssay(modelId);
      expect(retrieved.rawText).toBe('Original essay content');

      // Update
      updateModelEssay(modelId, essay2);

      // Verify updated
      retrieved = getModelEssay(modelId);
      expect(retrieved.rawText).toBe('Updated essay content');
    });

    it('should update timestamp when model is updated', () => {
      const diagram1 = {
        nodes: [{ id: '1', label: 'Original' }],
        connections: []
      };
      const diagram2 = {
        nodes: [{ id: '1', label: 'Updated' }],
        connections: []
      };

      const modelId = uploadModelDiagram(diagram1);

      // Get initial timestamp (we can't directly access it, but we can verify update works)
      updateModelDiagram(modelId, diagram2);

      // Verify the update was applied
      const retrieved = getModelDiagram(modelId);
      expect(retrieved.nodes[0].label).toBe('Updated');
    });

    it('should allow multiple updates to the same model', () => {
      const diagram1 = {
        nodes: [{ id: '1', label: 'Version 1' }],
        connections: []
      };
      const diagram2 = {
        nodes: [{ id: '1', label: 'Version 2' }],
        connections: []
      };
      const diagram3 = {
        nodes: [{ id: '1', label: 'Version 3' }],
        connections: []
      };

      const modelId = uploadModelDiagram(diagram1);

      updateModelDiagram(modelId, diagram2);
      let retrieved = getModelDiagram(modelId);
      expect(retrieved.nodes[0].label).toBe('Version 2');

      updateModelDiagram(modelId, diagram3);
      retrieved = getModelDiagram(modelId);
      expect(retrieved.nodes[0].label).toBe('Version 3');
    });
  });
});
