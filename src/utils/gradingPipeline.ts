/**
 * Grading Pipeline - End-to-end processing pipeline
 * Orchestrates submission handling, parsing, evaluation, and reporting
 * Wires all components together for complete grading workflow
 */

import { DiagramStructure, EssayContent, EvaluationResult, Report } from '../models/types';
import { submitAssignment, SubmissionInput, SubmissionResult } from './submissionHandler';
import { evaluateDiagram } from '../evaluators/diagramEvaluator';
import { evaluateEssay } from '../evaluators/essayEvaluator';
import { calculateHybridScore } from './hybridScoreCalculator';
import { generateReport } from './reportGenerator';
import { getModelDiagram, getModelEssay } from './modelAnswerManager';

/**
 * Represents the complete grading pipeline result
 */
export interface GradingPipelineResult {
  success: boolean;
  report?: Report;
  error?: string;
  submissionId?: string;
}

/**
 * Represents input for the grading pipeline
 */
export interface GradingPipelineInput {
  diagramFile: string | object;
  essayFile: string;
  modelDiagramId: string;
  modelEssayId: string;
}

/**
 * Main grading pipeline function
 * Orchestrates the complete workflow: submission validation, parsing, evaluation, and reporting
 * @param input - The grading pipeline input containing submission files and model IDs
 * @returns GradingPipelineResult with report or error details
 */
export function gradeSubmission(input: GradingPipelineInput): GradingPipelineResult {
  try {
    // Step 1: Validate and parse submission
    const submissionResult = submitAssignment(input.diagramFile, input.essayFile);

    if (!submissionResult.success) {
      return {
        success: false,
        error: submissionResult.error || 'Unknown submission error'
      };
    }

    const submissionId = submissionResult.submissionId!;
    const studentDiagram = submissionResult.diagramContent!;
    const studentEssay = submissionResult.essayContent!;

    // Step 2: Retrieve model answers
    let modelDiagram: DiagramStructure;
    let modelEssay: EssayContent;

    try {
      modelDiagram = getModelDiagram(input.modelDiagramId);
    } catch (error) {
      return {
        success: false,
        error: `Failed to retrieve model diagram: ${error instanceof Error ? error.message : 'Unknown error'}`,
        submissionId
      };
    }

    try {
      modelEssay = getModelEssay(input.modelEssayId);
    } catch (error) {
      return {
        success: false,
        error: `Failed to retrieve model essay: ${error instanceof Error ? error.message : 'Unknown error'}`,
        submissionId
      };
    }

    // Step 3: Evaluate diagram
    let diagramEvaluationResult;
    try {
      diagramEvaluationResult = evaluateDiagram(studentDiagram, modelDiagram);
    } catch (error) {
      return {
        success: false,
        error: `Failed to evaluate diagram: ${error instanceof Error ? error.message : 'Unknown error'}`,
        submissionId
      };
    }

    // Step 4: Evaluate essay
    let essayEvaluationResult;
    try {
      essayEvaluationResult = evaluateEssay(studentEssay, modelEssay);
    } catch (error) {
      return {
        success: false,
        error: `Failed to evaluate essay: ${error instanceof Error ? error.message : 'Unknown error'}`,
        submissionId
      };
    }

    // Step 5: Calculate hybrid score
    let hybridScore: number;
    try {
      hybridScore = calculateHybridScore(diagramEvaluationResult.score, essayEvaluationResult.score);
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate hybrid score: ${error instanceof Error ? error.message : 'Unknown error'}`,
        submissionId
      };
    }

    // Step 6: Create evaluation result
    const evaluationResult: EvaluationResult = {
      submissionId,
      diagramScore: diagramEvaluationResult.score,
      essayScore: essayEvaluationResult.score,
      hybridScore,
      diagramBreakdown: diagramEvaluationResult.breakdown,
      essayBreakdown: essayEvaluationResult.breakdown,
      timestamp: new Date().toISOString()
    };

    // Step 7: Generate report
    let report: Report;
    try {
      report = generateReport(evaluationResult);
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        submissionId
      };
    }

    // Step 8: Return successful result
    return {
      success: true,
      report,
      submissionId
    };
  } catch (error) {
    // Catch any unexpected errors
    return {
      success: false,
      error: `Unexpected error in grading pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

