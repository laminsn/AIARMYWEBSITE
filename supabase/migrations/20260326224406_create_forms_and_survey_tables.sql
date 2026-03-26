/*
  # Create CTA Forms and Survey Tables

  1. New Tables
    - cta_submissions: stores CTA form submissions
    - survey_responses: stores AI Readiness Survey responses
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated admin access
    - Add policies for anonymous inserts
*/

CREATE TABLE IF NOT EXISTS cta_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text NOT NULL,
  best_time text,
  source text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type text,
  staff_size text,
  current_software jsonb DEFAULT '[]'::jsonb,
  primary_challenge text,
  pain_points jsonb DEFAULT '[]'::jsonb,
  ai_comfort_level text,
  timeline text,
  annual_revenue text,
  revenue_goal text,
  score integer DEFAULT 0,
  contact_name text,
  contact_email text,
  contact_phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cta_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts on cta_submissions"
  ON cta_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on survey_responses"
  ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all cta_submissions"
  ON cta_submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view all survey_responses"
  ON survey_responses
  FOR SELECT
  TO authenticated
  USING (true);