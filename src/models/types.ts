/**
 * Core data types and interfaces for the Diagram-Based Essay Grading System
 */

/**
 * Represents a node in a diagram
 */
export interface DiagramNode {
  id: string;
  label: string;
  type?: string;
}

/**
 * Represents a connection between nodes in a diagram
 */
export interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
}

/**
 * Represents the structure of a parsed diagram
 */
export interface DiagramStructure {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
}

/**
 * Represents the content of a parsed essay
 */
export interface EssayContent {
  rawText: string;
  tokens: string[];
  sentences: string[];
}

/**
 * Breakdown of diagram evaluation scores
 */
export interface DiagramBreakdown {
  nodeCountMatch: number;
  connectionCountMatch: number;
  labelAccuracy: number;
}

/**
 * Breakdown of essay evaluation scores
 */
export interface EssayBreakdown {
  keywordCoverage: number;
  termFrequency: number;
  contentLength: number;
}

/**
 * Complete evaluation result for a submission
 */
export interface EvaluationResult {
  submissionId: string;
  diagramScore: number;
  essayScore: number;
  hybridScore: number;
  diagramBreakdown: DiagramBreakdown;
  essayBreakdown: EssayBreakdown;
  timestamp: string;
}

/**
 * Submission metadata
 */
export interface Submission {
  id: string;
  studentId: string;
  diagramFile: string;
  essayFile: string;
  modelDiagramId: string;
  modelEssayId: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

/**
 * Report generated after grading
 */
export interface Report {
  submissionId: string;
  diagramScore: number;
  essayScore: number;
  hybridScore: number;
  diagramDetails: DiagramBreakdown;
  essayDetails: EssayBreakdown;
  timestamp: string;
}
