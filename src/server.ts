import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { gradeSubmission } from './utils/gradingPipeline';
import { uploadModelDiagram, uploadModelEssay, getModelDiagram, getModelEssay } from './utils/modelAnswerManager';
import { processUploadedDiagramImage } from './utils/imageAnalyzer';

const app = express();
const PORT = 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Grading system is running' });
});

// Upload model diagram (image file)
app.post('/api/model/diagram', upload.single('diagram'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Diagram file is required' });
    }

    // For image files, create a simple diagram structure with file reference
    // This allows instructors to upload images without needing JSON
    const diagramData = {
      nodes: [
        {
          id: 'diagram_image',
          label: req.file.originalname.replace(/\.[^/.]+$/, ''), // Remove file extension
          type: 'image'
        }
      ],
      connections: [],
      metadata: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
        uploadedAt: new Date().toISOString()
      }
    };

    const modelId = uploadModelDiagram(diagramData);
    res.json({ 
      success: true, 
      modelId,
      fileUrl: `/uploads/${req.file.filename}`
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Upload model essay
app.post('/api/model/essay', (req: Request, res: Response) => {
  try {
    const { essay } = req.body;
    if (!essay) {
      return res.status(400).json({ error: 'Essay is required' });
    }
    const modelId = uploadModelEssay(essay);
    res.json({ success: true, modelId });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get model diagram
app.get('/api/model/diagram/:modelId', (req: Request, res: Response) => {
  try {
    const modelId = Array.isArray(req.params.modelId) ? req.params.modelId[0] : req.params.modelId;
    const diagram = getModelDiagram(modelId);
    res.json({ success: true, diagram });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Get model essay
app.get('/api/model/essay/:modelId', (req: Request, res: Response) => {
  try {
    const modelId = Array.isArray(req.params.modelId) ? req.params.modelId[0] : req.params.modelId;
    const essay = getModelEssay(modelId);
    res.json({ success: true, essay });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Submit assignment for grading (with optional image file)
app.post('/api/submit', upload.single('diagram'), async (req: Request, res: Response) => {
  try {
    const { essayFile, modelDiagramId, modelEssayId } = req.body;

    if (!essayFile || !modelDiagramId || !modelEssayId) {
      return res.status(400).json({
        error: 'Missing required fields: essay, modelDiagramId, modelEssayId'
      });
    }

    // Diagram file is optional - if not provided, it's an essay-only submission
    let diagramFile: any = null;
    
    if (req.file) {
      // Check if it's an image file that needs analysis
      const isImageFile = req.file.mimetype.startsWith('image/');
      
      if (isImageFile) {
        // Try to analyze the image using fallback strategy
        console.log(`Analyzing uploaded diagram image: ${req.file.filename}`);
        const filePath = req.file.path;
        
        try {
          const analyzedDiagram = await processUploadedDiagramImage(filePath);
          
          if (analyzedDiagram) {
            console.log('✅ Image analysis successful');
            diagramFile = analyzedDiagram;
          } else {
            console.log('⚠️ Image analysis failed, using file metadata');
            // Fallback: use file metadata
            diagramFile = {
              filename: req.file.filename,
              originalName: req.file.originalname,
              mimetype: req.file.mimetype,
              size: req.file.size,
              path: `/uploads/${req.file.filename}`,
              uploadedAt: new Date().toISOString(),
              analysisStatus: 'failed'
            };
          }
        } catch (analysisError) {
          console.error('Error during image analysis:', analysisError);
          // Fallback: use file metadata
          diagramFile = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: `/uploads/${req.file.filename}`,
            uploadedAt: new Date().toISOString(),
            analysisStatus: 'error'
          };
        }
      } else {
        // PDF or other file type - use file metadata
        diagramFile = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: `/uploads/${req.file.filename}`,
          uploadedAt: new Date().toISOString()
        };
      }
    }

    const result = gradeSubmission({
      diagramFile,
      essayFile,
      modelDiagramId,
      modelEssayId
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const response: any = {
      success: true,
      submissionId: result.submissionId,
      report: result.report
    };

    if (req.file) {
      response.diagramUrl = `/uploads/${req.file.filename}`;
    }

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🎓 Grading System API running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
