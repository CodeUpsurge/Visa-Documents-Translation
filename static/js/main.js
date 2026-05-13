/**
 * Visa Translator - Main JavaScript
 */

// Global state
let uploadedFiles = [];
let sessionId = null;

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');
const fileList = document.getElementById('fileList');
const submitBtn = document.getElementById('submitBtn');
const progressArea = document.getElementById('progressArea');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const resultArea = document.getElementById('resultArea');
const errorArea = document.getElementById('errorArea');
const errorText = document.getElementById('errorText');
const downloadBtn = document.getElementById('downloadBtn');
const newBtn = document.getElementById('newBtn');
const retryBtn = document.getElementById('retryBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupDropZone();
    setupButtons();
});

// Setup Drop Zone
function setupDropZone() {
    // Click to select files
    selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Drag and drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
}

// Handle selected files
function handleFiles(files) {
    for (const file of files) {
        // Check file type
        const ext = file.name.split('.').pop().toLowerCase();
        const allowedTypes = ['pdf', 'xlsx', 'xls', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'];

        if (!allowedTypes.includes(ext)) {
            showError(`不支持的文件类型: ${file.name}\nUnsupported file type: ${file.name}`);
            continue;
        }

        // Check if already added
        if (uploadedFiles.some(f => f.name === file.name)) {
            continue;
        }

        uploadedFiles.push(file);
    }

    updateFileList();
    updateSubmitButton();
}

// Update file list display
function updateFileList() {
    fileList.innerHTML = '';

    if (uploadedFiles.length === 0) {
        return;
    }

    uploadedFiles.forEach((file, index) => {
        const ext = file.name.split('.').pop().toLowerCase();
        const size = formatFileSize(file.size);

        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <div class="file-info">
                <i class="bi bi-file-earmark file-icon ${ext}"></i>
                <div>
                    <div class="file-name">${escapeHtml(file.name)}</div>
                    <div class="file-size">${size}</div>
                </div>
            </div>
            <i class="bi bi-x-circle file-remove" data-index="${index}"></i>
        `;

        // Remove button
        item.querySelector('.file-remove').addEventListener('click', () => {
            uploadedFiles.splice(index, 1);
            updateFileList();
            updateSubmitButton();
        });

        fileList.appendChild(item);
    });
}

// Update submit button state
function updateSubmitButton() {
    submitBtn.disabled = uploadedFiles.length === 0;
}

// Setup buttons
function setupButtons() {
    // Submit button
    submitBtn.addEventListener('click', processFiles);

    // New translation button
    newBtn.addEventListener('click', resetForm);

    // Retry button
    retryBtn.addEventListener('click', () => {
        errorArea.classList.add('d-none');
        processFiles();
    });
}

// Process files
async function processFiles() {
    if (uploadedFiles.length === 0) {
        showError('请先选择文件 / Please select files first');
        return;
    }

    // Show loading state
    setLoading(true);
    showProgress();
    hideError();
    hideResult();

    try {
        // Step 1: Upload files
        updateProgress(10, '上传文件中... / Uploading files...');
        const uploadResult = await uploadFiles();

        if (!uploadResult.session_id) {
            throw new Error(uploadResult.error || '上传失败 / Upload failed');
        }

        sessionId = uploadResult.session_id;

        // Step 2: Process files
        updateProgress(30, '处理文件中... / Processing files...');
        const sourceLang = document.getElementById('sourceLang').value;
        const targetLang = document.getElementById('targetLang').value;
        const merge = document.getElementById('mergeFiles').checked;

        updateProgress(50, '识别和翻译中... / Recognizing and translating...');
        const processResult = await processUploadedFiles(sessionId, sourceLang, targetLang, merge);

        if (processResult.error) {
            throw new Error(processResult.error);
        }

        // Step 3: Complete
        updateProgress(100, '完成！ / Complete!');
        showResult(processResult);

    } catch (error) {
        console.error('Processing error:', error);
        showError(error.message || '处理失败 / Processing failed');
    } finally {
        setLoading(false);
    }
}

// Upload files to server
async function uploadFiles() {
    const formData = new FormData();

    uploadedFiles.forEach((file, index) => {
        formData.append('files[]', file);
    });

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    return await response.json();
}

// Process uploaded files
async function processUploadedFiles(sessionId, sourceLang, targetLang, merge) {
    const response = await fetch('/process', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            session_id: sessionId,
            source_lang: sourceLang,
            target_lang: targetLang,
            merge: merge
        })
    });

    return await response.json();
}

// Update progress bar
function updateProgress(percent, text) {
    progressBar.style.width = `${percent}%`;
    progressBar.textContent = `${percent}%`;
    progressText.textContent = text;
}

// Show/hide progress
function showProgress() {
    progressArea.classList.remove('d-none');
    updateProgress(0, '准备处理... / Preparing...');
}

// Show result
function showResult(result) {
    progressArea.classList.add('d-none');
    resultArea.classList.remove('d-none');
    downloadBtn.href = result.download_url;
}

// Hide result
function hideResult() {
    resultArea.classList.add('d-none');
}

// Show error
function showError(message) {
    errorArea.classList.remove('d-none');
    errorText.textContent = message;
}

// Hide error
function hideError() {
    errorArea.classList.add('d-none');
}

// Set loading state
function setLoading(loading) {
    submitBtn.disabled = loading;
    btnSpinner.classList.toggle('d-none', !loading);
    btnText.textContent = loading ? '处理中... / Processing...' : '生成翻译件 / Generate Translation';
}

// Reset form
function resetForm() {
    uploadedFiles = [];
    sessionId = null;
    fileList.innerHTML = '';
    fileInput.value = '';
    updateSubmitButton();
    hideResult();
    hideError();
    progressArea.classList.add('d-none');
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}