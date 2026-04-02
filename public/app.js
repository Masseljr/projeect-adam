const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : `${window.location.origin}/api`;

const DEMO_USERS = {
  admin: { password: 'password123', role: 'admin' },
  student: { password: 'password123', role: 'student' }
};

let currentUser = null;
let currentRole = null;
let modelDiagramId = null;
let modelEssayId = null;
let studentDiagramFiles = [];
let modelDiagramFiles = [];
let currentCameraTarget = null;

window.addEventListener('load', () => {
  checkAuth();
});

function checkAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  const hasModelParams = urlParams.has('modelDiagram') || urlParams.has('modelEssay');

  // If accessing a share link, auto-login as student
  if (hasModelParams) {
    localStorage.setItem('currentUser', 'student');
    localStorage.setItem('currentRole', 'student');
    currentUser = 'student';
    currentRole = 'student';
    showApp();
    return;
  }

  // Otherwise check normal login
  const user = localStorage.getItem('currentUser');
  const role = localStorage.getItem('currentRole');

  if (user && role) {
    currentUser = user;
    currentRole = role;
    showApp();
  } else {
    showLogin();
  }
}

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('appScreen').style.display = 'none';
}

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'flex';
  document.getElementById('userDisplay').textContent = `👤 ${currentUser} (${currentRole === 'admin' ? '👨‍🏫 Instructor' : '👨‍🎓 Student'})`;

  // Check if this is a student submission link
  const urlParams = new URLSearchParams(window.location.search);
  const hasModelParams = urlParams.has('modelDiagram') || urlParams.has('modelEssay');

  // If accessing a shared link with model params, ALWAYS show student dashboard
  if (hasModelParams) {
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('studentDashboard').style.display = 'block';
    // Pre-fill the model IDs from URL
    modelDiagramId = urlParams.get('modelDiagram');
    modelEssayId = urlParams.get('modelEssay');
  } else if (currentRole === 'admin') {
    // Admin page - only if NOT accessing a student link
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('studentDashboard').style.display = 'none';
  } else {
    // Student page - if student role
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('studentDashboard').style.display = 'block';
  }
}

function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  const statusDiv = document.getElementById('loginStatus');

  if (!username || !password || !role) {
    showStatus(statusDiv, 'Please fill in all fields', 'error');
    return;
  }

  if (DEMO_USERS[username] && DEMO_USERS[username].password === password && DEMO_USERS[username].role === role) {
    localStorage.setItem('currentUser', username);
    localStorage.setItem('currentRole', role);
    currentUser = username;
    currentRole = role;
    showApp();
  } else {
    showStatus(statusDiv, 'Invalid credentials', 'error');
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentRole');
  currentUser = null;
  currentRole = null;
  modelDiagramId = null;
  modelEssayId = null;
  studentDiagramFiles = [];
  modelDiagramFiles = [];
  document.getElementById('loginForm').reset();
  showLogin();
}

// Model diagram upload
document.getElementById('modelDiagramFile')?.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  const statusDiv = document.getElementById('modelDiagramStatus');
  const previewDiv = document.getElementById('modelDiagramPreview');

  if (files.length === 0) return;

  modelDiagramFiles = files;
  displayPreviewGrid(files, previewDiv, 'modelDiagram');
  showStatus(statusDiv, `✅ ${files.length} diagram(s) selected for upload`, 'success');
  
  if (files.length > 0) {
    uploadModelDiagram(files[0], statusDiv);
  }
});

async function uploadModelDiagram(file, statusDiv) {
  try {
    const formData = new FormData();
    formData.append('diagram', file);

    showStatus(statusDiv, 'Uploading diagram...', 'info');

    const response = await fetch(`${API_URL}/model/diagram`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      showStatus(statusDiv, `Error: ${data.error}`, 'error');
      return;
    }

    modelDiagramId = data.modelId;
    showStatus(statusDiv, `✅ ${modelDiagramFiles.length} diagram(s) uploaded successfully!`, 'success');
    checkModelAnswersReady();
  } catch (error) {
    showStatus(statusDiv, `Error: ${error.message}`, 'error');
  }
}

async function uploadModelEssay() {
  let essayText = document.getElementById('modelEssay').value.trim();
  const statusDiv = document.getElementById('modelEssayStatus');
  const fileInput = document.getElementById('modelEssayFile');

  // Check if file was uploaded
  if (fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    showStatus(statusDiv, 'Reading document...', 'info');
    
    try {
      const text = await file.text();
      essayText = text.trim();
    } catch (error) {
      showStatus(statusDiv, `Error reading file: ${error.message}`, 'error');
      return;
    }
  }

  if (!essayText) {
    showStatus(statusDiv, 'Please enter an essay or upload a document', 'error');
    return;
  }

  try {
    showStatus(statusDiv, 'Uploading essay...', 'info');

    const response = await fetch(`${API_URL}/model/essay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ essay: essayText })
    });

    const data = await response.json();

    if (!response.ok) {
      showStatus(statusDiv, `Error: ${data.error}`, 'error');
      return;
    }

    modelEssayId = data.modelId;
    showStatus(statusDiv, `✅ Model essay uploaded successfully!`, 'success');
    checkModelAnswersReady();
  } catch (error) {
    showStatus(statusDiv, `Error: ${error.message}`, 'error');
  }
}

function checkModelAnswersReady() {
  if (modelDiagramId && modelEssayId) {
    const modelInfo = document.getElementById('modelInfo');
    modelInfo.style.display = 'block';
    
    const shareUrl = `${window.location.origin}?modelDiagram=${modelDiagramId}&modelEssay=${modelEssayId}`;
    document.getElementById('shareLink').value = shareUrl;
  }
}

function copyShareLink() {
  const shareLink = document.getElementById('shareLink');
  shareLink.select();
  document.execCommand('copy');
  alert('Link copied to clipboard!');
}

// Student diagram upload
document.getElementById('studentDiagramFile')?.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  const previewDiv = document.getElementById('studentDiagramPreview');

  if (files.length === 0) {
    previewDiv.innerHTML = '';
    studentDiagramFiles = [];
    return;
  }

  studentDiagramFiles = files;
  displayPreviewGrid(files, previewDiv, 'studentDiagram');
});

function displayPreviewGrid(files, container, type) {
  container.innerHTML = '';
  
  files.forEach((file, index) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML = `
          <img src="${event.target.result}" alt="Preview ${index + 1}">
          <button type="button" class="remove-btn" onclick="removeFile('${type}', ${index})">×</button>
          <div class="file-name">${file.name}</div>
        `;
        container.appendChild(item);
      };
      reader.readAsDataURL(file);
    } else {
      const item = document.createElement('div');
      item.className = 'preview-item';
      item.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; color: #666;">📄</div>
        <button type="button" class="remove-btn" onclick="removeFile('${type}', ${index})">×</button>
        <div class="file-name">${file.name}</div>
      `;
      container.appendChild(item);
    }
  });

  const badge = document.createElement('div');
  badge.className = 'file-count';
  badge.textContent = `${files.length} file(s) selected`;
  container.appendChild(badge);
}

function removeFile(type, index) {
  if (type === 'studentDiagram') {
    studentDiagramFiles.splice(index, 1);
    const previewDiv = document.getElementById('studentDiagramPreview');
    displayPreviewGrid(studentDiagramFiles, previewDiv, 'studentDiagram');
  } else if (type === 'modelDiagram') {
    modelDiagramFiles.splice(index, 1);
    const previewDiv = document.getElementById('modelDiagramPreview');
    displayPreviewGrid(modelDiagramFiles, previewDiv, 'modelDiagram');
  }
}

async function submitAssignment() {
  const essayText = document.getElementById('studentEssay').value.trim();
  const statusDiv = document.getElementById('submissionStatus');

  let modelDiag = modelDiagramId;
  let modelEss = modelEssayId;

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('modelDiagram')) {
    modelDiag = urlParams.get('modelDiagram');
  }
  if (urlParams.has('modelEssay')) {
    modelEss = urlParams.get('modelEssay');
  }

  // Check if essay is provided
  if (!essayText) {
    showStatus(statusDiv, 'Please enter your essay', 'error');
    return;
  }

  if (!modelDiag || !modelEss) {
    showStatus(statusDiv, 'Model answers not configured. Please ask your instructor for the submission link.', 'error');
    return;
  }

  // Check if diagram is missing and show warning
  if (studentDiagramFiles.length === 0) {
    const confirmed = confirm(
      '⚠️ WARNING: No diagram submitted!\n\n' +
      'Your diagram score will be 0.\n' +
      'Your final grade will be based only on your essay.\n\n' +
      'Do you want to continue without a diagram?'
    );
    
    if (!confirmed) {
      showStatus(statusDiv, 'Submission cancelled. Please upload a diagram.', 'info');
      return;
    }
  }

  try {
    const diagramCount = studentDiagramFiles.length;
    const submissionType = diagramCount === 0 ? 'essay only' : `${diagramCount} diagram(s)`;
    showStatus(statusDiv, `Grading submission (${submissionType})...`, 'info');

    const formData = new FormData();
    
    // Add diagram if available, otherwise add a placeholder
    if (studentDiagramFiles.length > 0) {
      formData.append('diagram', studentDiagramFiles[0]);
    } else {
      // Create empty diagram for essay-only submission
      const emptyDiagram = {
        nodes: [],
        connections: []
      };
      formData.append('diagram', JSON.stringify(emptyDiagram));
    }
    
    formData.append('essayFile', essayText);
    formData.append('modelDiagramId', modelDiag);
    formData.append('modelEssayId', modelEss);

    const response = await fetch(`${API_URL}/submit`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      showStatus(statusDiv, `Error: ${data.error}`, 'error');
      return;
    }

    const message = diagramCount === 0 
      ? `✅ Grading complete! (Essay only - Diagram score: 0)`
      : `✅ Grading complete! (${diagramCount} diagram(s) submitted)`;
    
    showStatus(statusDiv, message, 'success');
    displayResults(data.report, diagramCount === 0);
  } catch (error) {
    showStatus(statusDiv, `Error: ${error.message}`, 'error');
  }
}

function displayResults(report, essayOnly = false) {
  const resultsSection = document.getElementById('resultsSection');
  const resultsDiv = document.getElementById('results');

  const warningHtml = essayOnly ? `
    <div class="score-card" style="border-left-color: #f59e0b; background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%);">
      <h3>⚠️ Essay-Only Submission</h3>
      <p style="color: #92400e; margin: 0;">No diagram was submitted. Your diagram score is 0. Your final grade is based only on your essay.</p>
    </div>
  ` : '';

  const html = `
    ${warningHtml}

    <div class="score-card">
      <h3>🎯 Overall Score</h3>
      <div class="score-display">
        <span class="score-label">Hybrid Score</span>
        <span class="score-value">${report.hybridScore.toFixed(2)}</span>
      </div>
      <div class="score-bar">
        <div class="score-bar-fill" style="width: ${report.hybridScore}%"></div>
      </div>
    </div>

    <div class="score-card">
      <h3>📐 Diagram Evaluation</h3>
      <div class="score-display">
        <span class="score-label">Diagram Score</span>
        <span class="score-value">${report.diagramScore.toFixed(2)}</span>
      </div>
      <div class="score-bar">
        <div class="score-bar-fill" style="width: ${report.diagramScore}%"></div>
      </div>
      <div class="breakdown">
        <div class="breakdown-item">
          <span class="breakdown-label">Node Count Match</span>
          <span class="breakdown-value">${report.diagramDetails.nodeCountMatch.toFixed(2)}</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Connection Count Match</span>
          <span class="breakdown-value">${report.diagramDetails.connectionCountMatch.toFixed(2)}</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Label Accuracy</span>
          <span class="breakdown-value">${report.diagramDetails.labelAccuracy.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="score-card">
      <h3>📝 Essay Evaluation</h3>
      <div class="score-display">
        <span class="score-label">Essay Score</span>
        <span class="score-value">${report.essayScore.toFixed(2)}</span>
      </div>
      <div class="score-bar">
        <div class="score-bar-fill" style="width: ${report.essayScore}%"></div>
      </div>
      <div class="breakdown">
        <div class="breakdown-item">
          <span class="breakdown-label">Keyword Coverage</span>
          <span class="breakdown-value">${report.essayDetails.keywordCoverage.toFixed(2)}</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Term Frequency</span>
          <span class="breakdown-value">${report.essayDetails.termFrequency.toFixed(2)}</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Content Length</span>
          <span class="breakdown-value">${report.essayDetails.contentLength.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="score-card">
      <h3>📋 Submission Details</h3>
      <div class="breakdown">
        <div class="breakdown-item">
          <span class="breakdown-label">Submission ID</span>
          <span class="breakdown-value">${report.submissionId}</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Timestamp</span>
          <span class="breakdown-value">${new Date(report.timestamp).toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;

  resultsDiv.innerHTML = html;
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status show ${type}`;

  if (type === 'info') {
    setTimeout(() => {
      element.classList.remove('show');
    }, 3000);
  }
}

async function openCamera(target) {
  currentCameraTarget = target;
  const modal = document.getElementById('cameraModal');
  const video = document.getElementById('cameraVideo');

  modal.style.display = 'flex';

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    video.srcObject = stream;
  } catch (error) {
    alert('Unable to access camera. Please check permissions.');
    closeCamera();
  }
}

function closeCamera() {
  const modal = document.getElementById('cameraModal');
  const video = document.getElementById('cameraVideo');

  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }

  modal.style.display = 'none';
  currentCameraTarget = null;
}

function capturePhoto() {
  const video = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');
  const ctx = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  canvas.toBlob((blob) => {
    const file = new File([blob], `diagram-${Date.now()}.jpg`, { type: 'image/jpeg' });
    
    if (currentCameraTarget === 'modelDiagram') {
      modelDiagramFiles.push(file);
      const previewDiv = document.getElementById('modelDiagramPreview');
      displayPreviewGrid(modelDiagramFiles, previewDiv, 'modelDiagram');
    } else if (currentCameraTarget === 'studentDiagram') {
      studentDiagramFiles.push(file);
      const previewDiv = document.getElementById('studentDiagramPreview');
      displayPreviewGrid(studentDiagramFiles, previewDiv, 'studentDiagram');
    }
    
    closeCamera();
  }, 'image/jpeg', 0.95);
}

function handleDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
  const box = event.currentTarget;
  box.classList.add('drag-over');
}

function handleDragLeave(event) {
  event.preventDefault();
  event.stopPropagation();
  const box = event.currentTarget;
  box.classList.remove('drag-over');
}

function handleDrop(event, target) {
  event.preventDefault();
  event.stopPropagation();
  const box = event.currentTarget;
  box.classList.remove('drag-over');

  const files = Array.from(event.dataTransfer.files);
  const validFiles = files.filter(f => f.type.startsWith('image/') || f.type === 'application/pdf');
  
  if (validFiles.length === 0) {
    alert('Please drop image or PDF files');
    return;
  }

  if (target === 'modelDiagram') {
    modelDiagramFiles.push(...validFiles);
    const previewDiv = document.getElementById('modelDiagramPreview');
    displayPreviewGrid(modelDiagramFiles, previewDiv, 'modelDiagram');
  } else if (target === 'studentDiagram') {
    studentDiagramFiles.push(...validFiles);
    const previewDiv = document.getElementById('studentDiagramPreview');
    displayPreviewGrid(studentDiagramFiles, previewDiv, 'studentDiagram');
  }
}


// Student essay file upload
document.getElementById('studentEssayFile')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    document.getElementById('studentEssay').value = text;
  } catch (error) {
    alert(`Error reading file: ${error.message}`);
  }
});
