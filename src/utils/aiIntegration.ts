
import { supabase } from '@/integrations/supabase/client';
import { ResumeData, JobPosting } from './resumeTypes';

/**
 * Analyze resume using AI to get improvement suggestions
 */
export const analyzeResumeWithAI = async (resumeData: ResumeData): Promise<string[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-resume', {
      body: { resumeData },
    });

    if (error) {
      console.error('Error calling analyze-resume function:', error);
      throw new Error('Failed to analyze resume: ' + error.message);
    }

    if (!data || !data.suggestions || !Array.isArray(data.suggestions) || data.suggestions.length === 0) {
      console.error('Invalid response format from analyze-resume function:', data);
      throw new Error('Invalid response from resume analysis');
    }

    return data.suggestions;
  } catch (error) {
    console.error('Error in analyzeResumeWithAI:', error);
    throw error; // Propagate the error to be handled by the component
  }
};

/**
 * Generate cover letter using AI based on resume and job posting
 */
export const generateCoverLetterWithAI = async (resumeData: ResumeData, jobData: JobPosting): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
      body: { resumeData, jobData },
    });

    if (error) {
      console.error('Error calling generate-cover-letter function:', error);
      return "There was an error generating your cover letter. Please try again later.";
    }

    return data.coverLetter || "";
  } catch (error) {
    console.error('Error in generateCoverLetterWithAI:', error);
    return "There was an error generating your cover letter. Please try again later.";
  }
};
