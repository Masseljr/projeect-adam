/**
 * Diagram Evaluator - Evaluates student diagrams against model diagrams
 * Uses rule-based evaluation for structure validation
 */

import { DiagramStructure, DiagramBreakdown } from '../models/types';
import { getNodeCount, getConnectionCount, extractNodeLabels } from '../parsers/diagramParser';

/**
 * Represents the result of diagram evaluation
 */
export interface DiagramEvaluationResult {
  score: number;
  breakdown: DiagramBreakdown;
}

/**
 * Validates that a score is within the valid range [0, 100]
 * @param score - The score to validate
 * @returns true if score is valid, false otherwise
 */
export function isValidScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100;
}

/**
 * Normalizes a score to be within [0, 100] range
 * @param score - The score to normalize
 * @returns Normalized score between 0 and 100
 */
export function normalizeScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculates node count match score
 * Compares the number of nodes between student and model diagrams
 * @param studentNodeCount - Number of nodes in student diagram
 * @param modelNodeCount - Number of nodes in model diagram
 * @returns Score between 0 and 100
 */
export function calculateNodeCountMatch(studentNodeCount: number, modelNodeCount: number): number {
  if (modelNodeCount === 0) {
    return studentNodeCount === 0 ? 100 : 0;
  }

  // Calculate percentage match
  const difference = Math.abs(studentNodeCount - modelNodeCount);
  const percentageDifference = (difference / modelNodeCount) * 100;

  // Score decreases with difference: 100 if exact match, 0 if difference >= 100%
  const score = Math.max(0, 100 - percentageDifference);
  return normalizeScore(score);
}

/**
 * Calculates connection count match score
 * Compares the number of connections between student and model diagrams
 * @param studentConnectionCount - Number of connections in student diagram
 * @param modelConnectionCount - Number of connections in model diagram
 * @returns Score between 0 and 100
 */
export function calculateConnectionCountMatch(studentConnectionCount: number, modelConnectionCount: number): number {
  if (modelConnectionCount === 0) {
    return studentConnectionCount === 0 ? 100 : 0;
  }

  // Calculate percentage match
  const difference = Math.abs(studentConnectionCount - modelConnectionCount);
  const percentageDifference = (difference / modelConnectionCount) * 100;

  // Score decreases with difference: 100 if exact match, 0 if difference >= 100%
  const score = Math.max(0, 100 - percentageDifference);
  return normalizeScore(score);
}

/**
 * Calculates label accuracy score
 * Compares node labels between student and model diagrams
 * @param studentLabels - Array of node labels from student diagram
 * @param modelLabels - Array of node labels from model diagram
 * @returns Score between 0 and 100
 */
export function calculateLabelAccuracy(studentLabels: string[], modelLabels: string[]): number {
  if (modelLabels.length === 0) {
    return studentLabels.length === 0 ? 100 : 0;
  }

  // Normalize labels for comparison (lowercase, trim whitespace)
  const normalizeLabel = (label: string): string => label.toLowerCase().trim();
  const normalizedStudentLabels = studentLabels.map(normalizeLabel);
  const normalizedModelLabels = modelLabels.map(normalizeLabel);

  // Create a set of model labels for efficient lookup
  const modelLabelSet = new Set(normalizedModelLabels);

  // Count how many student labels match model labels
  let matchCount = 0;
  for (const label of normalizedStudentLabels) {
    if (modelLabelSet.has(label)) {
      matchCount++;
    }
  }

  // Calculate accuracy as percentage of model labels that are present in student labels
  const accuracy = (matchCount / normalizedModelLabels.length) * 100;
  return normalizeScore(accuracy);
}

/**
 * Evaluates a student diagram against a model diagram
 * Compares node counts, connection counts, and label accuracy
 * Produces a combined diagram score using weighted components
 * @param studentDiagram - The student's diagram
 * @param modelDiagram - The model/reference diagram
 * @returns DiagramEvaluationResult with score and breakdown
 */
export function evaluateDiagram(studentDiagram: DiagramStructure, modelDiagram: DiagramStructure): DiagramEvaluationResult {
  // Get counts
  const studentNodeCount = getNodeCount(studentDiagram);
  const modelNodeCount = getNodeCount(modelDiagram);
  const studentConnectionCount = getConnectionCount(studentDiagram);
  const modelConnectionCount = getConnectionCount(modelDiagram);

  // Get labels
  const studentLabels = extractNodeLabels(studentDiagram);
  const modelLabels = extractNodeLabels(modelDiagram);

  // Calculate component scores
  const nodeCountMatch = calculateNodeCountMatch(studentNodeCount, modelNodeCount);
  const connectionCountMatch = calculateConnectionCountMatch(studentConnectionCount, modelConnectionCount);
  const labelAccuracy = calculateLabelAccuracy(studentLabels, modelLabels);

  // Calculate weighted diagram score
  // 30% node count + 30% connection count + 40% label accuracy
  const diagramScore = (nodeCountMatch * 0.3) + (connectionCountMatch * 0.3) + (labelAccuracy * 0.4);

  // Ensure final score is within valid range
  const finalScore = normalizeScore(diagramScore);

  return {
    score: finalScore,
    breakdown: {
      nodeCountMatch,
      connectionCountMatch,
      labelAccuracy
    }
  };
}
