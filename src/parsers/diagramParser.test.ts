import * as fc from 'fast-check';
import {
  parseDiagram,
  isValidDiagramStructure,
  extractNodeLabels,
  getNodeCount,
  getConnectionCount,
  validateConnectionReferences,
  RawDiagram
} from './diagramParser';
import { DiagramStructure } from '../models/types';

describe('Diagram Parser', () => {
  describe('parseDiagram', () => {
    it('should parse valid JSON string diagram', () => {
      const diagramJson = JSON.stringify({
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [
          { from: '1', to: '2' }
        ]
      });

      const result = parseDiagram(diagramJson);
      expect(result.nodes).toHaveLength(2);
      expect(result.connections).toHaveLength(1);
    });

    it('should parse valid object diagram', () => {
      const diagram: RawDiagram = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [
          { from: '1', to: '2' }
        ]
      };

      const result = parseDiagram(diagram);
      expect(result.nodes).toHaveLength(2);
      expect(result.connections).toHaveLength(1);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => parseDiagram('invalid json')).toThrow('Invalid JSON format');
    });

    it('should throw error for invalid diagram structure', () => {
      expect(() => parseDiagram({ nodes: 'not an array' } as any)).toThrow('Invalid diagram structure');
    });

    it('should handle diagrams with no connections', () => {
      const diagram: RawDiagram = {
        nodes: [
          { id: '1', label: 'Node A' }
        ]
      };

      const result = parseDiagram(diagram);
      expect(result.nodes).toHaveLength(1);
      expect(result.connections).toHaveLength(0);
    });

    it('should preserve node types when provided', () => {
      const diagram: RawDiagram = {
        nodes: [
          { id: '1', label: 'Node A', type: 'concept' }
        ]
      };

      const result = parseDiagram(diagram);
      expect(result.nodes[0].type).toBe('concept');
    });

    it('should preserve connection labels when provided', () => {
      const diagram: RawDiagram = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [
          { from: '1', to: '2', label: 'relates to' }
        ]
      };

      const result = parseDiagram(diagram);
      expect(result.connections[0].label).toBe('relates to');
    });
  });

  describe('isValidDiagramStructure', () => {
    it('should validate correct diagram structure', () => {
      const diagram = {
        nodes: [{ id: '1', label: 'Node A' }],
        connections: []
      };
      expect(isValidDiagramStructure(diagram)).toBe(true);
    });

    it('should reject non-object input', () => {
      expect(isValidDiagramStructure(null)).toBe(false);
      expect(isValidDiagramStructure('string')).toBe(false);
      expect(isValidDiagramStructure(123)).toBe(false);
    });

    it('should reject nodes without id', () => {
      const diagram = {
        nodes: [{ label: 'Node A' }]
      };
      expect(isValidDiagramStructure(diagram)).toBe(false);
    });

    it('should reject nodes without label', () => {
      const diagram = {
        nodes: [{ id: '1' }]
      };
      expect(isValidDiagramStructure(diagram)).toBe(false);
    });

    it('should reject connections without from', () => {
      const diagram = {
        nodes: [{ id: '1', label: 'Node A' }],
        connections: [{ to: '1' }]
      };
      expect(isValidDiagramStructure(diagram)).toBe(false);
    });

    it('should reject connections without to', () => {
      const diagram = {
        nodes: [{ id: '1', label: 'Node A' }],
        connections: [{ from: '1' }]
      };
      expect(isValidDiagramStructure(diagram)).toBe(false);
    });
  });

  describe('extractNodeLabels', () => {
    it('should extract all node labels', () => {
      const diagram: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' },
          { id: '3', label: 'Node C' }
        ],
        connections: []
      };

      const labels = extractNodeLabels(diagram);
      expect(labels).toEqual(['Node A', 'Node B', 'Node C']);
    });

    it('should return empty array for diagram with no nodes', () => {
      const diagram: DiagramStructure = {
        nodes: [],
        connections: []
      };

      const labels = extractNodeLabels(diagram);
      expect(labels).toEqual([]);
    });
  });

  describe('getNodeCount', () => {
    it('should return correct node count', () => {
      const diagram: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: []
      };

      expect(getNodeCount(diagram)).toBe(2);
    });

    it('should return 0 for empty diagram', () => {
      const diagram: DiagramStructure = {
        nodes: [],
        connections: []
      };

      expect(getNodeCount(diagram)).toBe(0);
    });
  });

  describe('getConnectionCount', () => {
    it('should return correct connection count', () => {
      const diagram: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [
          { from: '1', to: '2' },
          { from: '2', to: '1' }
        ]
      };

      expect(getConnectionCount(diagram)).toBe(2);
    });

    it('should return 0 for diagram with no connections', () => {
      const diagram: DiagramStructure = {
        nodes: [{ id: '1', label: 'Node A' }],
        connections: []
      };

      expect(getConnectionCount(diagram)).toBe(0);
    });
  });

  describe('validateConnectionReferences', () => {
    it('should validate correct connection references', () => {
      const diagram: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Node A' },
          { id: '2', label: 'Node B' }
        ],
        connections: [
          { from: '1', to: '2' }
        ]
      };

      expect(validateConnectionReferences(diagram)).toBe(true);
    });

    it('should reject connection with invalid from node', () => {
      const diagram: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Node A' }
        ],
        connections: [
          { from: '999', to: '1' }
        ]
      };

      expect(validateConnectionReferences(diagram)).toBe(false);
    });

    it('should reject connection with invalid to node', () => {
      const diagram: DiagramStructure = {
        nodes: [
          { id: '1', label: 'Node A' }
        ],
        connections: [
          { from: '1', to: '999' }
        ]
      };

      expect(validateConnectionReferences(diagram)).toBe(false);
    });
  });

  // Property-Based Tests

  describe('Property 1: Diagram Node Extraction Completeness', () => {
    it('should extract exactly N nodes for any valid diagram with N nodes', () => {
      // Feature: diagram-essay-grading-system, Property 1: Diagram Node Extraction Completeness
      // Validates: Requirements 1.1, 1.5

      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              label: fc.string({ minLength: 1 })
            }),
            { minLength: 0, maxLength: 50 }
          ),
          (nodeArray) => {
            // Create a diagram with the generated nodes
            const diagram: RawDiagram = {
              nodes: nodeArray.map((node, index) => ({
                id: `node_${index}`,
                label: node.label
              })),
              connections: []
            };

            // Parse the diagram
            const parsed = parseDiagram(diagram);

            // Verify: extracted node count equals input node count
            expect(parsed.nodes.length).toBe(nodeArray.length);

            // Verify: all node labels are preserved
            for (let i = 0; i < nodeArray.length; i++) {
              expect(parsed.nodes[i].label).toBe(nodeArray[i].label);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all node labels exactly as provided', () => {
      // Feature: diagram-essay-grading-system, Property 1: Diagram Node Extraction Completeness
      // Validates: Requirements 1.1, 1.5

      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 20 }),
          (labels) => {
            const diagram: RawDiagram = {
              nodes: labels.map((label, index) => ({
                id: `node_${index}`,
                label: label
              })),
              connections: []
            };

            const parsed = parseDiagram(diagram);
            const extractedLabels = extractNodeLabels(parsed);

            // Verify: extracted labels match input labels exactly
            expect(extractedLabels).toEqual(labels);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Diagram Connection Extraction Completeness', () => {
    it('should extract exactly C connections for any valid diagram with C connections', () => {
      // Feature: diagram-essay-grading-system, Property 2: Diagram Connection Extraction Completeness
      // Validates: Requirements 1.2

      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 1, max: 20 }),
            fc.array(
              fc.record({
                from: fc.integer({ min: 0, max: 19 }),
                to: fc.integer({ min: 0, max: 19 })
              }),
              { maxLength: 50 }
            )
          ),
          ([nodeCount, connectionArray]) => {
            // Create nodes
            const nodes = Array.from({ length: nodeCount }, (_, i) => ({
              id: `node_${i}`,
              label: `Node ${i}`
            }));

            // Create valid connections (ensure from/to reference existing nodes)
            const connections = connectionArray.map((conn) => ({
              from: `node_${conn.from % nodeCount}`,
              to: `node_${conn.to % nodeCount}`
            }));

            const diagram: RawDiagram = {
              nodes,
              connections
            };

            const parsed = parseDiagram(diagram);

            // Verify: extracted connection count equals input connection count
            expect(parsed.connections.length).toBe(connections.length);

            // Verify: all connections are preserved
            for (let i = 0; i < connections.length; i++) {
              expect(parsed.connections[i].from).toBe(connections[i].from);
              expect(parsed.connections[i].to).toBe(connections[i].to);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all connection details exactly as provided', () => {
      // Feature: diagram-essay-grading-system, Property 2: Diagram Connection Extraction Completeness
      // Validates: Requirements 1.2

      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              from: fc.string({ minLength: 1 }),
              to: fc.string({ minLength: 1 })
            }),
            { minLength: 0, maxLength: 30 }
          ),
          (connectionArray) => {
            // Create nodes for all connection endpoints
            const nodeIds = new Set<string>();
            connectionArray.forEach((conn) => {
              nodeIds.add(conn.from);
              nodeIds.add(conn.to);
            });

            const nodes = Array.from(nodeIds).map((id) => ({
              id,
              label: `Label for ${id}`
            }));

            const diagram: RawDiagram = {
              nodes,
              connections: connectionArray
            };

            const parsed = parseDiagram(diagram);

            // Verify: connection count matches
            expect(parsed.connections.length).toBe(connectionArray.length);

            // Verify: all connections are preserved exactly
            for (let i = 0; i < connectionArray.length; i++) {
              expect(parsed.connections[i].from).toBe(connectionArray[i].from);
              expect(parsed.connections[i].to).toBe(connectionArray[i].to);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
