/**
 * Utility functions for score validation and normalization
 */

/**
 * Validates that a score is within the valid range [0, 100]
 * @param score - The score to validate
 * @returns true if score is valid, false otherwise
 */
export function isValidScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100;
}

/**
 * Normalizes a score to the range [0, 100]
 * @param score - The score to normalize
 * @returns Normalized score clamped to [0, 100]
 */
export function normalizeScore(score: number): number {
  if (!isFinite(score)) {
    return 0;
  }
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculates a weighted average of scores
 * @param scores - Array of scores to average
 * @param weights - Array of weights corresponding to each score
 * @returns Weighted average normalized to [0, 100]
 */
export function calculateWeightedAverage(scores: number[], weights: number[]): number {
  if (scores.length === 0 || weights.length === 0) {
    return 0;
  }

  if (scores.length !== weights.length) {
    throw new Error('Scores and weights arrays must have the same length');
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) {
    throw new Error('Total weight cannot be zero');
  }

  const weightedSum = scores.reduce((sum, score, index) => {
    return sum + score * weights[index];
  }, 0);

  return normalizeScore(weightedSum / totalWeight);
}

/**
 * Validates a percentage value (0-100)
 * @param percentage - The percentage to validate
 * @returns true if percentage is valid, false otherwise
 */
export function isValidPercentage(percentage: number): boolean {
  return isValidScore(percentage);
}

/**
 * Rounds a score to a specified number of decimal places
 * @param score - The score to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded score
 */
export function roundScore(score: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(score * factor) / factor;
}
