
export interface ResumeData {
  name: string;
  email: string;
  phone?: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  summary?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Experience {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Skill {
  name: string;
  level?: number;
  category?: string;
}

export interface JobPosting {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  preferredSkills?: string[];
}
