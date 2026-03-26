import { supabase } from './supabaseClient.js';

export async function submitCTAForm(formData) {
  try {
    const { data, error } = await supabase
      .from('cta_submissions')
      .insert([{
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        best_time: formData.best_time,
        source: formData.source || 'general'
      }])
      .select()
      .maybeSingle();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error submitting CTA form:', error);
    return { success: false, error: error.message };
  }
}

export async function submitSurveyResponse(surveyData) {
  try {
    const { data, error } = await supabase
      .from('survey_responses')
      .insert([surveyData])
      .select()
      .maybeSingle();

    if (error) throw error;

    await sendSurveyNotification(surveyData);

    return { success: true, data };
  } catch (error) {
    console.error('Error submitting survey:', error);
    return { success: false, error: error.message };
  }
}

async function sendSurveyNotification(surveyData) {
  console.log('Survey Response Received:', {
    score: surveyData.score,
    contact: {
      name: surveyData.contact_name,
      email: surveyData.contact_email,
      phone: surveyData.contact_phone
    },
    businessType: surveyData.business_type,
    timeline: surveyData.timeline,
    submittedAt: new Date().toLocaleString()
  });
}
