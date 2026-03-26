import { supabase } from './supabaseClient.js';

export function initializeUpload() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const progressBar = document.getElementById('progressBar');
  const progressContainer = document.getElementById('progressContainer');
  const statusText = document.getElementById('statusText');

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      updateDropzoneText(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      updateDropzoneText(e.target.files[0]);
    }
  });

  uploadBtn.addEventListener('click', uploadVideo);
}

function updateDropzoneText(file) {
  const dropzone = document.getElementById('dropzone');
  const icon = dropzone.querySelector('.upload-icon');
  icon.textContent = '📹';
  const text = dropzone.querySelector('p');
  text.textContent = file.name;
  text.style.fontSize = '14px';
}

async function uploadVideo() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a video file');
    return;
  }

  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const statusText = document.getElementById('statusText');
  const uploadBtn = document.getElementById('uploadBtn');

  progressContainer.style.display = 'block';
  uploadBtn.disabled = true;
  statusText.textContent = 'Uploading...';
  progressBar.style.width = '0%';

  try {
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}_${file.name}`;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          const percentage = (progress.loaded / progress.total) * 100;
          progressBar.style.width = `${percentage}%`;
        }
      });

    if (error) throw error;

    progressBar.style.width = '100%';
    statusText.textContent = 'Upload complete!';
    statusText.style.color = '#10b981';

    setTimeout(() => {
      progressContainer.style.display = 'none';
      uploadBtn.disabled = false;
      fileInput.value = '';
      resetDropzone();

      const event = new CustomEvent('videoUploaded');
      document.dispatchEvent(event);
    }, 2000);

  } catch (error) {
    console.error('Upload error:', error);
    statusText.textContent = `Error: ${error.message}`;
    statusText.style.color = '#ef4444';
    uploadBtn.disabled = false;
  }
}

function resetDropzone() {
  const dropzone = document.getElementById('dropzone');
  const icon = dropzone.querySelector('.upload-icon');
  icon.textContent = '☁️';
  const text = dropzone.querySelector('p');
  text.textContent = 'Click to select or drag and drop your video here';
  text.style.fontSize = '16px';
}
