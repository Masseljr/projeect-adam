/**
 * Diagram Parser - Extracts nodes and connections from diagram structures
 * Supports JSON representation of diagrams
 */

import { DiagramStructure, DiagramNode, DiagramConnection } from '../models/types';

/**
 * Represents a raw diagram input (JSON format)
 */
export interface RawDiagram {
  nodes?: Array<{ id: string; label: string; type?: string }>;
  connections?: Array<{ from: string; to: string; label?: string }>;
}

/**
 * Validates that a diagram structure is valid
 * @param diagram - The diagram to validate
 * @returns true if diagram is valid, false otherwise
 */
export function isValidDiagramStructure(diagram: any): boolean {
  if (!diagram || typeof diagram !== 'object') {
    return false;
  }

  // Check nodes array
  if (diagram.nodes !== undefined) {
    if (!Array.isArray(diagram.nodes)) {
      return false;
    }
    for (const node of diagram.nodes) {
      if (!node.id || typeof node.id !== 'string' || !node.label || typeof node.label !== 'string') {
        return false;
      }
    }
  }

  // Check connections array
  if (diagram.connections !== undefined) {
    if (!Array.isArray(diagram.connections)) {
      return false;
    }
    for (const conn of diagram.connections) {
      if (!conn.from || typeof conn.from !== 'string' || !conn.to || typeof conn.to !== 'string') {
        return false;
      }
    }
  }

  return true;
}

/**
 * Parses a diagram from JSON representation
 * Extracts nodes and connections, validates structure
 * @param diagramData - Raw diagram data (JSON object or string)
 * @returns Parsed DiagramStructure
 * @throws Error if diagram format is invalid
 */
export function parseDiagram(diagramData: string | RawDiagram): DiagramStructure {
  let diagram: any;

  // Parse JSON string if needed
  if (typeof diagramData === 'string') {
    try {
      diagram = JSON.parse(diagramData);
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    diagram = diagramData;
  }

  // Validate diagram structure
  if (!isValidDiagramStructure(diagram)) {
    throw new Error('Invalid diagram structure: must contain nodes array with id and label properties, and optional connections array');
  }

  // Extract nodes
  const nodes: DiagramNode[] = (diagram.nodes || []).map((node: any) => ({
    id: node.id,
    label: node.label,
    type: node.type || undefined
  }));

  // Extract connections
  const connections: DiagramConnection[] = (diagram.connections || []).map((conn: any) => ({
    from: conn.from,
    to: conn.to,
    label: conn.label || undefined
  }));

  return {
    nodes,
    connections
  };
}

/**
 * Extracts node labels from a diagram
 * @param diagram - The parsed diagram structure
 * @returns Array of node labels
 */
export function extractNodeLabels(diagram: DiagramStructure): string[] {
  return diagram.nodes.map(node => node.label);
}

/**
 * Gets the count of nodes in a diagram
 * @param diagram - The parsed diagram structure
 * @returns Number of nodes
 */
export function getNodeCount(diagram: DiagramStructure): number {
  return diagram.nodes.length;
}

/**
 * Gets the count of connections in a diagram
 * @param diagram - The parsed diagram structure
 * @returns Number of connections
 */
export function getConnectionCount(diagram: DiagramStructure): number {
  return diagram.connections.length;
}

/**
 * Validates that all connections reference existing nodes
 * @param diagram - The parsed diagram structure
 * @returns true if all connections are valid, false otherwise
 */
export function validateConnectionReferences(diagram: DiagramStructure): boolean {
  const nodeIds = new Set(diagram.nodes.map(node => node.id));

  for (const connection of diagram.connections) {
    if (!nodeIds.has(connection.from) || !nodeIds.has(connection.to)) {
      return false;
    }
  }

  return true;
}
