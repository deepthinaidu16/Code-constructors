
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Briefcase, GraduationCap, Award, Box } from 'lucide-react';

interface ResumeVisualizerProps {
  resumeData: any; // In a real app, we would use a proper type for the resume data
}

const ResumeVisualizer = ({ resumeData }: ResumeVisualizerProps) => {
  const [activeTab, setActiveTab] = useState("profile");

  if (!resumeData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resume Visualization</CardTitle>
          <CardDescription>Upload a resume to see the visualization</CardDescription>
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
        <CardTitle>Interactive Resume Visualization</CardTitle>
        <CardDescription>Explore your resume in a dynamic format</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-4">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-full flex items-center justify-center text-2xl text-primary font-bold">
                {resumeData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-bold">{resumeData.name}</h3>
                <p className="text-muted-foreground">{resumeData.experience[0]?.title || "Professional"}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {resumeData.email}
                  </Badge>
                  {resumeData.phone && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {resumeData.phone}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {resumeData.summary && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Professional Summary</h4>
                <p className="text-sm text-muted-foreground">{resumeData.summary}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="experience" className="space-y-4">
            <div className="space-y-4">
              {resumeData.experience.map((exp: any, index: number) => (
                <Card key={index} className="relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <Briefcase className="h-5 w-5 mr-2 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold">{exp.title}</h4>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="font-medium">{exp.company}</span>
                          {exp.location && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{exp.location}</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                          {exp.endDate === 'Present' ? ' Present' : new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        </div>
                        <ul className="mt-2 text-sm space-y-1">
                          {exp.description.map((desc: string, i: number) => (
                            <li key={i} className="list-disc ml-4 text-muted-foreground">{desc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="skills" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumeData.skills.reduce((groups: any, skill: any) => {
                const category = skill.category || "Other";
                if (!groups[category]) {
                  groups[category] = [];
                }
                groups[category].push(skill);
                return groups;
              }, {})
              // Convert groups object to array of [category, skills] pairs
              && Object.entries(resumeData.skills.reduce((groups: any, skill: any) => {
                const category = skill.category || "Other";
                if (!groups[category]) {
                  groups[category] = [];
                }
                groups[category].push(skill);
                return groups;
              }, {})).map(([category, skills]: [string, any]) => (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(skills as any[]).map((skill: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{skill.name}</span>
                          {skill.level && <span className="text-muted-foreground">{skill.level}/10</span>}
                        </div>
                        {skill.level && <Progress value={skill.level * 10} className="h-2" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="education" className="space-y-4">
            <div className="space-y-4">
              {resumeData.education.map((edu: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <GraduationCap className="h-5 w-5 mr-2 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold">{edu.degree} in {edu.field}</h4>
                        <div className="text-sm text-muted-foreground">
                          {edu.institution}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                          {new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResumeVisualizer;
