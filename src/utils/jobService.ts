
import { supabase } from '@/integrations/supabase/client';
import { JobPosting } from './resumeTypes';

export const fetchJobPostings = async (): Promise<JobPosting[]> => {
  try {
    const { data: jobPostings, error } = await supabase.functions.invoke('fetch-jobs', {
      body: { limit: 10 }
    });

    if (error) {
      console.error('Error fetching job postings:', error);
      throw error;
    }

    return jobPostings || [];
  } catch (error) {
    console.error('Error in fetchJobPostings:', error);
    throw error;
  }
};

