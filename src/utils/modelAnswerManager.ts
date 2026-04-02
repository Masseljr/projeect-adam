/**
 * Model Answer Manager - Stores and manages reference model answers
 * Provides functions to upload, retrieve, and validate model diagrams and essays
 */

import { DiagramStructure, EssayContent } from '../models/types';
import { parseDiagram, isValidDiagramStructure } from '../parsers/diagramParser';
import { parseEssay, isValidEssayContent } from '../parsers/essayParser';

/**
 * Represents a stored model answer with metadata
 */
export interface StoredModelAnswer {
  id: string;
  content: DiagramStructure | EssayContent;
  type: 'diagram' | 'essay';
  uploadedAt: string;
}

/**
 * In-memory storage for model answers
 * Maps model ID to stored model answer
 */
const modelAnswerStore = new Map<string, StoredModelAnswer>();

/**
 * Generates a unique ID for a model answer
 * @returns A unique string ID
 */
function generateModelId(): string {
  return `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates that a diagram contains required elements
 * @param diagram - The diagram structure to validate
 * @returns true if diagram has required elements, false otherwise
 */
export function validateDiagramElements(diagram: DiagramStructure): boolean {
  // Diagram must have at least one node
  if (!diagram.nodes || diagram.nodes.length === 0) {
    return false;
  }

  // All nodes must have id and label
  for (const node of diagram.nodes) {
    if (!node.id || !node.label) {
      return false;
    }
  }

  return true;
}

/**
 * Validates that an essay contains required elements
 * @param essay - The essay content to validate
 * @returns true if essay has required elements, false otherwise
 */
export function validateEssayElements(essay: EssayContent): boolean {
  // Essay must have raw text
  if (!essay.rawText || essay.rawText.trim().length === 0) {
    return false;
  }

  // Essay must have at least some tokens
  if (!essay.tokens || essay.tokens.length === 0) {
    return false;
  }

  return true;
}

/**
 * Uploads a model diagram and stores it for later retrieval
 * @param diagramData - Raw diagram data (JSON string or object)
 * @returns Model ID for the uploaded diagram
 * @throws Error if diagram is invalid or missing required elements
 */
export function uploadModelDiagram(diagramData: string | object): string {
  // Parse the diagram
  let diagram: DiagramStructure;
  try {
    diagram = parseDiagram(diagramData);
  } catch (error) {
    throw new Error(`Failed to parse diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Validate diagram contains required elements
  if (!validateDiagramElements(diagram)) {
    throw new Error('Model diagram must contain at least one node with id and label');
  }

  // Generate unique ID and store
  const modelId = generateModelId();
  const storedModel: StoredModelAnswer = {
    id: modelId,
    content: diagram,
    type: 'diagram',
    uploadedAt: new Date().toISOString()
  };

  modelAnswerStore.set(modelId, storedModel);

  return modelId;
}

/**
 * Uploads a model essay and stores it for later retrieval
 * @param essayText - Raw essay text
 * @returns Model ID for the uploaded essay
 * @throws Error if essay is invalid or missing required elements
 */
export function uploadModelEssay(essayText: string): string {
  // Parse the essay
  let essay: EssayContent;
  try {
    essay = parseEssay(essayText);
  } catch (error) {
    throw new Error(`Failed to parse essay: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Validate essay contains required elements
  if (!validateEssayElements(essay)) {
    throw new Error('Model essay must contain text content with at least one word');
  }

  // Generate unique ID and store
  const modelId = generateModelId();
  const storedModel: StoredModelAnswer = {
    id: modelId,
    content: essay,
    type: 'essay',
    uploadedAt: new Date().toISOString()
  };

  modelAnswerStore.set(modelId, storedModel);

  return modelId;
}

/**
 * Retrieves a stored model diagram by ID
 * @param modelId - The ID of the model diagram to retrieve
 * @returns The stored diagram structure
 * @throws Error if model not found or is not a diagram
 */
export function getModelDiagram(modelId: string): DiagramStructure {
  const storedModel = modelAnswerStore.get(modelId);

  if (!storedModel) {
    throw new Error(`Model answer not found: ${modelId}`);
  }

  if (storedModel.type !== 'diagram') {
    throw new Error(`Model ${modelId} is not a diagram`);
  }

  return storedModel.content as DiagramStructure;
}

/**
 * Retrieves a stored model essay by ID
 * @param modelId - The ID of the model essay to retrieve
 * @returns The stored essay content
 * @throws Error if model not found or is not an essay
 */
export function getModelEssay(modelId: string): EssayContent {
  const storedModel = modelAnswerStore.get(modelId);

  if (!storedModel) {
    throw new Error(`Model answer not found: ${modelId}`);
  }

  if (storedModel.type !== 'essay') {
    throw new Error(`Model ${modelId} is not an essay`);
  }

  return storedModel.content as EssayContent;
}

/**
 * Updates an existing model diagram
 * @param modelId - The ID of the model to update
 * @param diagramData - New diagram data
 * @throws Error if model not found, is not a diagram, or new data is invalid
 */
export function updateModelDiagram(modelId: string, diagramData: string | object): void {
  const storedModel = modelAnswerStore.get(modelId);

  if (!storedModel) {
    throw new Error(`Model answer not found: ${modelId}`);
  }

  if (storedModel.type !== 'diagram') {
    throw new Error(`Model ${modelId} is not a diagram`);
  }

  // Parse and validate new diagram
  let diagram: DiagramStructure;
  try {
    diagram = parseDiagram(diagramData);
  } catch (error) {
    throw new Error(`Failed to parse diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  if (!validateDiagramElements(diagram)) {
    throw new Error('Model diagram must contain at least one node with id and label');
  }

  // Update the stored model
  storedModel.content = diagram;
  storedModel.uploadedAt = new Date().toISOString();
}

/**
 * Updates an existing model essay
 * @param modelId - The ID of the model to update
 * @param essayText - New essay text
 * @throws Error if model not found, is not an essay, or new text is invalid
 */
export function updateModelEssay(modelId: string, essayText: string): void {
  const storedModel = modelAnswerStore.get(modelId);

  if (!storedModel) {
    throw new Error(`Model answer not found: ${modelId}`);
  }

  if (storedModel.type !== 'essay') {
    throw new Error(`Model ${modelId} is not an essay`);
  }

  // Parse and validate new essay
  let essay: EssayContent;
  try {
    essay = parseEssay(essayText);
  } catch (error) {
    throw new Error(`Failed to parse essay: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  if (!validateEssayElements(essay)) {
    throw new Error('Model essay must contain text content with at least one word');
  }

  // Update the stored model
  storedModel.content = essay;
  storedModel.uploadedAt = new Date().toISOString();
}

/**
 * Deletes a model answer by ID
 * @param modelId - The ID of the model to delete
 * @returns true if deleted, false if not found
 */
export function deleteModelAnswer(modelId: string): boolean {
  return modelAnswerStore.delete(modelId);
}

/**
 * Checks if a model answer exists
 * @param modelId - The ID to check
 * @returns true if model exists, false otherwise
 */
export function modelAnswerExists(modelId: string): boolean {
  return modelAnswerStore.has(modelId);
}

/**
 * Clears all stored model answers (useful for testing)
 */
export function clearAllModelAnswers(): void {
  modelAnswerStore.clear();
}

/**
 * Gets all stored model IDs
 * @returns Array of all model IDs
 */
export function getAllModelIds(): string[] {
  return Array.from(modelAnswerStore.keys());
}
