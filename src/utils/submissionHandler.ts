/**
 * Submission Handler - Validates and processes student submissions
 * Handles diagram and essay file validation, parsing, and submission ID generation
 */

import { DiagramStructure, EssayContent } from '../models/types';
import { parseDiagram } from '../parsers/diagramParser';
import { parseEssay } from '../parsers/essayParser';

/**
 * Represents a submission result with parsed content or error
 */
export interface SubmissionResult {
  success: boolean;
  submissionId?: string;
  diagramContent?: DiagramStructure;
  essayContent?: EssayContent;
  error?: string;
  timestamp: string;
}

/**
 * Represents submission input files
 */
export interface SubmissionInput {
  diagramFile: string | object;
  essayFile: string;
}

/**
 * Generates a unique submission ID
 * @returns A unique submission ID string
 */
export function generateSubmissionId(): string {
  // Simple UUID-like generation without external dependency
  return `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates that essay file is present (diagram is optional)
 * @param diagramFile - The diagram file content (optional)
 * @param essayFile - The essay file content (required)
 * @returns Object with validation result and error message if invalid
 */
export function validateFilesPresent(
  diagramFile: string | object | undefined,
  essayFile: string | undefined
): { valid: boolean; error?: string; essayOnly?: boolean } {
  // Essay is required
  if (!essayFile) {
    return {
      valid: false,
      error: 'Essay file is missing. Please provide a valid essay file.'
    };
  }

  // Diagram is optional - if missing, it's an essay-only submission
  if (!diagramFile) {
    return {
      valid: true,
      essayOnly: true
    };
  }

  return { valid: true };
}

/**
 * Validates diagram file format (optional - can be empty for essay-only submissions)
 * @param diagramFile - The diagram file content (optional)
 * @returns Object with validation result and error message if invalid
 */
export function validateDiagramFormat(diagramFile: string | object | undefined): { valid: boolean; error?: string; isEmpty?: boolean } {
  // If no diagram provided, it's valid (essay-only submission)
  if (!diagramFile) {
    return { valid: true, isEmpty: true };
  }

  try {
    // If it's a string, try to parse as JSON
    if (typeof diagramFile === 'string') {
      JSON.parse(diagramFile);
    } else if (typeof diagramFile !== 'object' || diagramFile === null) {
      return {
        valid: false,
        error: 'Diagram must be a valid JSON string or object.'
      };
    }
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid diagram format: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validates essay file format
 * @param essayFile - The essay file content
 * @returns Object with validation result and error message if invalid
 */
export function validateEssayFormat(essayFile: string): { valid: boolean; error?: string } {
  if (typeof essayFile !== 'string') {
    return {
      valid: false,
      error: 'Essay must be a string.'
    };
  }

  if (essayFile.trim().length === 0) {
    return {
      valid: false,
      error: 'Essay content cannot be empty.'
    };
  }

  return { valid: true };
}

/**
 * Submits an assignment with diagram and essay files
 * Diagram is optional - if not provided, submission is essay-only
 * @param diagramFile - The diagram file content (JSON string or object, optional)
 * @param essayFile - The essay file content (text string, required)
 * @returns SubmissionResult with parsed content or error details
 */
export function submitAssignment(diagramFile: string | object | undefined, essayFile: string | undefined): SubmissionResult {
  const timestamp = new Date().toISOString();

  // Validate essay is present (diagram is optional)
  const filesValidation = validateFilesPresent(diagramFile, essayFile);
  if (!filesValidation.valid) {
    return {
      success: false,
      error: filesValidation.error,
      timestamp
    };
  }

  // Validate essay format
  const essayValidation = validateEssayFormat(essayFile!);
  if (!essayValidation.valid) {
    return {
      success: false,
      error: essayValidation.error,
      timestamp
    };
  }

  // Parse essay
  let essayContent: EssayContent;
  try {
    essayContent = parseEssay(essayFile!);
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse essay: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp
    };
  }

  // Handle diagram (optional)
  let diagramContent: DiagramStructure;
  
  if (!diagramFile) {
    // Essay-only submission: create empty diagram
    diagramContent = {
      nodes: [],
      connections: []
    };
  } else {
    // Validate diagram format
    const diagramValidation = validateDiagramFormat(diagramFile);
    if (!diagramValidation.valid) {
      return {
        success: false,
        error: diagramValidation.error,
        timestamp
      };
    }

    // Parse diagram
    try {
      diagramContent = parseDiagram(diagramFile);
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse diagram: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp
      };
    }
  }

  // Generate submission ID
  const submissionId = generateSubmissionId();

  return {
    success: true,
    submissionId,
    diagramContent,
    essayContent,
    timestamp
  };
}
