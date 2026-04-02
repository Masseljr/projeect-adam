/**
 * Report Generator - Generates formatted reports from evaluation results
 * Produces JSON-formatted reports containing all scores and breakdowns
 */

import { EvaluationResult, Report } from '../models/types';
import { isValidScore, roundScore } from './scoreUtils';

/**
 * Validates that an evaluation result contains all required fields
 * @param result - The evaluation result to validate
 * @returns true if result is valid, false otherwise
 */
export function isValidEvaluationResult(result: EvaluationResult): boolean {
  return (
    typeof result.submissionId === 'string' &&
    isValidScore(result.diagramScore) &&
    isValidScore(result.essayScore) &&
    isValidScore(result.hybridScore) &&
    result.diagramBreakdown !== undefined &&
    result.essayBreakdown !== undefined &&
    typeof result.timestamp === 'string'
  );
}

/**
 * Generates a formatted report from evaluation results
 * Includes all scores, breakdowns, and evaluation details
 * @param evaluationResult - The evaluation result to format into a report
 * @returns Report object with formatted scores and details
 */
export function generateReport(evaluationResult: EvaluationResult): Report {
  // Validate input
  if (!isValidEvaluationResult(evaluationResult)) {
    throw new Error('Invalid evaluation result: missing required fields or invalid scores');
  }

  // Create report with rounded scores for readability
  const report: Report = {
    submissionId: evaluationResult.submissionId,
    diagramScore: roundScore(evaluationResult.diagramScore, 2),
    essayScore: roundScore(evaluationResult.essayScore, 2),
    hybridScore: roundScore(evaluationResult.hybridScore, 2),
    diagramDetails: {
      nodeCountMatch: roundScore(evaluationResult.diagramBreakdown.nodeCountMatch, 2),
      connectionCountMatch: roundScore(evaluationResult.diagramBreakdown.connectionCountMatch, 2),
      labelAccuracy: roundScore(evaluationResult.diagramBreakdown.labelAccuracy, 2)
    },
    essayDetails: {
      keywordCoverage: roundScore(evaluationResult.essayBreakdown.keywordCoverage, 2),
      termFrequency: roundScore(evaluationResult.essayBreakdown.termFrequency, 2),
      contentLength: roundScore(evaluationResult.essayBreakdown.contentLength, 2)
    },
    timestamp: evaluationResult.timestamp
  };

  return report;
}

/**
 * Converts a report to JSON string format
 * @param report - The report to convert
 * @param pretty - Whether to format with indentation (default: true)
 * @returns JSON string representation of the report
 */
export function reportToJSON(report: Report, pretty: boolean = true): string {
  if (pretty) {
    return JSON.stringify(report, null, 2);
  }
  return JSON.stringify(report);
}

/**
 * Converts a report to a human-readable string format
 * @param report - The report to format
 * @returns Formatted string representation of the report
 */
export function reportToString(report: Report): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('GRADING REPORT');
  lines.push('='.repeat(60));
  lines.push('');

  lines.push(`Submission ID: ${report.submissionId}`);
  lines.push(`Timestamp: ${report.timestamp}`);
  lines.push('');

  lines.push('-'.repeat(60));
  lines.push('SCORES');
  lines.push('-'.repeat(60));
  lines.push(`Diagram Score:  ${report.diagramScore.toFixed(2)}/100`);
  lines.push(`Essay Score:    ${report.essayScore.toFixed(2)}/100`);
  lines.push(`Hybrid Score:   ${report.hybridScore.toFixed(2)}/100`);
  lines.push('');

  lines.push('-'.repeat(60));
  lines.push('DIAGRAM EVALUATION DETAILS');
  lines.push('-'.repeat(60));
  lines.push(`Node Count Match:      ${report.diagramDetails.nodeCountMatch.toFixed(2)}/100`);
  lines.push(`Connection Count Match: ${report.diagramDetails.connectionCountMatch.toFixed(2)}/100`);
  lines.push(`Label Accuracy:        ${report.diagramDetails.labelAccuracy.toFixed(2)}/100`);
  lines.push('');

  lines.push('-'.repeat(60));
  lines.push('ESSAY EVALUATION DETAILS');
  lines.push('-'.repeat(60));
  lines.push(`Keyword Coverage: ${report.essayDetails.keywordCoverage.toFixed(2)}/100`);
  lines.push(`Term Frequency:   ${report.essayDetails.termFrequency.toFixed(2)}/100`);
  lines.push(`Content Length:   ${report.essayDetails.contentLength.toFixed(2)}/100`);
  lines.push('');

  lines.push('='.repeat(60));

  return lines.join('\n');
}
