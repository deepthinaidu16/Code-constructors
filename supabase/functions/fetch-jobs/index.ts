
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Here we'll integrate with a job board API
    // For now, let's return some realistic sample data
    const jobPostings = [
      {
        title: "Senior Frontend Developer",
        company: "TechCorp Solutions",
        description: "We are seeking an experienced Frontend Developer to join our growing team...",
        requirements: [
          "5+ years of experience with React",
          "Strong knowledge of TypeScript",
          "Experience with modern frontend tools and practices",
          "Bachelor's degree in Computer Science or related field"
        ],
        preferredSkills: [
          "Experience with Next.js",
          "Knowledge of GraphQL",
          "UI/UX design skills"
        ]
      },
      {
        title: "Full Stack Engineer",
        company: "InnovateTech",
        description: "Join our dynamic team building the next generation of web applications...",
        requirements: [
          "3+ years of full-stack development experience",
          "Proficiency in React and Node.js",
          "Experience with SQL and NoSQL databases",
          "Strong problem-solving skills"
        ],
        preferredSkills: [
          "AWS experience",
          "Docker and Kubernetes",
          "CI/CD pipeline experience"
        ]
      },
      // Add more realistic job postings...
    ]

    return new Response(
      JSON.stringify(jobPostings),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
