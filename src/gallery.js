import { supabase } from './supabaseClient.js';

export function initializeGallery() {
  document.addEventListener('videoUploaded', loadVideos);
}

export async function loadVideos() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '<div class="loading">Loading videos...</div>';

  try {
    const { data: files, error } = await supabase.storage
      .from('media')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;

    const videoFiles = files.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext);
    });

    if (videoFiles.length === 0) {
      gallery.innerHTML = '<div class="empty-state">No videos uploaded yet. Upload your first video above!</div>';
      return;
    }

    gallery.innerHTML = '';

    for (const file of videoFiles) {
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(file.name);

      const card = createVideoCard(file, publicUrl);
      gallery.appendChild(card);
    }

  } catch (error) {
    console.error('Error loading videos:', error);
    gallery.innerHTML = `<div class="error">Error loading videos: ${error.message}</div>`;
  }
}

function createVideoCard(file, url) {
  const card = document.createElement('div');
  card.className = 'video-card';

  const video = document.createElement('video');
  video.src = url;
  video.controls = true;
  video.preload = 'metadata';

  const info = document.createElement('div');
  info.className = 'video-info';

  const name = document.createElement('div');
  name.className = 'video-name';
  name.textContent = file.name;
  name.title = file.name;

  const size = document.createElement('div');
  size.className = 'video-size';
  size.textContent = formatFileSize(file.metadata?.size);

  const actions = document.createElement('div');
  actions.className = 'video-actions';

  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'action-btn';
  downloadBtn.textContent = 'Download';
  downloadBtn.onclick = () => downloadVideo(url, file.name);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.onclick = () => deleteVideo(file.name);

  actions.appendChild(downloadBtn);
  actions.appendChild(deleteBtn);

  info.appendChild(name);
  info.appendChild(size);
  info.appendChild(actions);

  card.appendChild(video);
  card.appendChild(info);

  return card;
}

function formatFileSize(bytes) {
  if (!bytes) return 'Unknown size';
  const kb = bytes / 1024;
  const mb = kb / 1024;
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }
  return `${kb.toFixed(2)} KB`;
}

function downloadVideo(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function deleteVideo(filename) {
  if (!confirm(`Are you sure you want to delete ${filename}?`)) {
    return;
  }

  try {
    const { error } = await supabase.storage
      .from('media')
      .remove([filename]);

    if (error) throw error;

    loadVideos();
  } catch (error) {
    console.error('Delete error:', error);
    alert(`Error deleting video: ${error.message}`);
  }
}
