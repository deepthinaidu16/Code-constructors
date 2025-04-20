
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, Copy, Download, RefreshCw, Check } from 'lucide-react';
import { generateCoverLetterWithAI } from '@/utils/aiIntegration';
import { sampleJobPostings } from '@/utils/resumeAnalysis';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ResumeData } from '@/utils/resumeTypes';

interface CoverLetterGeneratorProps {
  resumeData: ResumeData | null;
}

const CoverLetterGenerator = ({ resumeData }: CoverLetterGeneratorProps) => {
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!resumeData) {
      toast({
        title: "No resume data",
        description: "Please upload a resume first to generate a cover letter",
        variant: "destructive"
      });
      return;
    }

    if (!selectedJob) {
      toast({
        title: "No job selected",
        description: "Please select a job position first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const jobIndex = parseInt(selectedJob);
      // Use AI-powered cover letter generation
      const letter = await generateCoverLetterWithAI(resumeData, sampleJobPostings[jobIndex]);
      setCoverLetter(letter);
      
      toast({
        title: "Cover letter generated",
        description: "Your AI-personalized cover letter is ready to use"
      });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your cover letter",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Your cover letter has been copied to your clipboard"
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Cover_Letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your cover letter is being downloaded"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PenTool className="mr-2 h-5 w-5" />
          AI Cover Letter Generator
        </CardTitle>
        <CardDescription>
          Create AI-personalized cover letters for job applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Job Position</label>
          <Select
            value={selectedJob}
            onValueChange={setSelectedJob}
            disabled={isGenerating}
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
        
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !selectedJob || !resumeData}
          className="w-full"
        >
          {isGenerating ? "AI is generating..." : "Generate AI Cover Letter"}
        </Button>
        
        {coverLetter && (
          <div className="space-y-4 mt-4">
            <Textarea 
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Your cover letter will appear here..."
            />
            <div className="flex space-x-2">
              <Button onClick={handleCopy} className="flex-1" variant="outline">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button onClick={handleDownload} className="flex-1" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button 
                onClick={handleGenerate} 
                className="flex-1" 
                variant="outline"
                disabled={isGenerating}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </div>
        )}

        {!resumeData && (
          <p className="text-sm text-muted-foreground text-center">
            Upload a resume first to generate a cover letter
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CoverLetterGenerator;
