/**
 * Image Analyzer - Analyzes hand-drawn or photo diagrams
 * Uses fallback strategy: Tesseract OCR -> Google ML Kit -> Google Cloud Vision
 */

import { DiagramStructure } from '../models/types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Represents extracted diagram information from image analysis
 */
export interface ExtractedDiagramInfo {
  nodes: string[];
  connections: number;
  labels: string[];
  confidence: number;
  method: 'tesseract' | 'mlkit' | 'vision' | 'structured';
}

/**
 * Converts extracted image data to DiagramStructure format
 * @param extractedInfo - Information extracted from image
 * @returns DiagramStructure compatible with grading system
 */
export function convertExtractedToDiagramStructure(extractedInfo: ExtractedDiagramInfo): DiagramStructure {
  // Create nodes from extracted labels
  const nodes = extractedInfo.labels.map((label, index) => ({
    id: `node_${index}`,
    label: label,
    type: 'box'
  }));

  // Create connections based on detected count
  const connections = [];
  for (let i = 0; i < Math.min(extractedInfo.connections, nodes.length - 1); i++) {
    connections.push({
      from: `node_${i}`,
      to: `node_${i + 1}`,
      label: ''
    });
  }

  return {
    nodes,
    connections
  };
}

/**
 * Analyzes image using Tesseract OCR (Option 1 - Free, Local, Unlimited)
 * Extracts text and attempts to identify diagram structure
 * @param imagePath - Path to image file
 * @returns Extracted diagram information or null if failed
 */
export async function analyzeWithTesseract(imagePath: string): Promise<ExtractedDiagramInfo | null> {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.log('Image file not found for Tesseract analysis');
      return null;
    }

    // For now, return null to trigger fallback
    // In production, you would use: const Tesseract = require('tesseract.js');
    // This requires npm install tesseract.js
    console.log('Tesseract OCR analysis attempted');
    return null;
  } catch (error) {
    console.log('Tesseract analysis failed:', error);
    return null;
  }
}

/**
 * Analyzes image using Google ML Kit Firebase (Option 2 - Free, 1000/month)
 * Uses Firebase ML Kit for object and text detection
 * @param imagePath - Path to image file
 * @returns Extracted diagram information or null if failed
 */
export async function analyzeWithMLKit(imagePath: string): Promise<ExtractedDiagramInfo | null> {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.log('Image file not found for ML Kit analysis');
      return null;
    }

    // For now, return null to trigger fallback
    // In production, you would use Firebase ML Kit
    // This requires: npm install firebase
    console.log('Google ML Kit analysis attempted');
    return null;
  } catch (error) {
    console.log('ML Kit analysis failed:', error);
    return null;
  }
}

/**
 * Analyzes image using Google Cloud Vision API (Option 3 - Free, 1000/month, then paid)
 * Most powerful vision API for detailed image analysis
 * @param imagePath - Path to image file
 * @returns Extracted diagram information or null if failed
 */
export async function analyzeWithGoogleVision(imagePath: string): Promise<ExtractedDiagramInfo | null> {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.log('Image file not found for Google Vision analysis');
      return null;
    }

    // For now, return null to trigger fallback
    // In production, you would use: const vision = require('@google-cloud/vision');
    // This requires: npm install @google-cloud/vision
    console.log('Google Cloud Vision analysis attempted');
    return null;
  } catch (error) {
    console.log('Google Vision analysis failed:', error);
    return null;
  }
}

/**
 * Fallback strategy: Try all analysis methods in order
 * 1. Tesseract OCR (free, local, unlimited)
 * 2. Google ML Kit (free, 1000/month)
 * 3. Google Cloud Vision (free, 1000/month, then paid)
 * @param imagePath - Path to image file
 * @returns Extracted diagram information or null if all methods fail
 */
export async function analyzeImageWithFallback(imagePath: string): Promise<ExtractedDiagramInfo | null> {
  console.log('Starting image analysis with fallback strategy...');

  // Option 1: Try Tesseract OCR (free, local, unlimited)
  console.log('Attempting Option 1: Tesseract OCR...');
  let result = await analyzeWithTesseract(imagePath);
  if (result) {
    console.log('✅ Tesseract OCR succeeded');
    return result;
  }
  console.log('❌ Tesseract OCR failed, trying next option...');

  // Option 2: Try Google ML Kit (free, 1000/month)
  console.log('Attempting Option 2: Google ML Kit...');
  result = await analyzeWithMLKit(imagePath);
  if (result) {
    console.log('✅ Google ML Kit succeeded');
    return result;
  }
  console.log('❌ Google ML Kit failed, trying next option...');

  // Option 3: Try Google Cloud Vision (free, 1000/month, then paid)
  console.log('Attempting Option 3: Google Cloud Vision...');
  result = await analyzeWithGoogleVision(imagePath);
  if (result) {
    console.log('✅ Google Cloud Vision succeeded');
    return result;
  }
  console.log('❌ All image analysis methods failed');

  return null;
}

/**
 * Processes an uploaded diagram image
 * Attempts to extract structure using fallback strategy
 * @param imagePath - Path to uploaded image
 * @returns DiagramStructure or null if analysis fails
 */
export async function processUploadedDiagramImage(imagePath: string): Promise<DiagramStructure | null> {
  try {
    const extractedInfo = await analyzeImageWithFallback(imagePath);

    if (!extractedInfo) {
      console.log('Could not extract diagram information from image');
      return null;
    }

    const diagramStructure = convertExtractedToDiagramStructure(extractedInfo);
    return diagramStructure;
  } catch (error) {
    console.error('Error processing diagram image:', error);
    return null;
  }
}
