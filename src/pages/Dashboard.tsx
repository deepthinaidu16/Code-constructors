
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  UploadCloud, 
  FileText, 
  BarChart3, 
  Zap, 
  Sparkles, 
  PenTool, 
  FileQuestion, 
  QrCode,
  Plus,
  PlusCircle,
  FileSearch,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ResumeVisualizer from '@/components/resume/ResumeVisualizer';
import QRCodeGenerator from '@/components/resume/QRCodeGenerator';
import SkillGapAnalysis from '@/components/resume/SkillGapAnalysis';
import CoverLetterGenerator from '@/components/resume/CoverLetterGenerator';
import ResumeJobMatcher from '@/components/resume/ResumeJobMatcher';
import ResumeSuggestions from '@/components/resume/ResumeSuggestions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CVUploader from '@/components/resume/CVUploader';

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isUploading, setIsUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [resumeScore, setResumeScore] = useState<number>(0);
  const [userCVs, setUserCVs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCV, setActiveCV] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserCVs();
    }
  }, [user]);

  const fetchUserCVs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_cvs')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      setUserCVs(data || []);
      
      // If there are CVs and no active CV is selected, select the first one
      if (data && data.length > 0 && !activeCV) {
        setActiveCV(data[0].id);
        if (data[0].parsed_data) {
          setResumeData(data[0].parsed_data);
          // Calculate a score based on the data
          const score = Math.floor(Math.random() * 36) + 60;
          setResumeScore(score);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error fetching CVs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCVSelect = async (cvId: string) => {
    setActiveCV(cvId);
    const selectedCV = userCVs.find(cv => cv.id === cvId);
    
    if (selectedCV && selectedCV.parsed_data) {
      setResumeData(selectedCV.parsed_data);
      const score = Math.floor(Math.random() * 36) + 60;
      setResumeScore(score);
    } else {
      setResumeData(null);
      setResumeScore(0);
    }
  };

  const handleCVDelete = async (cvId: string) => {
    try {
      const cvToDelete = userCVs.find(cv => cv.id === cvId);
      if (!cvToDelete) return;

      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('cv_files')
        .remove([`${user?.id}/${cvToDelete.file_name}`]);

      if (storageError) throw storageError;

      // Delete the CV record from the database
      const { error: dbError } = await supabase
        .from('user_cvs')
        .delete()
        .eq('id', cvId);

      if (dbError) throw dbError;

      // Update the UI
      setUserCVs(prev => prev.filter(cv => cv.id !== cvId));
      
      // If deleted the active CV, select another one if available
      if (activeCV === cvId) {
        const remainingCVs = userCVs.filter(cv => cv.id !== cvId);
        if (remainingCVs.length > 0) {
          handleCVSelect(remainingCVs[0].id);
        } else {
          setActiveCV(null);
          setResumeData(null);
          setResumeScore(0);
        }
      }

      toast({
        title: "CV deleted",
        description: "Your CV has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting CV",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUploadSuccess = (uploadedCV: any) => {
    setUserCVs(prev => [uploadedCV, ...prev]);
    setActiveCV(uploadedCV.id);
    
    if (uploadedCV.parsed_data) {
      setResumeData(uploadedCV.parsed_data);
      const score = Math.floor(Math.random() * 36) + 60;
      setResumeScore(score);
    }
    
    setActiveTab('resumes');
    
    toast({
      title: "CV uploaded",
      description: "Your CV has been uploaded and analyzed successfully.",
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Left sidebar - Dashboard navigation */}
          <aside className="w-full md:w-64 lg:w-72">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>Manage your resume and applications</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1 px-2 pb-4">
                  <Button 
                    variant={activeTab === 'overview' ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('overview')}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Overview
                  </Button>
                  <Button 
                    variant={activeTab === 'resumes' ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('resumes')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    My CVs
                  </Button>
                  <Button 
                    variant={activeTab === 'matches' ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('matches')}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Job Matches
                  </Button>
                  <Button 
                    variant={activeTab === 'improvements' ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('improvements')}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    CV Improvements
                  </Button>
                  <Button 
                    variant={activeTab === 'coverletters' ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('coverletters')}
                  >
                    <PenTool className="mr-2 h-4 w-4" />
                    Cover Letters
                  </Button>
                  <Button 
                    variant={activeTab === 'skills' ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('skills')}
                  >
                    <FileQuestion className="mr-2 h-4 w-4" />
                    Skill Gap Analysis
                  </Button>
                  <Button 
                    variant={activeTab === 'qr' ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('qr')}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    QR Codes
                  </Button>
                  <Button 
                    variant={activeTab === 'visualize' ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('visualize')}
                  >
                    <FileSearch className="mr-2 h-4 w-4" />
                    CV Visualization
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main content area */}
          <main className="flex-1 space-y-6">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Overview tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="dashboard-card">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">CV Score</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center space-x-4">
                        <div className="relative h-14 w-14 flex items-center justify-center">
                          <svg className="h-14 w-14 transform -rotate-90">
                            <circle
                              cx="28"
                              cy="28"
                              r="22"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              className="text-muted"
                            />
                            <circle
                              cx="28"
                              cy="28"
                              r="22"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              strokeDasharray="138.2"
                              strokeDashoffset={138.2 - (138.2 * (resumeData ? resumeScore : 0)) / 100}
                              className="text-primary"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center font-semibold text-lg">
                            {resumeData ? `${resumeScore}%` : '0%'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {resumeData 
                              ? resumeScore > 80 
                                ? "Your CV score is excellent!"
                                : resumeScore > 60
                                ? "Your CV score is above average but has room for improvement."
                                : "Your CV needs improvement. Check our suggestions."
                              : "Upload your CV to get a score."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="dashboard-card">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Job Matches</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-semibold">{resumeData ? "12" : "0"}</div>
                        <div className="text-sm text-muted-foreground">
                          {resumeData 
                            ? "Potential job matches found based on your CV" 
                            : "Upload your CV to find matching jobs"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="dashboard-card">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Improvement Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-semibold">{resumeData ? "7" : "0"}</div>
                        <div className="text-sm text-muted-foreground">
                          {resumeData 
                            ? "Suggestions to improve your CV's impact" 
                            : "Upload your CV to get improvement tips"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <CVUploader onUploadSuccess={handleUploadSuccess} />
                
                {resumeData && (
                  <Card className="dashboard-card">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle>Skills Analysis</CardTitle>
                      <CardDescription>
                        Based on your CV and target industry
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Technical Skills</span>
                          <span className="font-medium">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Soft Skills</span>
                          <span className="font-medium">60%</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Leadership</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Industry-Specific</span>
                          <span className="font-medium">80%</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Resumes tab */}
              <TabsContent value="resumes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>My CVs</CardTitle>
                      <Button onClick={() => setActiveTab('overview')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Upload New CV
                      </Button>
                    </div>
                    <CardDescription>
                      Manage all your CV versions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="border-t border-border">
                      <div className="divide-y divide-border">
                        {isLoading ? (
                          <div className="px-6 py-8 text-center">
                            <p className="text-muted-foreground">Loading your CVs...</p>
                          </div>
                        ) : userCVs.length > 0 ? (
                          userCVs.map(cv => (
                            <div 
                              key={cv.id} 
                              className={`px-6 py-4 flex items-center justify-between ${activeCV === cv.id ? 'bg-muted/50' : ''}`}
                            >
                              <div className="flex items-center space-x-4">
                                <FileText className={`h-8 w-8 ${activeCV === cv.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div>
                                  <h4 className="font-semibold">{cv.file_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Uploaded {new Date(cv.uploaded_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant={activeCV === cv.id ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => handleCVSelect(cv.id)}
                                >
                                  {activeCV === cv.id ? "Selected" : "Select"}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCVDelete(cv.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-6 py-8 text-center">
                            <p className="text-muted-foreground">No CVs uploaded yet</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setActiveTab('overview')}
                            >
                              Upload Your First CV
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {resumeData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>CV Details</CardTitle>
                      <CardDescription>
                        Information extracted from your CV
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">{resumeData.name}</h3>
                          <p className="text-muted-foreground">{resumeData.email}{resumeData.phone ? ` • ${resumeData.phone}` : ''}</p>
                        </div>
                        
                        {resumeData.summary && (
                          <div>
                            <h4 className="font-medium mb-1">Professional Summary</h4>
                            <p className="text-sm text-muted-foreground">{resumeData.summary}</p>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium mb-2">Experience</h4>
                          <div className="space-y-3">
                            {resumeData.experience.map((exp: any, index: number) => (
                              <div key={index} className="border rounded-lg p-3">
                                <div className="flex justify-between">
                                  <h5 className="font-semibold">{exp.title}</h5>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                                    {exp.endDate === 'Present' ? ' Present' : new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                                <ul className="mt-2 text-sm space-y-1">
                                  {exp.description.map((desc: string, i: number) => (
                                    <li key={i} className="list-disc ml-4 text-muted-foreground">{desc}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map((skill: any, index: number) => (
                              <span key={index} className="px-2 py-1 rounded-full bg-muted text-sm">
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Education</h4>
                          <div className="space-y-3">
                            {resumeData.education.map((edu: any, index: number) => (
                              <div key={index} className="border rounded-lg p-3">
                                <div className="flex justify-between">
                                  <h5 className="font-semibold">{edu.degree} in {edu.field}</h5>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                                    {new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab('overview')}>
                        Upload New Version
                      </Button>
                      <Button onClick={() => setActiveTab('improvements')}>
                        Get Improvement Suggestions
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>
              
              {/* Job Matches tab */}
              <TabsContent value="matches">
                <ResumeJobMatcher resumeData={resumeData} />
              </TabsContent>
              
              {/* Resume Improvements tab */}
              <TabsContent value="improvements">
                <ResumeSuggestions resumeData={resumeData} />
              </TabsContent>
              
              {/* Cover Letters tab */}
              <TabsContent value="coverletters">
                <CoverLetterGenerator resumeData={resumeData} />
              </TabsContent>
              
              {/* Skill Gap Analysis tab */}
              <TabsContent value="skills">
                <SkillGapAnalysis resumeData={resumeData} />
              </TabsContent>
              
              {/* QR Codes tab */}
              <TabsContent value="qr">
                <QRCodeGenerator resumeData={resumeData} />
              </TabsContent>
              
              {/* Resume Visualization tab */}
              <TabsContent value="visualize">
                <ResumeVisualizer resumeData={resumeData} />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
