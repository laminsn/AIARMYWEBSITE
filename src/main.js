import './styles.css';
import { supabase } from './supabaseClient.js';
import { initializeUpload } from './upload.js';
import { initializeGallery, loadVideos } from './gallery.js';
import { initializeLandingPageEnhancements } from './landingPageEnhancements.js';

document.addEventListener('DOMContentLoaded', () => {
  const isUploadPage = window.location.pathname.includes('upload.html');

  if (isUploadPage) {
    initializeUpload();
    initializeGallery();
    loadVideos();
  } else {
    initializeLandingPageEnhancements();
  }
});
