
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
    const { resumeData } = await req.json();

    if (!resumeData) {
      throw new Error('Resume data is required');
    }

    // Format resume data for better prompt context
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

    console.log("Sending resume data to OpenAI:");
    
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
            content: `You are an AI career coach specializing in resume analysis. 
            Analyze the resume provided and give specific, actionable improvement suggestions. 
            Focus on content gaps, achievement presentation, and industry-specific improvements. 
            Return a JSON array of suggestions as strings, with no additional commentary.
            Limit your response to 5-7 specific, high-impact suggestions.
            Format your response as: { "suggestions": ["Suggestion 1", "Suggestion 2", etc] }`
          },
          { role: 'user', content: formattedResume }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("Received response from OpenAI:", data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response from OpenAI');
    }

    // Parse the content as JSON
    try {
      const content = data.choices[0].message.content;
      console.log("Parsing content:", content);
      
      // If the content is already valid JSON
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch (parseError) {
        console.log("Failed to parse response as JSON, returning raw suggestions");
        // If it's not valid JSON, extract suggestions using regex as fallback
        const suggestions = content.includes("suggestions") 
          ? content.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || []
          : content.split(/\d+\.\s+/).filter(Boolean).map(s => s.trim());
        parsedContent = { suggestions };
      }
      
      // Ensure we have a suggestions array
      if (!parsedContent.suggestions || !Array.isArray(parsedContent.suggestions)) {
        parsedContent = { suggestions: [content] };
      }
      
      return new Response(JSON.stringify(parsedContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (jsonError) {
      console.error('Error parsing OpenAI response:', jsonError);
      throw new Error('Failed to parse suggestions from OpenAI');
    }
  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    return new Response(JSON.stringify({ error: error.message, suggestions: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
