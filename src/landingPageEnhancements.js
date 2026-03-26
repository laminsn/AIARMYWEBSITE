import { supabase } from './supabaseClient.js';

export function initializeLandingPageEnhancements() {
  makeComparisonTableCollapsible();
  setupCTAForms();
  setupSurveySubmission();
  removeDollarAmountsFromAIArmy();
  setupGoldFramedProblemSection();
}

function makeComparisonTableCollapsible() {
  const table = document.querySelector('.compare-table-wrap');
  if (!table) return;

  const toggleButton = document.createElement('button');
  toggleButton.className = 'comparison-toggle-btn';
  toggleButton.textContent = 'Show Full Comparison';
  toggleButton.style.cssText = `
    display: block;
    margin: 20px auto;
    padding: 12px 24px;
    background: var(--grad-gold);
    color: var(--void);
    border: none;
    font-weight: 600;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 12px;
  `;

  const tableElement = table.querySelector('.compare-table');
  tableElement.style.maxHeight = '400px';
  tableElement.style.overflow = 'hidden';
  tableElement.style.transition = 'max-height 0.5s ease';

  table.parentNode.insertBefore(toggleButton, table.nextSibling);

  let isExpanded = false;
  toggleButton.addEventListener('click', () => {
    isExpanded = !isExpanded;
    if (isExpanded) {
      tableElement.style.maxHeight = 'none';
      toggleButton.textContent = 'Show Less';
    } else {
      tableElement.style.maxHeight = '400px';
      toggleButton.textContent = 'Show Full Comparison';
    }
  });
}

function removeDollarAmountsFromAIArmy() {
  const raraColumn = document.querySelector('.col-rara .price-tag');
  if (raraColumn) {
    raraColumn.textContent = 'Custom';
    const note = raraColumn.nextElementSibling;
    if (note) {
      note.textContent = 'see packages';
    }
  }
}

function setupGoldFramedProblemSection() {
  const painGrid = document.querySelector('.pain-grid');
  if (!painGrid) return;

  const frame = document.createElement('div');
  frame.className = 'gold-frame-container';
  frame.style.cssText = `
    border: 3px solid var(--g3);
    padding: 40px;
    margin: 40px 0;
    position: relative;
    max-height: 600px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.3);
    box-shadow: inset 0 0 20px rgba(201, 149, 42, 0.2);
  `;

  painGrid.parentNode.insertBefore(frame, painGrid);
  frame.appendChild(painGrid);

  frame.addEventListener('scroll', () => {
    const percentages = frame.querySelectorAll('.pain-card-num');
    percentages.forEach(num => {
      const rect = num.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      if (rect.top >= frameRect.top && rect.bottom <= frameRect.bottom) {
        num.style.transform = 'scale(1) translateY(0)';
        num.style.opacity = '1';
      } else {
        num.style.transform = 'scale(0.8) translateY(20px)';
        num.style.opacity = '0.5';
      }
    });
  });
}

function setupCTAForms() {
  const ctaButtons = document.querySelectorAll('.btn-gold, .calc-cta, .survey-trigger');

  ctaButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      if (button.classList.contains('survey-trigger')) return;

      e.preventDefault();
      showCTAModal(button.textContent);
    });
  });
}

function showCTAModal(source) {
  const modal = document.createElement('div');
  modal.className = 'cta-modal';
  modal.innerHTML = `
    <div class="cta-modal-content">
      <button class="cta-modal-close">&times;</button>
      <h2>Book Your Strategy Call</h2>
      <form class="cta-form" id="cta-form">
        <input type="text" name="name" placeholder="Full Name *" required>
        <input type="tel" name="phone" placeholder="Phone Number *" required>
        <input type="email" name="email" placeholder="Email Address *" required>
        <select name="best_time" required>
          <option value="">Best Time to Call *</option>
          <option value="Morning (8am-12pm)">Morning (8am-12pm)</option>
          <option value="Afternoon (12pm-5pm)">Afternoon (12pm-5pm)</option>
          <option value="Evening (5pm-8pm)">Evening (5pm-8pm)</option>
        </select>
        <button type="submit" class="btn-gold">Submit Request</button>
      </form>
      <div class="cta-calendar-section">
        <p>Or schedule directly:</p>
        <iframe src="https://calendar.google.com/calendar/appointments/schedules/YOUR_CALENDAR_ID"
                style="border: 0" width="100%" height="600" frameborder="0"></iframe>
      </div>
    </div>
  `;

  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.cta-modal-close');
  closeBtn.addEventListener('click', () => modal.remove());

  const form = modal.querySelector('#cta-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      best_time: formData.get('best_time'),
      source: source
    };

    const result = await submitCTAForm(data);
    if (result.success) {
      alert('Thank you! We will contact you soon.');
      modal.remove();
    } else {
      alert('There was an error. Please try again.');
    }
  });
}

async function submitCTAForm(formData) {
  try {
    const { data, error } = await supabase
      .from('cta_submissions')
      .insert([formData])
      .select()
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting CTA form:', error);
    return { success: false, error: error.message };
  }
}

function setupSurveySubmission() {
  const submitButton = document.querySelector('[onclick*="submitSurvey"]');
  if (!submitButton) return;

  submitButton.addEventListener('click', async () => {
    const surveyData = collectSurveyData();

    const result = await submitSurveyResponse(surveyData);

    if (result.success) {
      console.log('Survey submitted successfully');
      await sendEmailNotification(surveyData);
    }
  });
}

function collectSurveyData() {
  return {
    business_type: document.querySelector('[name="business_type"]:checked')?.value,
    staff_size: document.querySelector('[name="staff_size"]:checked')?.value,
    current_software: Array.from(document.querySelectorAll('[name="software"]:checked')).map(el => el.value),
    primary_challenge: document.querySelector('[name="challenge"]:checked')?.value,
    pain_points: Array.from(document.querySelectorAll('[name="pain_points"]:checked')).map(el => el.value),
    ai_comfort_level: document.querySelector('[name="ai_comfort"]:checked')?.value,
    timeline: document.querySelector('[name="timeline"]:checked')?.value,
    annual_revenue: document.querySelector('[name="revenue"]:checked')?.value,
    revenue_goal: document.querySelector('[name="goal"]:checked')?.value,
    score: parseInt(document.getElementById('survey-score')?.textContent || '0'),
    contact_name: document.getElementById('survey-name')?.value,
    contact_email: document.getElementById('survey-email')?.value,
    contact_phone: document.getElementById('survey-phone')?.value
  };
}

async function submitSurveyResponse(surveyData) {
  try {
    const { data, error } = await supabase
      .from('survey_responses')
      .insert([surveyData])
      .select()
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting survey:', error);
    return { success: false, error: error.message };
  }
}

async function sendEmailNotification(surveyData) {
  console.log('=== NEW SURVEY RESPONSE ===');
  console.log('Score:', surveyData.score);
  console.log('Contact Name:', surveyData.contact_name);
  console.log('Contact Email:', surveyData.contact_email);
  console.log('Contact Phone:', surveyData.contact_phone);
  console.log('Business Type:', surveyData.business_type);
  console.log('Timeline:', surveyData.timeline);
  console.log('Submitted:', new Date().toLocaleString());
  console.log('==========================');
}
