# Design Document: Diagram-Based Essay Grading System

## Overview

The Diagram-Based Essay Grading System is a hybrid evaluation platform that combines rule-based diagram structure validation with AI/NLP-based essay content analysis. The system processes student submissions containing both visual diagrams and textual essays, evaluates each component independently, and produces a combined hybrid score that reflects overall performance.

The architecture is modular, allowing independent development and testing of diagram evaluation, essay evaluation, and score combination components.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Submission Handler                        │
│  (Receives and validates diagram + essay files)              │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│ Diagram Parser   │  │ Essay Parser     │
│ (Extract nodes,  │  │ (Extract text)   │
│  connections)    │  │                  │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ Diagram          │  │ Essay            │
│ Evaluator        │  │ Evaluator        │
│ (Rule-based)     │  │ (NLP-based)      │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
    Diagram Score         Essay Score
         │                     │
         └────────────┬────────┘
                      ▼
         ┌──────────────────────┐
         │ Hybrid Score         │
         │ Calculator           │
         │ (Combine scores)     │
         └────────────┬─────────┘
                      ▼
         ┌──────────────────────┐
         │ Report Generator     │
         │ (Format results)     │
         └──────────────────────┘
```

## Components and Interfaces

### 1. Submission Handler

**Responsibility**: Receive and validate student submissions

**Interface**:
```
submitAssignment(diagramFile, essayFile) -> SubmissionResult
  - Validates both files are present
  - Parses diagram and essay
  - Returns submission ID or error
```

**Key Methods**:
- `validateSubmission()`: Checks file presence and format
- `parseFiles()`: Extracts diagram and essay content
- `handleError()`: Returns descriptive error messages

### 2. Diagram Parser

**Responsibility**: Extract structural information from diagrams

**Interface**:
```
parseDiagram(diagramFile) -> DiagramStructure
  - Extracts all nodes with labels
  - Extracts all connections between nodes
  - Returns structured representation
```

**Data Structure**:
```
DiagramStructure {
  nodes: [
    { id: string, label: string, type: string }
  ],
  connections: [
    { from: string, to: string, label?: string }
  ]
}
```

### 3. Essay Parser

**Responsibility**: Extract text content from essay files

**Interface**:
```
parseEssay(essayFile) -> EssayContent
  - Extracts raw text
  - Tokenizes content
  - Returns structured text representation
```

**Data Structure**:
```
EssayContent {
  rawText: string,
  tokens: string[],
  sentences: string[]
}
```

### 4. Diagram Evaluator

**Responsibility**: Evaluate diagram structure against model answer using rule-based approach

**Interface**:
```
evaluateDiagram(studentDiagram, modelDiagram) -> DiagramScore
  - Compares node count
  - Compares connection count
  - Validates node labels
  - Produces score 0-100
```

**Scoring Logic**:
- Node count match: 30% of diagram score
- Connection count match: 30% of diagram score
- Label accuracy: 40% of diagram score

### 5. Essay Evaluator

**Responsibility**: Evaluate essay content using NLP-based approach

**Interface**:
```
evaluateEssay(studentEssay, modelEssay) -> EssayScore
  - Extracts key terms from student essay
  - Compares against model keywords
  - Evaluates keyword coverage
  - Produces score 0-100
```

**Scoring Logic**:
- Keyword coverage: 50% of essay score
- Term frequency analysis: 30% of essay score
- Content length validation: 20% of essay score

### 6. Hybrid Score Calculator

**Responsibility**: Combine diagram and essay scores into final hybrid score

**Interface**:
```
calculateHybridScore(diagramScore, essayScore, weights) -> HybridScore
  - Applies weights to both scores
  - Combines into final score
  - Returns score 0-100
```

**Default Weights**:
- Diagram Score: 25%
- Essay Score: 75%

### 7. Report Generator

**Responsibility**: Format evaluation results into readable report

**Interface**:
```
generateReport(evaluationResults) -> Report
  - Formats scores and breakdown
  - Includes evaluation details
  - Outputs JSON or PDF format
```

**Report Structure**:
```
Report {
  submissionId: string,
  diagramScore: number,
  essayScore: number,
  hybridScore: number,
  diagramDetails: object,
  essayDetails: object,
  timestamp: string
}
```

### 8. Model Answer Manager

**Responsibility**: Store and manage reference model answers

**Interface**:
```
uploadModelDiagram(diagram) -> ModelId
uploadModelEssay(essay) -> ModelId
getModelDiagram(modelId) -> DiagramStructure
getModelEssay(modelId) -> EssayContent
```

## Data Models

### Submission
```
{
  id: string (UUID),
  studentId: string,
  diagramFile: File,
  essayFile: File,
  modelDiagramId: string,
  modelEssayId: string,
  timestamp: ISO8601,
  status: "pending" | "processing" | "completed" | "error"
}
```

### Evaluation Result
```
{
  submissionId: string,
  diagramScore: number (0-100),
  essayScore: number (0-100),
  hybridScore: number (0-100),
  diagramBreakdown: {
    nodeCountMatch: number,
    connectionCountMatch: number,
    labelAccuracy: number
  },
  essayBreakdown: {
    keywordCoverage: number,
    termFrequency: number,
    contentLength: number
  },
  timestamp: ISO8601
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Diagram Node Extraction Completeness
*For any* valid diagram with N nodes, the diagram parser should extract exactly N nodes with their labels intact.
**Validates: Requirements 1.1, 1.5**

### Property 2: Diagram Connection Extraction Completeness
*For any* valid diagram with C connections, the diagram parser should extract exactly C connections between nodes.
**Validates: Requirements 1.2**

### Property 3: Node Count Comparison Accuracy
*For any* student diagram and model diagram, the comparison should correctly identify whether node counts match.
**Validates: Requirements 1.3**

### Property 4: Connection Count Comparison Accuracy
*For any* student diagram and model diagram, the comparison should correctly identify whether connection counts match.
**Validates: Requirements 1.4**

### Property 5: Diagram Score Range Validity
*For any* diagram evaluation, the resulting diagram score should always be between 0 and 100 inclusive.
**Validates: Requirements 1.6**

### Property 6: Essay Keyword Extraction
*For any* essay containing known keywords, the essay evaluator should extract all expected keywords from the text.
**Validates: Requirements 2.1, 2.2**

### Property 7: Essay Score Range Validity
*For any* essay evaluation, the resulting essay score should always be between 0 and 100 inclusive.
**Validates: Requirements 2.5**

### Property 8: Hybrid Score Calculation Correctness
*For any* diagram score D and essay score E with weights w_d and w_e, the hybrid score should equal (D * w_d) + (E * w_e).
**Validates: Requirements 3.1, 3.2**

### Property 9: Hybrid Score Range Validity
*For any* hybrid score calculation, the resulting score should always be between 0 and 100 inclusive.
**Validates: Requirements 3.3**

### Property 10: Report Completeness
*For any* completed evaluation, the generated report should contain diagram score, essay score, and hybrid score.
**Validates: Requirements 3.4, 5.1, 5.2, 5.3, 5.4**

### Property 11: Submission Validation
*For any* submission, if either diagram or essay file is missing, the system should reject the submission with an error message.
**Validates: Requirements 4.3, 4.4**

### Property 12: Valid Submission Processing
*For any* valid submission with both diagram and essay files, the system should successfully process it and generate a report.
**Validates: Requirements 4.5**

### Property 13: Model Answer Storage and Retrieval
*For any* uploaded model diagram or essay, the system should store it and retrieve the exact same content when requested.
**Validates: Requirements 6.1, 6.2**

### Property 14: Model Answer Update Effectiveness
*For any* updated model answer, subsequent grading operations should use the new model instead of the old one.
**Validates: Requirements 6.4**

## Error Handling

The system handles the following error scenarios:

1. **Missing Files**: Returns error if diagram or essay file is missing
2. **Invalid File Format**: Returns error if files cannot be parsed
3. **Empty Content**: Returns error if parsed content is empty
4. **Model Answer Not Found**: Returns error if referenced model answer doesn't exist
5. **Parsing Failures**: Returns descriptive error messages for parsing issues
6. **Score Calculation Errors**: Validates all scores are within 0-100 range

## Testing Strategy

### Unit Testing

Unit tests verify specific examples and edge cases:

- **Diagram Parser Tests**: Test parsing of various diagram formats and structures
- **Essay Parser Tests**: Test parsing of various essay formats and content
- **Diagram Evaluator Tests**: Test scoring logic with known inputs
- **Essay Evaluator Tests**: Test keyword extraction and scoring
- **Score Calculator Tests**: Test hybrid score calculation with various weights
- **Report Generator Tests**: Test report formatting and content
- **Error Handling Tests**: Test error scenarios and messages

### Property-Based Testing

Property-based tests verify universal properties across all inputs:

- **Property 1**: Diagram node extraction (all diagrams)
- **Property 2**: Diagram connection extraction (all diagrams)
- **Property 3**: Node count comparison (all diagram pairs)
- **Property 4**: Connection count comparison (all diagram pairs)
- **Property 5**: Diagram score range (all evaluations)
- **Property 6**: Essay keyword extraction (all essays)
- **Property 7**: Essay score range (all evaluations)
- **Property 8**: Hybrid score calculation (all score combinations)
- **Property 9**: Hybrid score range (all calculations)
- **Property 10**: Report completeness (all evaluations)
- **Property 11**: Submission validation (all submissions)
- **Property 12**: Valid submission processing (all valid submissions)
- **Property 13**: Model answer storage (all uploads)
- **Property 14**: Model answer updates (all updates)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with property number and requirements reference
- Tests use randomized input generation to explore input space

