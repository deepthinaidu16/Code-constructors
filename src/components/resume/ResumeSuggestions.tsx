
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { analyzeResumeWithAI } from '@/utils/aiIntegration';
import { Progress } from '@/components/ui/progress';
import { ResumeData } from '@/utils/resumeTypes';
import { useToast } from '@/hooks/use-toast';

interface ResumeSuggestionsProps {
  resumeData: ResumeData | null;
}

const ResumeSuggestions = ({ resumeData }: ResumeSuggestionsProps) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [implemented, setImplemented] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (resumeData) {
      handleAnalyze();
    }
  }, [resumeData]);

  const handleAnalyze = async () => {
    if (!resumeData) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use AI-powered analysis
      const results = await analyzeResumeWithAI(resumeData);
      
      if (results.length === 0) {
        throw new Error("No suggestions returned from AI");
      }
      
      setSuggestions(results);
      setImplemented({});
      
      toast({
        title: "Analysis complete",
        description: "AI has analyzed your resume and provided suggestions",
      });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setError("There was an error analyzing your resume. Please try again later.");
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "There was an error analyzing your resume",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleImplemented = (index: number) => {
    setImplemented(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const calculateScore = () => {
    if (!resumeData || suggestions.length === 0) return 0;
    
    // Basic score formula - more suggestions means lower score
    const baseScore = 85;
    const penalty = Math.min(suggestions.length * 5, 30);
    const implementationBonus = Object.values(implemented).filter(Boolean).length * 3;
    
    return Math.max(Math.min(baseScore - penalty + implementationBonus, 100), 40);
  };

  if (!resumeData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resume Suggestions</CardTitle>
          <CardDescription>Upload a resume to get AI-powered improvement suggestions</CardDescription>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center">
          <p className="text-muted-foreground">No resume data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="mr-2 h-5 w-5" />
          AI Resume Suggestions
        </CardTitle>
        <CardDescription>
          Advanced AI recommendations to improve your resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length > 0 && !isLoading && !error && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Resume Score</h3>
                <span className="text-sm font-medium">{calculateScore()}%</span>
              </div>
              <Progress value={calculateScore()} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Implement these AI suggestions to improve your score
              </p>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {error ? "Error in analysis" : `${suggestions.length} AI-powered improvement suggestions`}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAnalyze}
            disabled={isLoading}
          >
            {isLoading ? "Analyzing..." : "Refresh Analysis"}
          </Button>
        </div>
        
        {isLoading ? (
          <div className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/70 animate-pulse" />
            <p>AI is analyzing your resume...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-4 text-destructive/70" />
            <p className="text-destructive font-medium mb-2">{error}</p>
            <p className="text-muted-foreground text-sm mb-4">Our AI assistant encountered an issue while analyzing your resume.</p>
            <Button onClick={handleAnalyze} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border flex items-start gap-3 ${
                  implemented[index] ? 'bg-primary/5 border-primary/20' : ''
                }`}
              >
                {implemented[index] ? (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={implemented[index] ? 'line-through opacity-70' : ''}>
                    {suggestion}
                  </p>
                </div>
                <Button 
                  variant={implemented[index] ? "outline" : "default"} 
                  size="sm"
                  onClick={() => toggleImplemented(index)}
                >
                  {implemented[index] ? "Undo" : "Implement"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeSuggestions;
