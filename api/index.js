/**
 * Vercel Serverless Function - Express API Handler
 * This file handles all API requests for the grading system
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory storage for models and results
const modelStore = new Map();
const resultStore = new Map();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Grading system is running' });
});

// Upload model diagram
app.post('/api/model/diagram', (req, res) => {
  try {
    const { diagram } = req.body;
    
    if (!diagram) {
      return res.status(400).json({ error: 'Diagram is required' });
    }

    const modelId = `model_diagram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    modelStore.set(modelId, {
      type: 'diagram',
      data: diagram,
      uploadedAt: new Date().toISOString()
    });

    res.json({ success: true, modelId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upload model essay
app.post('/api/model/essay', (req, res) => {
  try {
    const { essay } = req.body;
    
    if (!essay) {
      return res.status(400).json({ error: 'Essay is required' });
    }

    const modelId = `model_essay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    modelStore.set(modelId, {
      type: 'essay',
      data: essay,
      uploadedAt: new Date().toISOString()
    });

    res.json({ success: true, modelId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get model diagram
app.get('/api/model/diagram/:modelId', (req, res) => {
  try {
    const { modelId } = req.params;
    const model = modelStore.get(modelId);

    if (!model || model.type !== 'diagram') {
      return res.status(404).json({ error: `Model diagram not found: ${modelId}` });
    }

    res.json({ success: true, diagram: model.data });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get model essay
app.get('/api/model/essay/:modelId', (req, res) => {
  try {
    const { modelId } = req.params;
    const model = modelStore.get(modelId);

    if (!model || model.type !== 'essay') {
      return res.status(404).json({ error: `Model essay not found: ${modelId}` });
    }

    res.json({ success: true, essay: model.data });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Submit assignment for grading
app.post('/api/submit', (req, res) => {
  try {
    const { essayFile, modelDiagramId, modelEssayId, diagramFile } = req.body;

    if (!essayFile || !modelDiagramId || !modelEssayId) {
      return res.status(400).json({
        error: 'Missing required fields: essayFile, modelDiagramId, modelEssayId'
      });
    }

    // Check if models exist
    const modelDiagram = modelStore.get(modelDiagramId);
    const modelEssay = modelStore.get(modelEssayId);

    if (!modelDiagram) {
      return res.status(404).json({ error: `Model diagram not found: ${modelDiagramId}` });
    }

    if (!modelEssay) {
      return res.status(404).json({ error: `Model essay not found: ${modelEssayId}` });
    }

    // Simple grading logic
    const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate basic scores
    const essayLength = essayFile.split(' ').length;
    const essayScore = Math.min(100, Math.max(0, (essayLength / 100) * 100));
    
    const diagramScore = diagramFile ? 75 : 0;
    const hybridScore = (diagramScore * 0.25) + (essayScore * 0.75);

    const report = {
      submissionId,
      diagramScore,
      essayScore,
      hybridScore: Math.round(hybridScore * 100) / 100,
      diagramDetails: {
        nodeCountMatch: diagramScore,
        connectionCountMatch: diagramScore,
        labelAccuracy: diagramScore
      },
      essayDetails: {
        keywordCoverage: essayScore,
        termFrequency: essayScore,
        contentLength: essayScore
      },
      timestamp: new Date().toISOString()
    };

    resultStore.set(submissionId, report);

    res.json({
      success: true,
      submissionId,
      report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get grading result
app.get('/api/result/:submissionId', (req, res) => {
  try {
    const { submissionId } = req.params;
    const result = resultStore.get(submissionId);

    if (!result) {
      return res.status(404).json({ error: `Result not found: ${submissionId}` });
    }

    res.json({ success: true, report: result });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Export for Vercel
module.exports = app;
