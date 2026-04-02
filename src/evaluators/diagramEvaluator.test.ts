import * as fc from 'fast-check';
import {
  evaluateDiagram,
  calculateNodeCountMatch,
  calculateConnectionCountMatch,
  calculateLabelAccuracy,
  isValidScore,
  normalizeScore,
  DiagramEvaluationResult
} from './diagramEvaluator';
import { DiagramStructure } from '../models/types';

describe('Diagram Evaluator', () => {
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

  describe('normalizeScore', () => {
    it('should keep scores within range unchanged', () => {
      expect(normalizeScore(0)).toBe(0);
      expect(normalizeScore(50)).toBe(50);
      expect(normalizeScore(100)).toBe(100);
    });

    it('should clamp scores below 0 to 0', () => {
      expect(normalizeScore(-10)).toBe(0);
      expect(normalizeScore(-100)).toBe(0);
    });

    it('should clamp scores above 100 to 100', () => {
      expect(normalizeScore(101)).toBe(100);
      expect(normalizeScore(200)).toBe(100);
    });
  });

  describe('calculateNodeCountMatch', () => {
    it('should return 100 for exact match', () => {
      expect(calculateNodeCountMatch(5, 5)).toBe(100);
      expect(calculateNodeCountMatch(0, 0)).toBe(100);
      expect(calculateNodeCountMatch(1, 1)).toBe(100);
    });

    it('should return 0 for complete mismatch when model is empty', () => {
      expect(calculateNodeCountMatch(5, 0)).toBe(0);
      expect(calculateNodeCountMatch(1, 0)).toBe(0);
    });

    it('should return 100 when both are empty', () => {
      expect(calculateNodeCountMatch(0, 0)).toBe(100);
    });

    it('should decrease score with difference', () => {
      const score50Diff = calculateNodeCountMatch(5, 10); // 50% difference
      const score100Diff = calculateNodeCountMatch(10, 5); // 100% difference
      expect(score50Diff).toBeGreaterThan(0);
      expect(score50Diff).toBeLessThan(100);
      expect(score100Diff).toBe(0);
    });

    it('should always return valid score', () => {
      expect(isValidScore(calculateNodeCountMatch(0, 5))).toBe(true);
      expect(isValidScore(calculateNodeCountMatch(100, 1))).toBe(true);
      expect(isValidScore(calculateNodeCountMatch(5, 5))).toBe(true);
    });
  });

  describe('calculateConnectionCountMatch', () => {
    it('should return 100 for exact match', () => {
      expect(calculateConnectionCountMatch(5, 5)).toBe(100);
      expect(calculateConnectionCountMatch(0, 0)).toBe(100);
      expect(calculateConnectionCountMatch(1, 1)).toBe(100);
    });

    it('should return 0 for complete mismatch when model is empty', () => {
      expect(calculateConnectionCountMatch(5, 0)).toBe(0);
      expect(calculateConnectionCountMatch(1, 0)).toBe(0);
    });

    it('should return 100 when both are empty', () => {
      expect(calculateConnectionCountMatch(0, 0)).toBe(100);
    });

    it('should decrease score with difference', () => {
      const score50Diff = calculateConnectionCountMatch(5, 10); // 50% difference
      const score100Diff = calculateConnectionCountMatch(10, 5); // 100% difference
      expect(score50Diff).toBeGreaterThan(0);
      expect(score50Diff).toBeLessThan(100);
      expect(score100Diff).toBe(0);
    });

    it('should always return valid score', () => {
      expect(isValidScore(calculateConnectionCountMatch(0, 5))).toBe(true);
      expect(isValidScore(calculateConnectionCountMatch(100, 1))).toBe(true);
      expect(isValidScore(calculateConnectionCountMatch(5, 5))).toBe(true);
    });
  });

  describe('calculateLabelAccuracy', () => {
    it('should return 100 for exact label match', () => {
      const labels = ['Node A', 'Node B', 'Node C'];
      expect(calculateLabelAccuracy(labels, labels)).toBe(100);
    });

    it('should return 100 when both are empty', () => {
      expect(calculateLabelAccuracy([], [])).toBe(100);
    });

    it('should return 0 when model is empty but student has labels', () => {
      expect(calculateLabelAccuracy(['Node A'], [])).toBe(0);
    });

    it('should be case-insensitive', () => {
      expect(calculateLabelAccuracy(['node a', 'node b'], ['Node A', 'Node B'])).toBe(100);
    });

    it('should trim whitespace', () => {
      expect(calculateLabelAccuracy(['  Node A  ', 'Node B'], ['Node A', 'Node B'])).toBe(100);
    });

    it('should calculate partial matches', () => {
      const score = calculateLabelAccuracy(['Node A', 'Node B'], ['Node A', 'Node B', 'Node C']);
      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThan(0);
    });

    it('should always return valid score', () => {
      expect(isValidScore(calculateLabelAccuracy(['A'], ['B', 'C']))).toBe(true);
      expect(isValidScore(calculateLabelAccuracy([], ['A']))).toBe(true);
      expect(isValidScore(calculateLabelAccuracy(['A', 'B'], ['A', 'B']))).toBe(true);
    });
  });

  describe('evaluateDiagram', () => {
    it('should return valid score', () => {
      const student: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [{ from: '1', to: '2' }]
      };

      const model: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [{ from: '1', to: '2' }]
      };

      const result = evaluateDiagram(student, model);
      expect(isValidScore(result.score)).toBe(true);
    });

    it('should return 100 for perfect match', () => {
      const diagram: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [{ from: '1', to: '2' }]
      };

      const result = evaluateDiagram(diagram, diagram);
      expect(result.score).toBe(100);
    });

    it('should include breakdown with all components', () => {
      const student: DiagramStructure = {
        nodes: [{ id: '1', label: 'Node A' }],
        connections: []
      };

      const model: DiagramStructure = {
        nodes: [{ id: '1', label: 'Node A' }],
        connections: []
      };

      const result = evaluateDiagram(student, model);
      expect(result.breakdown).toHaveProperty('nodeCountMatch');
      expect(result.breakdown).toHaveProperty('connectionCountMatch');
      expect(result.breakdown).toHaveProperty('labelAccuracy');
    });

    it('should apply correct weights to components', () => {
      // Create diagrams where we can verify the weighting
      const student: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [{ from: '1', to: '2' }]
      };

      const model: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [{ from: '1', to: '2' }]
      };

      const result = evaluateDiagram(student, model);
      // All components should be 100, so final score should be 100
      expect(result.score).toBe(100);
      expect(result.breakdown.nodeCountMatch).toBe(100);
      expect(result.breakdown.connectionCountMatch).toBe(100);
      expect(result.breakdown.labelAccuracy).toBe(100);
    });
  });

  // Property-Based Tests

  describe('Property 3: Node Count Comparison Accuracy', () => {
    it('should correctly identify when node counts match', () => {
      // Feature: diagram-essay-grading-system, Property 3: Node Count Comparison Accuracy
      // Validates: Requirements 1.3

      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 50 }),
          (nodeCount) => {
            // Create student diagram with nodeCount nodes
            const studentNodes = Array.from({ length: nodeCount }, (_, i) => ({
              id: `node_${i}`,
              label: `Node ${i}`
            }));

            const student: DiagramStructure = {
              nodes: studentNodes,
              connections: []
            };

            // Create model diagram with same nodeCount
            const modelNodes = Array.from({ length: nodeCount }, (_, i) => ({
              id: `model_node_${i}`,
              label: `Model Node ${i}`
            }));

            const model: DiagramStructure = {
              nodes: modelNodes,
              connections: []
            };

            const result = evaluateDiagram(student, model);

            // When node counts match, nodeCountMatch should be 100
            expect(result.breakdown.nodeCountMatch).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify when node counts differ', () => {
      // Feature: diagram-essay-grading-system, Property 3: Node Count Comparison Accuracy
      // Validates: Requirements 1.3

      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 1, max: 50 }),
            fc.integer({ min: 1, max: 50 })
          ),
          ([studentCount, modelCount]) => {
            fc.pre(studentCount !== modelCount); // Only test when counts differ

            const student: DiagramStructure = {
              nodes: Array.from({ length: studentCount }, (_, i) => ({
                id: `node_${i}`,
                label: `Node ${i}`
              })),
              connections: []
            };

            const model: DiagramStructure = {
              nodes: Array.from({ length: modelCount }, (_, i) => ({
                id: `model_node_${i}`,
                label: `Model Node ${i}`
              })),
              connections: []
            };

            const result = evaluateDiagram(student, model);

            // When node counts differ, nodeCountMatch should be less than 100
            expect(result.breakdown.nodeCountMatch).toBeLessThan(100);
            // But should still be a valid score
            expect(isValidScore(result.breakdown.nodeCountMatch)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Connection Count Comparison Accuracy', () => {
    it('should correctly identify when connection counts match', () => {
      // Feature: diagram-essay-grading-system, Property 4: Connection Count Comparison Accuracy
      // Validates: Requirements 1.4

      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 30 }),
          (connectionCount) => {
            // Create nodes for connections
            const nodeCount = Math.max(2, connectionCount + 1);
            const nodes = Array.from({ length: nodeCount }, (_, i) => ({
              id: `node_${i}`,
              label: `Node ${i}`
            }));

            // Create connections
            const connections = Array.from({ length: connectionCount }, (_, i) => ({
              from: `node_${i % nodeCount}`,
              to: `node_${(i + 1) % nodeCount}`
            }));

            const student: DiagramStructure = {
              nodes,
              connections
            };

            const model: DiagramStructure = {
              nodes,
              connections
            };

            const result = evaluateDiagram(student, model);

            // When connection counts match, connectionCountMatch should be 100
            expect(result.breakdown.connectionCountMatch).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify when connection counts differ', () => {
      // Feature: diagram-essay-grading-system, Property 4: Connection Count Comparison Accuracy
      // Validates: Requirements 1.4

      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 1, max: 30 }),
            fc.integer({ min: 1, max: 30 })
          ),
          ([studentConnCount, modelConnCount]) => {
            fc.pre(studentConnCount !== modelConnCount); // Only test when counts differ

            const nodeCount = Math.max(2, Math.max(studentConnCount, modelConnCount) + 1);
            const nodes = Array.from({ length: nodeCount }, (_, i) => ({
              id: `node_${i}`,
              label: `Node ${i}`
            }));

            const studentConnections = Array.from({ length: studentConnCount }, (_, i) => ({
              from: `node_${i % nodeCount}`,
              to: `node_${(i + 1) % nodeCount}`
            }));

            const modelConnections = Array.from({ length: modelConnCount }, (_, i) => ({
              from: `node_${i % nodeCount}`,
              to: `node_${(i + 1) % nodeCount}`
            }));

            const student: DiagramStructure = {
              nodes,
              connections: studentConnections
            };

            const model: DiagramStructure = {
              nodes,
              connections: modelConnections
            };

            const result = evaluateDiagram(student, model);

            // When connection counts differ, connectionCountMatch should be less than 100
            expect(result.breakdown.connectionCountMatch).toBeLessThan(100);
            // But should still be a valid score
            expect(isValidScore(result.breakdown.connectionCountMatch)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Diagram Score Range Validity', () => {
    it('should always produce a score between 0 and 100', () => {
      // Feature: diagram-essay-grading-system, Property 5: Diagram Score Range Validity
      // Validates: Requirements 1.6

      fc.assert(
        fc.property(
          fc.tuple(
            fc.array(
              fc.record({
                id: fc.string({ minLength: 1 }),
                label: fc.string({ minLength: 1 })
              }),
              { minLength: 0, maxLength: 50 }
            ),
            fc.array(
              fc.record({
                id: fc.string({ minLength: 1 }),
                label: fc.string({ minLength: 1 })
              }),
              { minLength: 0, maxLength: 50 }
            )
          ),
          ([studentNodeArray, modelNodeArray]) => {
            // Create student diagram
            const studentNodes = studentNodeArray.map((node, i) => ({
              id: `s_node_${i}`,
              label: node.label
            }));

            const student: DiagramStructure = {
              nodes: studentNodes,
              connections: []
            };

            // Create model diagram
            const modelNodes = modelNodeArray.map((node, i) => ({
              id: `m_node_${i}`,
              label: node.label
            }));

            const model: DiagramStructure = {
              nodes: modelNodes,
              connections: []
            };

            const result = evaluateDiagram(student, model);

            // Verify: score is always between 0 and 100
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(100);
            expect(isValidScore(result.score)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce valid scores for all component combinations', () => {
      // Feature: diagram-essay-grading-system, Property 5: Diagram Score Range Validity
      // Validates: Requirements 1.6

      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 0, max: 50 }),
            fc.integer({ min: 0, max: 50 }),
            fc.integer({ min: 0, max: 50 }),
            fc.integer({ min: 0, max: 50 })
          ),
          ([studentNodes, modelNodes, studentConns, modelConns]) => {
            const nodeCount = Math.max(2, Math.max(studentNodes, modelNodes) + 1);
            const nodes = Array.from({ length: nodeCount }, (_, i) => ({
              id: `node_${i}`,
              label: `Node ${i}`
            }));

            const student: DiagramStructure = {
              nodes: nodes.slice(0, studentNodes),
              connections: Array.from({ length: studentConns }, (_, i) => ({
                from: `node_${i % nodeCount}`,
                to: `node_${(i + 1) % nodeCount}`
              }))
            };

            const model: DiagramStructure = {
              nodes: nodes.slice(0, modelNodes),
              connections: Array.from({ length: modelConns }, (_, i) => ({
                from: `node_${i % nodeCount}`,
                to: `node_${(i + 1) % nodeCount}`
              }))
            };

            const result = evaluateDiagram(student, model);

            // Verify: final score is always valid
            expect(isValidScore(result.score)).toBe(true);
            // Verify: all breakdown components are valid
            expect(isValidScore(result.breakdown.nodeCountMatch)).toBe(true);
            expect(isValidScore(result.breakdown.connectionCountMatch)).toBe(true);
            expect(isValidScore(result.breakdown.labelAccuracy)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
