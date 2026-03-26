import './styles.css';
import { supabase } from './supabaseClient.js';
import { initializeUpload } from './upload.js';
import { initializeGallery, loadVideos } from './gallery.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeUpload();
  initializeGallery();
  loadVideos();
});
