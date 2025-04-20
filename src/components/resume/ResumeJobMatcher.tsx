
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ArrowUpRight, ThumbsUp, ThumbsDown, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchJobPostings } from '@/utils/jobService';
import { matchResumeToJob } from '@/utils/resumeAnalysis';
import { JobPosting } from '@/utils/resumeTypes';

interface ResumeJobMatcherProps {
  resumeData: any;
}

const ResumeJobMatcher = ({ resumeData }: ResumeJobMatcherProps) => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<{
    job: JobPosting;
    score: number;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  useEffect(() => {
    if (resumeData) {
      handleFindMatches();
    }
  }, [resumeData]);

  const handleFindMatches = async () => {
    if (!resumeData) return;
    
    setIsLoading(true);
    try {
      const jobs = await fetchJobPostings();
      
      const results = jobs.map(job => ({
        job,
        score: matchResumeToJob(resumeData, job)
      }));
      
      // Sort by score (highest first)
      results.sort((a, b) => b.score - a.score);
      
      setMatches(results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch job matches. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Strong Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Potential Match";
    return "Low Match";
  };

  if (!resumeData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Matches</CardTitle>
          <CardDescription>Upload a resume to find matching jobs</CardDescription>
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
          <Zap className="mr-2 h-5 w-5" />
          Job Matches
        </CardTitle>
        <CardDescription>
          Find jobs that match your resume profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {matches.length} jobs analyzed
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleFindMatches}
            disabled={isLoading}
          >
            {isLoading ? "Analyzing..." : "Refresh Matches"}
          </Button>
        </div>
        
        {isLoading ? (
          <div className="py-12 text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-primary/70 animate-pulse" />
            <p>Analyzing job matches...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`h-1 ${getMatchColor(match.score)}`}></div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{match.job.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {match.job.company}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{match.score}%</div>
                      <Badge variant="outline" className={`${match.score >= 70 ? 'text-green-600 border-green-600/30' : match.score >= 50 ? 'text-yellow-600 border-yellow-600/30' : 'text-red-600 border-red-600/30'}`}>
                        {getScoreLabel(match.score)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Progress value={match.score} className="h-2" />
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="h-8">
                        <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                        Relevant
                      </Button>
                      <Button size="sm" variant="outline" className="h-8">
                        <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                        Not for me
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      className="h-8"
                      onClick={() => setSelectedJob(match.job)}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedJob?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Company</h4>
                <p>{selectedJob?.company}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Description</h4>
                <p className="whitespace-pre-wrap">{selectedJob?.description}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Requirements</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedJob?.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              {selectedJob?.preferredSkills && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Preferred Skills</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedJob.preferredSkills.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ResumeJobMatcher;
