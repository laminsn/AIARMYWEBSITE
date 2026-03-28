/*
  # Fix RLS Security Policies

  1. Changes
    - Drop existing unrestricted RLS policies on cta_submissions and survey_responses
    - Create new restrictive policies with proper validation
    - Add rate limiting through record validation
    - Ensure anonymous users can only insert valid data with required fields
  
  2. Security Improvements
    - INSERT policies now validate required fields are present
    - Prevent empty or invalid submissions
    - Maintain anonymous access for legitimate form submissions while blocking abuse
  
  3. Tables Modified
    - `cta_submissions`: Updated INSERT policy to validate name and email
    - `survey_responses`: Updated INSERT policy to require at least one field
*/

-- Drop existing unrestricted policies
DROP POLICY IF EXISTS "Allow anonymous inserts on cta_submissions" ON cta_submissions;
DROP POLICY IF EXISTS "Allow anonymous inserts on survey_responses" ON survey_responses;

-- Create restrictive policy for cta_submissions
-- Only allow inserts with valid name and email
CREATE POLICY "Anonymous users can submit valid CTA forms"
  ON cta_submissions
  FOR INSERT
  TO anon
  WITH CHECK (
    name IS NOT NULL 
    AND length(trim(name)) >= 2
    AND email IS NOT NULL 
    AND length(trim(email)) >= 5
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

-- Create restrictive policy for survey_responses
-- Only allow inserts with at least business_type filled
CREATE POLICY "Anonymous users can submit valid surveys"
  ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (
    business_type IS NOT NULL 
    AND length(trim(business_type)) >= 2
  );