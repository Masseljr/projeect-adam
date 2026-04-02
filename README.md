# 📚 AcademicGrade - Diagram-Based Essay Grading System

An intelligent hybrid grading system that evaluates student submissions based on both diagram structure and essay content using property-based testing for correctness validation.

## Features

✨ **Hybrid Grading System**
- Evaluates diagrams (30% node count, 30% connections, 40% label accuracy)
- Evaluates essays (50% keyword coverage, 30% term frequency, 20% content length)
- Combines scores with configurable weights (25% diagram, 75% essay)

🎯 **Multiple Input Methods**
- File upload (images, PDFs, documents)
- Drag & drop support
- Camera/snapshot capture
- Multiple file uploads

🔐 **Role-Based Access**
- Instructor dashboard for model answer configuration
- Student dashboard for assignment submission
- Shareable links for easy student access

🤖 **Image Analysis (Fallback Strategy)**
- Tesseract OCR (free, local, unlimited)
- Google ML Kit Firebase (free, 1000/month)
- Google Cloud Vision API (free, 1000/month, then paid)

📊 **Comprehensive Reporting**
- Detailed score breakdowns
- Component-wise analysis
- Submission tracking

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express, TypeScript
- **Testing**: Jest, fast-check (property-based testing)
- **File Handling**: Multer
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/diagram-essay-grading-system.git
cd diagram-essay-grading-system

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the server
npm run server
```

The application will be available at `http://localhost:3000`

### Demo Credentials

**Instructor:**
- Username: `admin`
- Password: `password123`

**Student:**
- Username: `student`
- Password: `password123`

## Usage

### For Instructors

1. Login as instructor (admin/password123)
2. Upload model diagrams and essays
3. Copy the generated share link
4. Share with students

### For Students

1. Click the shared link or login as student
2. Upload your diagrams and essay
3. Submit for grading
4. View detailed results

## API Endpoints

### Model Management
- `POST /api/model/diagram` - Upload model diagram
- `POST /api/model/essay` - Upload model essay
- `GET /api/model/diagram/:modelId` - Get model diagram
- `GET /api/model/essay/:modelId` - Get model essay

### Submission & Grading
- `POST /api/submit` - Submit assignment for grading
- `GET /api/result/:submissionId` - Get grading result

### Health Check
- `GET /api/health` - Check API status

## Grading Algorithm

### Diagram Score (0-100)
```
Diagram Score = (Node Match × 30%) + (Connection Match × 30%) + (Label Accuracy × 40%)
```

### Essay Score (0-100)
```
Essay Score = (Keyword Coverage × 50%) + (Term Frequency × 30%) + (Content Length × 20%)
```

### Hybrid Score (0-100)
```
Hybrid Score = (Diagram Score × 25%) + (Essay Score × 75%)
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

## Property-Based Testing

The system uses fast-check for property-based testing to validate:
- Diagram node extraction completeness
- Diagram connection extraction completeness
- Node count comparison accuracy
- Connection count comparison accuracy
- Diagram score range validity
- Essay keyword extraction
- Essay score range validity
- Hybrid score calculation correctness
- Hybrid score range validity
- Report completeness
- Submission validation
- Valid submission processing
- Model answer storage and retrieval
- Model answer update effectiveness

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Environment Variables

Create a `.env.local` file for local development:

```
REACT_APP_API_URL=http://localhost:3000/api
```

For production (Vercel):
```
REACT_APP_API_URL=https://your-vercel-domain.vercel.app/api
```

## Project Structure

```
├── src/
│   ├── api/              # REST API handlers
│   ├── evaluators/       # Diagram and essay evaluators
│   ├── models/           # TypeScript interfaces
│   ├── parsers/          # Diagram and essay parsers
│   ├── utils/            # Utility functions
│   ├── index.ts          # Entry point
│   └── server.ts         # Express server
├── public/               # Frontend files
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── dist/                 # Compiled JavaScript
├── uploads/              # Uploaded files
├── jest.config.js        # Jest configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Property-based testing with fast-check
- Express.js for the REST API
- Multer for file uploads
- Google ML Kit and Vision APIs for image analysis
