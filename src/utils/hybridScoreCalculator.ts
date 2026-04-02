/**
 * Hybrid Score Calculator
 * Combines diagram and essay scores into a final hybrid score
 */

import { normalizeScore } from './scoreUtils';

/**
 * Default weights for hybrid score calculation
 */
export const DEFAULT_WEIGHTS = {
  diagram: 0.25,
  essay: 0.75
};

/**
 * Calculates a hybrid score by combining diagram and essay scores with specified weights
 * @param diagramScore - The diagram evaluation score (0-100)
 * @param essayScore - The essay evaluation score (0-100)
 * @param diagramWeight - Weight for diagram score (default: 0.25)
 * @param essayWeight - Weight for essay score (default: 0.75)
 * @returns Hybrid score between 0 and 100
 */
export function calculateHybridScore(
  diagramScore: number,
  essayScore: number,
  diagramWeight: number = DEFAULT_WEIGHTS.diagram,
  essayWeight: number = DEFAULT_WEIGHTS.essay
): number {
  // Validate inputs are numbers
  if (typeof diagramScore !== 'number' || typeof essayScore !== 'number') {
    throw new Error('Diagram and essay scores must be numbers');
  }

  // Validate weights are numbers
  if (typeof diagramWeight !== 'number' || typeof essayWeight !== 'number') {
    throw new Error('Weights must be numbers');
  }

  // Normalize input scores to [0, 100]
  const normalizedDiagramScore = normalizeScore(diagramScore);
  const normalizedEssayScore = normalizeScore(essayScore);

  // Calculate total weight
  const totalWeight = diagramWeight + essayWeight;

  // Validate total weight is not zero
  if (totalWeight === 0) {
    throw new Error('Total weight cannot be zero');
  }

  // Calculate weighted sum
  const weightedSum = (normalizedDiagramScore * diagramWeight) + (normalizedEssayScore * essayWeight);

  // Calculate hybrid score by dividing by total weight
  const hybridScore = weightedSum / totalWeight;

  // Normalize result to ensure it's in [0, 100]
  return normalizeScore(hybridScore);
}
