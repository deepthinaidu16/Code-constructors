
import { 
  FileText, 
  Sparkles, 
  Zap, 
  BarChart3, 
  Check, 
  Award, 
  Scale, 
  FileSearch,
  FileOutput, 
  QrCode, 
  GraduationCap, 
  Eye 
} from 'lucide-react';
import { FeatureCard } from '@/components/ui/feature-card';

const FeaturesSection = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Resume Parsing & Upload",
      description: "Upload your resume and our AI system automatically extracts and organizes your information for further optimization."
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Smart Resume Suggestions",
      description: "Receive personalized AI recommendations to improve your resume based on current job market trends and requirements."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Resume-Job Matching",
      description: "Our AI engine evaluates your resume against job postings to generate match scores and assess your suitability."
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "AI Resume Grading",
      description: "Get comprehensive evaluations of your resume's relevance, clarity, and quality with actionable improvement suggestions."
    },
    {
      icon: <Scale className="h-8 w-8" />,
      title: "Real-Time Resume Comparison",
      description: "Compare multiple resumes side-by-side to identify key differences and determine the most suitable candidates."
    },
    {
      icon: <FileOutput className="h-8 w-8" />,
      title: "Instant Cover Letter Generator",
      description: "Generate customized cover letters based on your resume and targeted job positions with our AI engine."
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: "Skill Gap Analysis",
      description: "Identify skill gaps between your resume and job requirements, with recommended courses to enhance your qualifications."
    },
    {
      icon: <QrCode className="h-8 w-8" />,
      title: "QR Code Integration",
      description: "Generate QR codes for your resume to provide recruiters with easy access to your full professional profile."
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Dynamic Resume Visualization",
      description: "Present your resume with interactive visualizations that make your experience and skills more engaging and accessible."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive AI Resume Tools
          </h2>
          <p className="text-xl text-muted-foreground">
            Our platform offers a complete suite of AI-powered tools to optimize your resume, 
            match with perfect jobs, and accelerate your career growth.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
