
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Zap, Upload } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Gradient background with pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 -z-10" />
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,transparent,black)] -z-10" />

      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="gradient-heading">AI-Powered</span> Resume 
              <br />Optimization & Matching
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Transform your career with advanced AI tools that optimize your resume, 
              match you with ideal jobs, and provide actionable insights to help you 
              stand out from the competition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="group"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/features')}
              >
                Explore Features
              </Button>
            </div>
            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <span>AI Resume Analysis</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-primary" />
                <span>Instant Matching</span>
              </div>
              <div className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-primary" />
                <span>One-Click Apply</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-border">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-4 text-sm text-muted-foreground">resume.pdf - AI Analysis</div>
              </div>
              <div className="space-y-3">
                <div className="h-10 bg-primary/10 rounded-md animate-pulse-slow"></div>
                <div className="h-24 bg-muted rounded-md"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-24 bg-primary/20 rounded-md"></div>
                  <div className="h-6 w-16 bg-secondary/20 rounded-md"></div>
                  <div className="h-6 w-20 bg-accent/20 rounded-md"></div>
                </div>
                <div className="h-32 bg-muted rounded-md"></div>
                <div className="h-8 w-full bg-primary/10 rounded-md"></div>
                <div className="flex justify-between">
                  <div className="h-10 w-36 bg-secondary rounded-md"></div>
                  <div className="h-10 w-36 bg-primary rounded-md"></div>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl transform translate-x-5 translate-y-5 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
