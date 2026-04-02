/**
 * REST API Handlers - Framework-agnostic API endpoint handlers
 * Provides handlers for submission, model upload, and result retrieval endpoints
 */

import { gradeSubmission, GradingPipelineInput } from '../utils/gradingPipeline';
import { uploadModelDiagram, uploadModelEssay, getModelDiagram, getModelEssay, modelAnswerExists } from '../utils/modelAnswerManager';
import { Report } from '../models/types';

/**
 * Represents a standard API response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

/**
 * Represents the result storage for retrieving grading results
 * In a real application, this would be a database
 */
const resultStore = new Map<string, Report>();

/**
 * Stores a grading result for later retrieval
 * @param submissionId - The submission ID
 * @param report - The grading report
 */
export function storeGradingResult(submissionId: string, report: Report): void {
  resultStore.set(submissionId, report);
}

/**
 * Retrieves a stored grading result
 * @param submissionId - The submission ID
 * @returns The stored report or undefined if not found
 */
export function retrieveGradingResult(submissionId: string): Report | undefined {
  return resultStore.get(submissionId);
}

/**
 * Clears all stored results (useful for testing)
 */
export function clearAllResults(): void {
  resultStore.clear();
}

/**
 * POST /submit - Submit assignment endpoint handler
 * Accepts diagram and essay files, processes them, and returns grading result
 * @param diagramFile - The diagram file content (JSON string or object)
 * @param essayFile - The essay file content (text string)
 * @param modelDiagramId - The ID of the model diagram to compare against
 * @param modelEssayId - The ID of the model essay to compare against
 * @returns ApiResponse with grading report or error
 */
export function handleSubmitAssignment(
  diagramFile: string | object | undefined,
  essayFile: string | undefined,
  modelDiagramId: string | undefined,
  modelEssayId: string | undefined
): ApiResponse<Report> {
  // Validate required parameters
  if (!modelDiagramId) {
    return {
      success: false,
      error: 'modelDiagramId is required',
      statusCode: 400
    };
  }

  if (!modelEssayId) {
    return {
      success: false,
      error: 'modelEssayId is required',
      statusCode: 400
    };
  }

  // Check if model answers exist
  if (!modelAnswerExists(modelDiagramId)) {
    return {
      success: false,
      error: `Model diagram not found: ${modelDiagramId}`,
      statusCode: 404
    };
  }

  if (!modelAnswerExists(modelEssayId)) {
    return {
      success: false,
      error: `Model essay not found: ${modelEssayId}`,
      statusCode: 404
    };
  }

  // Process the submission
  const gradingInput: GradingPipelineInput = {
    diagramFile: diagramFile || '',
    essayFile: essayFile || '',
    modelDiagramId,
    modelEssayId
  };

  const gradingResult = gradeSubmission(gradingInput);

  if (!gradingResult.success) {
    return {
      success: false,
      error: gradingResult.error || 'Unknown grading error',
      statusCode: 400
    };
  }

  // Store the result for later retrieval
  if (gradingResult.report && gradingResult.submissionId) {
    storeGradingResult(gradingResult.submissionId, gradingResult.report);
  }

  return {
    success: true,
    data: gradingResult.report,
    statusCode: 200
  };
}

/**
 * POST /model/diagram - Upload model diagram endpoint handler
 * Accepts a diagram file and stores it as a model answer
 * @param diagramFile - The diagram file content (JSON string or object)
 * @returns ApiResponse with model ID or error
 */
export function handleUploadModelDiagram(diagramFile: string | object | undefined): ApiResponse<{ modelId: string }> {
  if (!diagramFile) {
    return {
      success: false,
      error: 'Diagram file is required',
      statusCode: 400
    };
  }

  try {
    const modelId = uploadModelDiagram(diagramFile);
    return {
      success: true,
      data: { modelId },
      statusCode: 201
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload model diagram',
      statusCode: 400
    };
  }
}

/**
 * POST /model/essay - Upload model essay endpoint handler
 * Accepts an essay file and stores it as a model answer
 * @param essayFile - The essay file content (text string)
 * @returns ApiResponse with model ID or error
 */
export function handleUploadModelEssay(essayFile: string | undefined): ApiResponse<{ modelId: string }> {
  if (!essayFile) {
    return {
      success: false,
      error: 'Essay file is required',
      statusCode: 400
    };
  }

  try {
    const modelId = uploadModelEssay(essayFile);
    return {
      success: true,
      data: { modelId },
      statusCode: 201
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload model essay',
      statusCode: 400
    };
  }
}

/**
 * GET /result/:submissionId - Get grading result endpoint handler
 * Retrieves a previously generated grading report
 * @param submissionId - The submission ID to retrieve
 * @returns ApiResponse with grading report or error
 */
export function handleGetResult(submissionId: string | undefined): ApiResponse<Report> {
  if (!submissionId) {
    return {
      success: false,
      error: 'submissionId is required',
      statusCode: 400
    };
  }

  const result = retrieveGradingResult(submissionId);

  if (!result) {
    return {
      success: false,
      error: `Result not found for submission: ${submissionId}`,
      statusCode: 404
    };
  }

  return {
    success: true,
    data: result,
    statusCode: 200
  };
}

