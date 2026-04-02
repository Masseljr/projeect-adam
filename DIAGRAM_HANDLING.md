# How the System Handles Different Diagram Types

## Overview

The AcademicGrade system evaluates diagrams based on **structural properties**, not visual appearance. This means it works with ANY diagram type as long as it can be analyzed for:
- Number of elements (nodes)
- Number of relationships (connections)
- Element labels/text

## Supported Diagram Types

### 1. **Flowcharts**
- **Elements**: Process boxes, decision diamonds, start/end ovals
- **Connections**: Arrows showing flow direction
- **Evaluation**: Checks if student has same number of steps and decision points
- **Example**: Algorithm flowchart, process flow diagram

### 2. **Mind Maps**
- **Elements**: Central idea + branches with sub-topics
- **Connections**: Lines connecting ideas
- **Evaluation**: Verifies main branches and sub-branches match model
- **Example**: Study notes, brainstorming diagram

### 3. **Concept Maps**
- **Elements**: Concepts in boxes/circles
- **Connections**: Labeled arrows showing relationships
- **Evaluation**: Checks concept count and relationship accuracy
- **Example**: Biology concepts, historical events

### 4. **UML Diagrams**
- **Elements**: Classes, interfaces, entities
- **Connections**: Inheritance, association, composition arrows
- **Evaluation**: Verifies class structure and relationships
- **Example**: System design, database schema

### 5. **Entity-Relationship Diagrams (ERD)**
- **Elements**: Entities (tables)
- **Connections**: Relationships with cardinality
- **Evaluation**: Checks entity count and relationship types
- **Example**: Database design

### 6. **Network Diagrams**
- **Elements**: Nodes (computers, servers, devices)
- **Connections**: Network links
- **Evaluation**: Verifies network topology
- **Example**: Network architecture

### 7. **Organizational Charts**
- **Elements**: Positions/roles
- **Connections**: Reporting relationships
- **Evaluation**: Checks hierarchy structure
- **Example**: Company structure

## Input Methods

### 1. **File Upload** ✅
- Click "Choose File" button
- Select PNG, JPG, GIF, WebP, or PDF
- Supports files up to 10MB

### 2. **Drag & Drop** ✅ NEW
- Drag diagram file directly onto upload area
- Visual feedback shows when ready to drop
- Works with all supported formats

### 3. **Camera/Snapshot** ✅ NEW
- Click "Take Photo" button
- Use device camera to capture diagram
- Perfect for:
  - Hand-drawn diagrams on paper
  - Whiteboard diagrams
  - Diagrams from textbooks
  - Quick snapshots

### 4. **Paste from Clipboard** (Coming Soon)
- Paste screenshots directly
- Ctrl+V / Cmd+V support

## How Evaluation Works

### Step 1: Image Upload
Student uploads diagram (file, drag-drop, or camera)

### Step 2: Structural Analysis
System analyzes the image to extract:
- Number of distinct elements
- Number of connections between elements
- Text labels on elements

### Step 3: Comparison with Model
System compares student diagram against instructor's model:
- **Node Count Match** (30%): Does student have same number of elements?
- **Connection Count Match** (30%): Are relationships correct?
- **Label Accuracy** (40%): Do labels match expected values?

### Step 4: Scoring
Final diagram score = weighted combination of above metrics

## Example: Flowchart Evaluation

### Model Flowchart (Instructor's Answer)
```
Start → Input Data → Process → Decision → Output → End
         (5 nodes, 5 connections)
```

### Student Submission 1 (Good)
```
Start → Input → Process → Decision → Output → End
(5 nodes, 5 connections, labels match)
Score: 95/100 ✅
```

### Student Submission 2 (Missing Step)
```
Start → Input → Process → Output → End
(4 nodes, 4 connections - missing decision)
Score: 70/100 ⚠️
```

### Student Submission 3 (Wrong Labels)
```
Start → Get Data → Calculate → Check → Print → End
(5 nodes, 5 connections, but labels don't match)
Score: 60/100 ⚠️
```

## Best Practices for Instructors

1. **Create Clear Model Diagrams**
   - Use consistent shapes and colors
   - Label all elements clearly
   - Ensure connections are visible

2. **Provide Examples**
   - Show students what a good diagram looks like
   - Explain what elements are essential
   - Clarify labeling conventions

3. **Set Expectations**
   - Specify diagram type (flowchart, mind map, etc.)
   - Define required elements
   - Explain grading criteria

## Best Practices for Students

1. **Use Diagram Tools**
   - Lucidchart, Draw.io, Visio
   - Microsoft Office (Shapes)
   - Google Drawings
   - Any tool that creates clear diagrams

2. **Hand-Drawn Diagrams**
   - Draw clearly on paper
   - Use the camera feature to capture
   - Ensure good lighting
   - Keep diagram in frame

3. **Label Everything**
   - Clear, readable text
   - Consistent naming with model
   - Proper spelling

4. **Check Your Work**
   - Verify all elements are included
   - Confirm all connections are shown
   - Review labels match requirements

## Technical Details

### Supported File Formats
- **Images**: PNG, JPG, GIF, WebP
- **Documents**: PDF
- **Max Size**: 10MB per file
- **Camera**: JPEG (auto-compressed)

### Browser Requirements
- Modern browser with camera support
- For camera feature: HTTPS or localhost
- JavaScript enabled

### Privacy
- Images are processed on server
- Not stored permanently
- Only used for grading
- Deleted after evaluation

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS or localhost
- Try different browser
- Check device camera access

### Drag & Drop Not Working
- Use supported file format
- Check file size (< 10MB)
- Try file upload instead
- Refresh page

### Low Diagram Score
- Verify all elements are included
- Check labels match model exactly
- Ensure connections are clear
- Try re-uploading with better image

## Future Enhancements

- OCR for automatic text extraction
- AI-powered diagram understanding
- Support for more diagram types
- Automatic diagram generation
- Collaborative diagram editing
