
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Award, FileSearch, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { analyzeSkillGaps, sampleJobPostings } from '@/utils/resumeAnalysis';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface SkillGapAnalysisProps {
  resumeData: any;
}

const SkillGapAnalysis = ({ resumeData }: SkillGapAnalysisProps) => {
  const [selectedJob, setSelectedJob] = useState('0');
  const [analysis, setAnalysis] = useState<{
    missingSkills: string[];
    recommendations: { skill: string; course: string; provider: string; }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (resumeData && selectedJob) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const jobIndex = parseInt(selectedJob);
        const result = analyzeSkillGaps(resumeData, sampleJobPostings[jobIndex]);
        setAnalysis(result);
        setIsLoading(false);
      }, 1500);
    }
  }, [resumeData, selectedJob]);

  if (!resumeData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Gap Analysis</CardTitle>
          <CardDescription>Upload a resume to analyze skill gaps</CardDescription>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center">
          <p className="text-muted-foreground">No resume data available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate match percentage
  const calculateMatchPercentage = () => {
    if (!analysis) return 0;
    const jobRequirements = sampleJobPostings[parseInt(selectedJob)].requirements.length;
    const missingCount = analysis.missingSkills.length;
    return Math.round(((jobRequirements - missingCount) / jobRequirements) * 100);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSearch className="mr-2 h-5 w-5" />
          Skill Gap Analysis
        </CardTitle>
        <CardDescription>
          Compare your skills to job requirements and find learning opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Job Position</label>
          <Select
            value={selectedJob}
            onValueChange={setSelectedJob}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a job position" />
            </SelectTrigger>
            <SelectContent>
              {sampleJobPostings.map((job, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {job.title} at {job.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="py-8 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-primary/70 animate-pulse" />
            <p>Analyzing skill gaps...</p>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Skills Match</h3>
                <span className="text-sm font-medium">{calculateMatchPercentage()}%</span>
              </div>
              <Progress value={calculateMatchPercentage()} className="h-2" />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Skills to Develop</h3>
              {analysis.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-muted">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Great job! Your skills align well with this position.
                </p>
              )}
            </div>

            {analysis.recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Recommended Courses</h3>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm">{rec.course}</h4>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Award className="h-3 w-3 mr-1" />
                            {rec.provider}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center">
                        <Badge variant="secondary" className="text-xs">
                          {rec.skill}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Select a job position to see skill gap analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillGapAnalysis;
