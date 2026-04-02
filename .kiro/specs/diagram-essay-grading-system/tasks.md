# Implementation Plan: Diagram-Based Essay Grading System

## Overview

This implementation plan breaks down the hybrid grading system into discrete coding tasks. The system will be built incrementally, starting with core data structures and parsers, then implementing evaluators, and finally integrating all components with reporting. Property-based tests will be written alongside implementation to validate correctness properties.

## Tasks

- [x] 1. Set up project structure and core interfaces
  - Create project directory structure with src/, tests/, and models/ folders
  - Define TypeScript interfaces for DiagramStructure, EssayContent, and EvaluationResult
  - Set up testing framework (Jest for unit tests, fast-check for property-based tests)
  - Create utility functions for score validation and normalization
  - _Requirements: 1.1, 2.1, 3.1_

- [-] 2. Implement Diagram Parser
  - [x] 2.1 Create diagram parsing logic
    - Implement parseDiagram() function to extract nodes and connections
    - Support common diagram formats (JSON representation)
    - Validate diagram structure and extract node labels
    - _Requirements: 1.1, 1.2, 1.5_

  - [x] 2.2 Write property test for diagram node extraction
    - **Property 1: Diagram Node Extraction Completeness**
    - **Validates: Requirements 1.1, 1.5**

  - [x] 2.3 Write property test for diagram connection extraction
    - **Property 2: Diagram Connection Extraction Completeness**
    - **Validates: Requirements 1.2**

- [x] 3. Implement Essay Parser
  - [x] 3.1 Create essay parsing logic
    - Implement parseEssay() function to extract text content
    - Tokenize essay text into words and sentences
    - Extract and normalize keywords
    - _Requirements: 2.1, 2.2_

  - [x] 3.2 Write property test for essay keyword extraction
    - **Property 6: Essay Keyword Extraction**
    - **Validates: Requirements 2.1, 2.2**

- [x] 4. Implement Diagram Evaluator
  - [x] 4.1 Create diagram evaluation logic
    - Implement evaluateDiagram() function
    - Compare node counts between student and model diagrams
    - Compare connection counts between student and model diagrams
    - Validate node labels against model
    - Calculate diagram score (0-100) using: 30% node count + 30% connection count + 40% label accuracy
    - _Requirements: 1.3, 1.4, 1.6_

  - [x] 4.2 Write property test for node count comparison
    - **Property 3: Node Count Comparison Accuracy**
    - **Validates: Requirements 1.3**

  - [x] 4.3 Write property test for connection count comparison
    - **Property 4: Connection Count Comparison Accuracy**
    - **Validates: Requirements 1.4**

  - [x] 4.4 Write property test for diagram score range
    - **Property 5: Diagram Score Range Validity**
    - **Validates: Requirements 1.6**

- [x] 5. Implement Essay Evaluator
  - [x] 5.1 Create essay evaluation logic
    - Implement evaluateEssay() function
    - Extract keywords from student essay
    - Compare against model essay keywords
    - Calculate keyword coverage percentage
    - Analyze term frequency
    - Validate content length
    - Calculate essay score (0-100) using: 50% keyword coverage + 30% term frequency + 20% content length
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 5.2 Write property test for essay score range
    - **Property 7: Essay Score Range Validity**
    - **Validates: Requirements 2.5**

- [x] 6. Implement Hybrid Score Calculator
  - [x] 6.1 Create hybrid score calculation logic
    - Implement calculateHybridScore() function
    - Apply weights: 25% diagram score + 75% essay score
    - Ensure result is between 0-100
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 6.2 Write property test for hybrid score calculation
    - **Property 8: Hybrid Score Calculation Correctness**
    - **Validates: Requirements 3.1, 3.2**

  - [x] 6.3 Write property test for hybrid score range
    - **Property 9: Hybrid Score Range Validity**
    - **Validates: Requirements 3.3**

- [x] 7. Implement Report Generator
  - [x] 7.1 Create report generation logic
    - Implement generateReport() function
    - Format evaluation results with all scores and breakdowns
    - Include diagram evaluation details
    - Include essay evaluation details
    - Support JSON output format
    - _Requirements: 3.4, 5.1, 5.2, 5.3, 5.4_

  - [x] 7.2 Write property test for report completeness
    - **Property 10: Report Completeness**
    - **Validates: Requirements 3.4, 5.1, 5.2, 5.3, 5.4**

- [x] 8. Implement Model Answer Manager
  - [x] 8.1 Create model answer storage and retrieval
    - Implement uploadModelDiagram() function
    - Implement uploadModelEssay() function
    - Implement getModelDiagram() function
    - Implement getModelEssay() function
    - Store models in memory or file system
    - Validate model answers contain required elements
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 8.2 Write property test for model answer storage
    - **Property 13: Model Answer Storage and Retrieval**
    - **Validates: Requirements 6.1, 6.2**

  - [x] 8.3 Write property test for model answer updates
    - **Property 14: Model Answer Update Effectiveness**
    - **Validates: Requirements 6.4**

- [x] 9. Implement Submission Handler
  - [x] 9.1 Create submission validation and processing
    - Implement submitAssignment() function
    - Validate both diagram and essay files are present
    - Parse files using diagram and essay parsers
    - Handle missing or invalid files with descriptive errors
    - Generate submission ID
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 9.2 Write property test for submission validation
    - **Property 11: Submission Validation**
    - **Validates: Requirements 4.3, 4.4**

- [x] 10. Implement End-to-End Processing Pipeline
  - [x] 10.1 Wire all components together
    - Create main grading pipeline function
    - Orchestrate submission handling, parsing, evaluation, and reporting
    - Implement error handling throughout pipeline
    - Ensure all components work together seamlessly
    - _Requirements: 4.5, 3.1, 3.2_

  - [x] 10.2 Write property test for valid submission processing
    - **Property 12: Valid Submission Processing**
    - **Validates: Requirements 4.5**

- [x] 11. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all property-based tests with minimum 100 iterations each
  - Verify no errors in test output
  - Ask the user if questions arise

- [x] 12. Create API/Interface Layer
  - [x] 12.1 Create REST API endpoints (if needed)
    - POST /submit - Submit assignment
    - POST /model/diagram - Upload model diagram
    - POST /model/essay - Upload model essay
    - GET /result/:submissionId - Get grading result
    - _Requirements: 4.1, 4.2, 5.1_

  - [x] 12.2 Write integration tests for API endpoints
    - Test submission endpoint with valid and invalid inputs
    - Test model upload endpoints
    - Test result retrieval
    - _Requirements: 4.1, 4.2, 4.5_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Run complete test suite
  - Verify all properties hold across all inputs
  - Verify all edge cases are handled
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check library for randomized input generation
- Checkpoints ensure incremental validation of functionality
- All scores must be validated to be within 0-100 range
- Default weights for hybrid score: 25% diagram, 75% essay

