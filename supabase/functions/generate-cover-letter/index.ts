
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeData, jobData } = await req.json();

    if (!resumeData || !jobData) {
      throw new Error('Resume data and job data are required');
    }

    // Format resume and job data for prompt
    const formattedResume = `
NAME: ${resumeData.name}
EMAIL: ${resumeData.email}
PHONE: ${resumeData.phone || 'Not provided'}

SUMMARY: ${resumeData.summary || 'Not provided'}

EDUCATION:
${resumeData.education.map(edu => `- ${edu.degree} in ${edu.field} from ${edu.institution} (${edu.startDate} - ${edu.endDate})`).join('\n')}

EXPERIENCE:
${resumeData.experience.map(exp => 
  `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate})
   ${exp.description.map(desc => `   * ${desc}`).join('\n')}`
).join('\n\n')}

SKILLS:
${resumeData.skills.map(skill => `- ${skill.name}`).join('\n')}
`;

    const formattedJob = `
JOB TITLE: ${jobData.title}
COMPANY: ${jobData.company}
DESCRIPTION: ${jobData.description}

REQUIREMENTS:
${jobData.requirements.map(req => `- ${req}`).join('\n')}

PREFERRED SKILLS:
${(jobData.preferredSkills || []).map(skill => `- ${skill}`).join('\n')}
`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are an AI career coach specializing in cover letter writing. 
            Create a professional, personalized cover letter based on the candidate's resume and the job description provided.
            The cover letter should:
            1. Use proper business letter format with today's date
            2. Address the hiring manager appropriately
            3. Highlight the candidate's most relevant experience and skills
            4. Explain why they are a good fit for the specific role and company
            5. End with a call to action and professional closing
            Keep the tone professional but conversational.`
          },
          { 
            role: 'user', 
            content: `Please write a cover letter for the following job based on my resume.\n\nMY RESUME:\n${formattedResume}\n\nJOB DETAILS:\n${formattedJob}` 
          }
        ],
        temperature: 0.7,
        response_format: { type: 'text' }
      }),
    });

    const data = await response.json();
    const coverLetter = data.choices[0].message.content;

    return new Response(JSON.stringify({ coverLetter }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-cover-letter function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
