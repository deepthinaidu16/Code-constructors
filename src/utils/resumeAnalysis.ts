
// AI-powered resume analysis utilities
import * as pdfjs from 'pdfjs-dist';

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ResumeData {
  name: string;
  email: string;
  phone?: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  summary?: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface Experience {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string[];
}

interface Skill {
  name: string;
  level?: number; // 1-10
  category?: string;
}

interface JobPosting {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  preferredSkills?: string[];
}

// Real resume parsing function that extracts data from uploaded file
export const parseResume = async (file: File): Promise<ResumeData> => {
  // Extract text content based on file type
  const text = await extractTextFromFile(file);
  console.log("Extracted text from resume:", text.substring(0, 500) + "...");
  
  // Process the text to extract relevant information
  const parsedData = extractResumeData(text);
  console.log("Parsed resume data:", parsedData);
  
  return parsedData;
};

// Extract text from different file types
const extractTextFromFile = async (file: File): Promise<string> => {
  if (file.type === 'application/pdf') {
    return await extractTextFromPDF(file);
  } else if (file.type === 'application/msword' || 
             file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // For DOCX files, we can only get limited content in the browser
    // In a production app, you would use a backend service for better extraction
    return await readFileAsText(file);
  } else {
    // For text files or other formats
    return await readFileAsText(file);
  }
};

// Extract text from PDF using PDF.js
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document using PDF.js
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Iterate through each page to extract text
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + ' ';
    }
    
    return fullText;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    // Fallback to basic text extraction
    return await readFileAsText(file);
  }
};

// Helper function to read file as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    
    reader.readAsText(file);
  });
};

// Extract resume data from text
const extractResumeData = (text: string): ResumeData => {
  // More advanced regex patterns for better information extraction
  // Personal information extraction
  const namePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/;
  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  
  const nameMatch = text.match(namePattern);
  const emailMatch = text.match(emailPattern);
  const phoneMatch = text.match(phonePattern);
  
  // Section detection helpers
  const findSectionBoundaries = (text: string, sectionName: string, nextSections: string[]): string => {
    const sectionRegex = new RegExp(`${sectionName}\\s*(?::|\\n)`, 'i');
    const sectionMatch = sectionRegex.exec(text);
    
    if (!sectionMatch) return '';
    
    const startIndex = sectionMatch.index + sectionMatch[0].length;
    let endIndex = text.length;
    
    for (const nextSection of nextSections) {
      const nextSectionRegex = new RegExp(`${nextSection}\\s*(?::|\\n)`, 'i');
      const nextMatch = nextSectionRegex.exec(text.substring(startIndex));
      
      if (nextMatch) {
        const newEndIndex = startIndex + nextMatch.index;
        if (newEndIndex < endIndex) {
          endIndex = newEndIndex;
        }
      }
    }
    
    return text.substring(startIndex, endIndex).trim();
  };
  
  // Extract education
  const education = extractEducation(text);
  
  // Extract experience
  const experience = extractExperience(text);
  
  // Extract skills
  const skills = extractSkills(text);
  
  // Extract summary
  const summary = extractSummary(text);
  
  return {
    name: nameMatch ? nameMatch[0] : "Unknown Name",
    email: emailMatch ? emailMatch[0] : "unknown@example.com",
    phone: phoneMatch ? phoneMatch[0] : undefined,
    education,
    experience,
    skills,
    summary
  };
};

// Extract education information with improved patterns
const extractEducation = (text: string): Education[] => {
  const education: Education[] = [];
  
  // Find education section
  const educationText = findSectionBoundaries(
    text, 
    'education|academic|qualification', 
    ['experience', 'employment', 'work history', 'skills', 'projects']
  );
  
  if (!educationText) {
    // If no education section was found, attempt to find degree patterns in the entire text
    const degreePatterns = [
      /(?:Bachelor|Master|PhD|Doctorate|BS|BA|MS|MA|MBA|B\.S\.|M\.S\.|B\.A\.|M\.A\.|Ph\.D\.)(?:[^,;\n]*(?:in|of)[^,;\n]*)?/gi,
      /(?:University|College|Institute|School)[^,;\n]*/gi
    ];
    
    let degreeMatches: string[] = [];
    degreePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) degreeMatches = [...degreeMatches, ...matches];
    });
    
    if (degreeMatches.length > 0) {
      // Extract dates (YYYY-YYYY pattern)
      const datePattern = /\b(19|20)\d{2}\s*(?:-|–|to|through|till)\s*(19|20)\d{2}\b/g;
      const dateMatches = text.match(datePattern);
      
      for (let i = 0; i < Math.min(degreeMatches.length, 2); i++) {
        const degreeText = degreeMatches[i].trim();
        const dateMatch = dateMatches && dateMatches[i] ? dateMatches[i].split(/\s*(?:-|–|to|through|till)\s*/) : null;
        
        education.push({
          institution: degreeText.includes("University") || degreeText.includes("College") ? 
            degreeText : "Unknown Institution",
          degree: degreeText.includes("Bachelor") || degreeText.includes("BS") || degreeText.includes("BA") ? 
            "Bachelor's Degree" : 
            degreeText.includes("Master") || degreeText.includes("MS") || degreeText.includes("MA") ? 
            "Master's Degree" : 
            degreeText.includes("PhD") || degreeText.includes("Doctorate") ? 
            "PhD" : "Degree",
          field: degreeText.includes("Computer") ? "Computer Science" : 
                degreeText.includes("Business") ? "Business Administration" : 
                "Not Specified",
          startDate: dateMatch ? dateMatch[0] : "2018",
          endDate: dateMatch ? dateMatch[1] : "2022"
        });
      }
    }
    
    // If still no education was found, add a placeholder
    if (education.length === 0) {
      education.push({
        institution: "Not specified in resume",
        degree: "Not specified in resume",
        field: "Not specified in resume",
        startDate: "",
        endDate: ""
      });
    }
    
    return education;
  }
  
  // Process the education section text
  const educationBlocks = educationText.split(/\n{2,}/);
  
  educationBlocks.forEach(block => {
    // Look for institution
    const institutionMatch = block.match(/(?:University|College|Institute|School)[^,;\n]*/i);
    
    // Look for degree
    const degreeMatch = block.match(/(?:Bachelor|Master|PhD|Doctorate|BS|BA|MS|MA|MBA|B\.S\.|M\.S\.|B\.A\.|M\.A\.|Ph\.D\.)[^,;\n]*/i);
    
    // Look for field of study
    const fieldMatch = block.match(/(?:in|of)\s+([^,;\n]+)/i);
    
    // Look for dates
    const dateMatch = block.match(/\b(19|20)\d{2}\s*(?:-|–|to|through|till)\s*(19|20)\d{2}\b/);
    
    if (institutionMatch || degreeMatch) {
      education.push({
        institution: institutionMatch ? institutionMatch[0].trim() : "Not specified",
        degree: degreeMatch ? degreeMatch[0].trim() : "Not specified",
        field: fieldMatch ? fieldMatch[1].trim() : "Not specified",
        startDate: dateMatch ? dateMatch[1] : "",
        endDate: dateMatch ? dateMatch[2] : ""
      });
    }
  });
  
  // If no education was found, add a placeholder
  if (education.length === 0) {
    education.push({
      institution: "Not specified in resume",
      degree: "Not specified in resume",
      field: "Not specified in resume",
      startDate: "",
      endDate: ""
    });
  }
  
  return education;
};

// Helper function to find section text
const findSectionBoundaries = (text: string, sectionPattern: string, nextSectionPatterns: string[]): string => {
  const sectionRegex = new RegExp(`\\b(?:${sectionPattern})\\b[:\\s]*`, 'i');
  const sectionMatch = sectionRegex.exec(text);
  
  if (!sectionMatch) return '';
  
  const startIndex = sectionMatch.index + sectionMatch[0].length;
  let endIndex = text.length;
  
  for (const nextPattern of nextSectionPatterns) {
    const nextSectionRegex = new RegExp(`\\b(?:${nextPattern})\\b[:\\s]*`, 'i');
    const nextMatch = nextSectionRegex.exec(text.substring(startIndex));
    
    if (nextMatch) {
      const newEndIndex = startIndex + nextMatch.index;
      if (newEndIndex < endIndex) {
        endIndex = newEndIndex;
      }
    }
  }
  
  return text.substring(startIndex, endIndex).trim();
};

// Extract work experience with improved patterns
const extractExperience = (text: string): Experience[] => {
  const experience: Experience[] = [];
  
  // Find experience section
  const experienceText = findSectionBoundaries(
    text, 
    'experience|employment|work history|professional experience', 
    ['education', 'skills', 'projects', 'certifications', 'references']
  );
  
  if (!experienceText) {
    // If no experience section found, look for job titles throughout the document
    const titlePatterns = [
      /(?:Senior|Junior|Lead|Staff|Principal|Developer|Engineer|Manager|Analyst|Designer|Consultant)[^,;\n]*/gi,
      /(?:Director|VP|Chief|Head|President|Coordinator|Supervisor|Administrator)[^,;\n]*/gi
    ];
    
    let titleMatches: string[] = [];
    titlePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) titleMatches = [...titleMatches, ...matches];
    });
    
    // Extract company names (This is simplified; real extraction would be more complex)
    const companyPattern = /(?:at|with|for)\s+([A-Z][A-Za-z0-9\s&.,]+)(?:,|\.|in|\n|from)/g;
    const companyMatches: string[] = [];
    let match;
    while ((match = companyPattern.exec(text)) !== null) {
      companyMatches.push(match[1].trim());
    }
    
    // Create experience entries
    for (let i = 0; i < Math.min(titleMatches.length, 2); i++) {
      experience.push({
        company: i < companyMatches.length ? companyMatches[i] : `Company ${i+1}`,
        title: titleMatches[i].trim(),
        location: "Not specified",
        startDate: "2020",
        endDate: "2023",
        description: ["Details not fully extracted from resume"]
      });
    }
    
    // If still no experience was found, add a placeholder
    if (experience.length === 0) {
      experience.push({
        company: "Not specified in resume",
        title: "Not specified in resume",
        location: "Not specified",
        startDate: "",
        endDate: "",
        description: ["Experience details not found in CV"]
      });
    }
    
    return experience;
  }
  
  // Split experience section into blocks (each likely representing one job)
  const experienceBlocks = experienceText.split(/\n{2,}/);
  
  experienceBlocks.forEach(block => {
    // Skip if block is too short
    if (block.length < 10) return;
    
    // Look for job title
    const titleMatch = block.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*\s*(?:Developer|Engineer|Manager|Director|Analyst|Designer|Consultant|Specialist|Coordinator|Administrator|Officer))/);
    
    // Look for company
    const companyMatch = block.match(/(?:at|with|for)\s+([A-Z][A-Za-z0-9\s&.,]+)(?:,|\.|in|\n|from)/);
    
    // Look for dates
    const dateMatch = block.match(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\s*(?:-|–|to|through|till)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|Present)/i);
    
    // Extract description
    const descLines = block.split('\n').filter(line => 
      line.trim().startsWith('•') || 
      line.trim().startsWith('-') || 
      line.trim().startsWith('*') ||
      /^[A-Z]/.test(line.trim()) && line.includes(' ')
    );
    
    if (titleMatch || companyMatch) {
      experience.push({
        company: companyMatch ? companyMatch[1].trim() : "Not specified",
        title: titleMatch ? titleMatch[0].trim() : "Not specified",
        location: "Not specified",
        startDate: dateMatch ? dateMatch[1] : "",
        endDate: dateMatch ? dateMatch[2] : "",
        description: descLines.length > 0 ? 
          descLines.map(line => line.trim().replace(/^[•\-*]\s*/, '')) : 
          ["Details not fully extracted from resume"]
      });
    }
  });
  
  // If no experience was found, add a placeholder
  if (experience.length === 0) {
    experience.push({
      company: "Not specified in resume",
      title: "Not specified in resume",
      location: "Not specified",
      startDate: "",
      endDate: "",
      description: ["Experience details not found in CV"]
    });
  }
  
  return experience;
};

// Extract skills with improved patterns
const extractSkills = (text: string): Skill[] => {
  const skills: Skill[] = [];
  
  // Common skill keywords to look for
  const skillKeywords = [
    // Programming languages
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "Go", "PHP", "Swift", "Kotlin",
    // Frontend
    "React", "Angular", "Vue", "HTML", "CSS", "SASS", "LESS", "Redux", "Next.js", "Gatsby", 
    // Backend
    "Node.js", "Express", "Django", "Flask", "Spring", "ASP.NET", "Laravel", "Ruby on Rails",
    // Database
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "DynamoDB", "Oracle", "Firebase", "Cassandra", "Redis",
    // DevOps
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "GitLab CI", "GitHub Actions",
    // Version Control
    "Git", "SVN", "Mercurial",
    // Project Management
    "Agile", "Scrum", "Kanban", "JIRA", "Confluence", "Trello", "Asana",
    // Soft Skills
    "Leadership", "Communication", "Teamwork", "Problem Solving", "Critical Thinking"
  ];
  
  // Find skills section
  const skillsText = findSectionBoundaries(
    text, 
    'skills|expertise|proficiencies|competencies', 
    ['experience', 'education', 'projects', 'certifications', 'references']
  );
  
  // If skills section found, extract skills from it
  if (skillsText) {
    // Split by common delimiters
    const listedSkills = skillsText
      .split(/[,•\n\-–|/]+/)
      .map(s => s.trim())
      .filter(s => s.length > 1);
    
    // Map to skill objects
    listedSkills.forEach(skillText => {
      // Look for matching keywords or use the skill text as is
      const matchedKeyword = skillKeywords.find(keyword => 
        skillText.toLowerCase().includes(keyword.toLowerCase()) || 
        keyword.toLowerCase().includes(skillText.toLowerCase())
      );
      
      if (matchedKeyword || skillText.length > 2) {
        skills.push({
          name: matchedKeyword || skillText,
          level: 7, // Default level
          category: categorizeSkill(matchedKeyword || skillText)
        });
      }
    });
  }
  
  // If no skills section or few skills found, scan the entire document for keywords
  if (skills.length < 5) {
    skillKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(text) && !skills.some(s => s.name.toLowerCase() === keyword.toLowerCase())) {
        skills.push({
          name: keyword,
          level: 6, // Default level for skills found in general text
          category: categorizeSkill(keyword)
        });
      }
    });
  }
  
  // If still no skills were found, add placeholders
  if (skills.length === 0) {
    skills.push(
      { name: "Not specified in resume", level: 5, category: "Other" }
    );
  }
  
  // Limit to top 15 skills
  return skills.slice(0, 15);
};

// Categorize skills
const categorizeSkill = (skill: string): string => {
  const skillLower = skill.toLowerCase();
  
  // Programming languages
  if (/javascript|typescript|python|java|c\+\+|c#|ruby|go|php|swift|kotlin|rust|scala|perl|shell|bash/i.test(skillLower)) {
    return "Programming Language";
  }
  
  // Frontend
  if (/react|angular|vue|html|css|sass|less|jquery|bootstrap|tailwind|webpack|babel|frontend|front-end|ui|ux/i.test(skillLower)) {
    return "Frontend";
  }
  
  // Backend
  if (/node\.js|express|django|flask|spring|asp\.net|laravel|ruby on rails|backend|back-end|server|api/i.test(skillLower)) {
    return "Backend";
  }
  
  // Database
  if (/sql|mysql|postgresql|mongodb|dynamodb|oracle|firebase|cassandra|redis|database|db/i.test(skillLower)) {
    return "Database";
  }
  
  // DevOps
  if (/aws|azure|gcp|docker|kubernetes|jenkins|gitlab|github actions|ci\/cd|devops/i.test(skillLower)) {
    return "DevOps";
  }
  
  // Project Management
  if (/agile|scrum|kanban|jira|confluence|trello|asana|project management|product management/i.test(skillLower)) {
    return "Project Management";
  }
  
  // Soft Skills
  if (/leadership|communication|teamwork|problem solving|critical thinking|collaboration|interpersonal/i.test(skillLower)) {
    return "Soft Skills";
  }
  
  return "Other";
};

// Extract summary with improved patterns
const extractSummary = (text: string): string => {
  // Look for summary section
  const summaryText = findSectionBoundaries(
    text, 
    'summary|profile|objective|about|professional summary', 
    ['experience', 'education', 'skills', 'projects', 'certifications']
  );
  
  if (summaryText && summaryText.length > 20) {
    return summaryText;
  }
  
  // If no summary section, look for summary-like text at the beginning
  const firstParagraphs = text.split(/\n{2,}/).slice(0, 2);
  for (const para of firstParagraphs) {
    if (para.length > 50 && para.length < 500 && 
        !/education|experience|skills/i.test(para) &&
        /professional|experienced|skilled|background|expertise/i.test(para)) {
      return para.trim();
    }
  }
  
  return "Professional summary not found in CV";
};

// Resume-Job matching functionality
export const matchResumeToJob = (resume: ResumeData, job: JobPosting): number => {
  // In a real application, this would use AI to compare skills, experience, etc.
  // For simulation, we'll use a simple algorithm
  
  let score = 0;
  const maxScore = 100;
  
  // Check if skills match requirements
  const resumeSkills = resume.skills.map(skill => skill.name.toLowerCase());
  const jobRequirements = job.requirements.map(req => req.toLowerCase());
  
  // Calculate skill match percentage
  let matchedSkills = 0;
  jobRequirements.forEach(req => {
    if (resumeSkills.some(skill => req.includes(skill) || skill.includes(req))) {
      matchedSkills++;
    }
  });
  
  const skillMatchPercentage = jobRequirements.length > 0 
    ? (matchedSkills / jobRequirements.length) * 60 
    : 0;
  
  // Check experience relevance
  const experienceScore = Math.min(resume.experience.length * 10, 30);
  
  // Final score
  score = Math.min(skillMatchPercentage + experienceScore + 10, maxScore);
  
  return Math.round(score);
};

// Analyze resume for improvements
export const analyzeResume = (resume: ResumeData): string[] => {
  const suggestions: string[] = [];
  
  // Check for summary
  if (!resume.summary || resume.summary.length < 50) {
    suggestions.push("Add a more detailed professional summary to highlight your expertise and career goals.");
  }
  
  // Check for skills
  if (resume.skills.length < 5) {
    suggestions.push("Add more skills relevant to your target positions.");
  }
  
  // Check for quantifiable achievements
  let hasQuantifiableResults = false;
  resume.experience.forEach(exp => {
    exp.description.forEach(desc => {
      if (/increased|decreased|improved|reduced|achieved|delivered|generated|saved|[\d]+%/i.test(desc)) {
        hasQuantifiableResults = true;
      }
    });
  });
  
  if (!hasQuantifiableResults) {
    suggestions.push("Add quantifiable achievements to your work experience (e.g., 'Increased sales by 20%').");
  }
  
  // Check for education details
  if (resume.education.length === 0) {
    suggestions.push("Add educational background to strengthen your profile.");
  }
  
  // Check for experience descriptions
  resume.experience.forEach((exp, index) => {
    if (exp.description.length < 2) {
      suggestions.push(`Add more details to your role at ${exp.company}.`);
    }
  });
  
  // If no suggestions, add a positive note
  if (suggestions.length === 0) {
    suggestions.push("Your resume looks well-structured! Consider customizing it for specific job applications.");
  }
  
  return suggestions;
};

// Generate cover letter based on resume and job
export const generateCoverLetter = (resume: ResumeData, job: JobPosting): string => {
  // In a real app, this would use AI to generate a custom cover letter
  // For simulation, we'll use a template
  
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `${today}

Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}. With my background in ${resume.experience[0]?.title || "software development"} and expertise in ${resume.skills.slice(0, 3).map(s => s.name).join(", ")}, I believe I would be a valuable addition to your team.

During my time at ${resume.experience[0]?.company || "my previous company"}, I ${resume.experience[0]?.description[0]?.toLowerCase() || "developed and maintained various software solutions"}. This experience has prepared me well for the challenges of the ${job.title} role.

I am particularly drawn to ${job.company} because of its reputation for ${job.description.includes("innovation") ? "innovation and cutting-edge technology" : "excellence and professional growth opportunities"}. My skills in ${resume.skills.slice(0, 2).map(s => s.name).join(" and ")} align perfectly with your requirements for this role.

I look forward to the opportunity to discuss how my background, skills, and experience would benefit ${job.company}. Thank you for considering my application.

Sincerely,
${resume.name}
${resume.email}
${resume.phone || ""}`;
};

// Identify skill gaps between resume and job requirements
export const analyzeSkillGaps = (resume: ResumeData, job: JobPosting): {
  missingSkills: string[];
  recommendations: { skill: string; course: string; provider: string; }[];
} => {
  const resumeSkills = resume.skills.map(skill => skill.name.toLowerCase());
  const requiredSkills = [...job.requirements, ...(job.preferredSkills || [])].map(skill => skill.toLowerCase());
  
  const missingSkills: string[] = [];
  
  requiredSkills.forEach(reqSkill => {
    // Check if the resume has this skill or something similar
    if (!resumeSkills.some(userSkill => 
      reqSkill.includes(userSkill) || 
      userSkill.includes(reqSkill) ||
      // Handle common variations like "JavaScript"/"JS" or "React"/"React.js"
      (reqSkill.replace('.js', '').replace('js', 'javascript') === userSkill.replace('.js', '').replace('js', 'javascript')))) {
      missingSkills.push(reqSkill);
    }
  });
  
  // Generate course recommendations for missing skills
  const recommendations = missingSkills.map(skill => {
    // In a real app, this would match to an actual course database
    // Simulated course recommendations
    const courseOptions = [
      { provider: "Coursera", course: `Complete ${skill} Masterclass` },
      { provider: "Udemy", course: `${skill} for Professionals` },
      { provider: "LinkedIn Learning", course: `${skill} Essential Training` },
      { provider: "edX", course: `Introduction to ${skill}` },
    ];
    
    const randomIndex = Math.floor(Math.random() * courseOptions.length);
    return {
      skill,
      course: courseOptions[randomIndex].course,
      provider: courseOptions[randomIndex].provider
    };
  });
  
  return {
    missingSkills,
    recommendations
  };
};

// Generate QR code data (in a real app, this would create an actual QR code)
export const generateResumeQRCode = (resume: ResumeData): { url: string; instructions: string } => {
  // In a real implementation, this would generate a QR code linking to an online version of the resume
  // For simulation, we'll return instructions
  
  return {
    url: `https://resumeapp.example/profile/${resume.name.toLowerCase().replace(/\s+/g, '-')}`,
    instructions: "Add this QR code to your printed resume or business card to provide recruiters with instant access to your online profile, portfolio, and contact information."
  };
};

// Sample job postings for testing
export const sampleJobPostings: JobPosting[] = [
  {
    title: "Frontend Developer",
    company: "Tech Innovations Inc.",
    description: "We are looking for a skilled Frontend Developer to join our product team. You will be responsible for building user interfaces for our web applications.",
    requirements: [
      "JavaScript", 
      "React",
      "HTML/CSS",
      "Responsive Design",
      "Git version control"
    ],
    preferredSkills: [
      "TypeScript",
      "Next.js",
      "Unit Testing",
      "UI/UX knowledge"
    ]
  },
  {
    title: "Full Stack Engineer",
    company: "Digital Solutions Ltd.",
    description: "Join our team to develop and maintain web applications across the full stack. You'll work on both frontend and backend components.",
    requirements: [
      "JavaScript",
      "Node.js",
      "React or Angular",
      "RESTful APIs",
      "SQL databases",
      "Git version control"
    ],
    preferredSkills: [
      "TypeScript",
      "Docker",
      "AWS or cloud services",
      "Agile development"
    ]
  },
  {
    title: "Backend Developer",
    company: "Data Systems Corp.",
    description: "We're seeking a Backend Developer to build and optimize our server-side applications and databases.",
    requirements: [
      "Node.js",
      "Express",
      "MongoDB or PostgreSQL",
      "RESTful API design",
      "Authentication and authorization"
    ],
    preferredSkills: [
      "GraphQL",
      "Redis",
      "Microservices architecture",
      "CI/CD pipelines"
    ]
  }
];
