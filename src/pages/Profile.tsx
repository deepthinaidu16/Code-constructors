
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const profileFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userCVs, setUserCVs] = useState<any[]>([]);
  const [isLoadingCVs, setIsLoadingCVs] = useState(true);
  const [showCVDetails, setShowCVDetails] = useState(false);
  const [selectedCV, setSelectedCV] = useState<any>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserCVs();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      form.reset({
        full_name: data?.full_name || "",
        email: user?.email || "",
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserCVs = async () => {
    setIsLoadingCVs(true);
    try {
      const { data, error } = await supabase
        .from('user_cvs')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setUserCVs(data || []);
    } catch (error: any) {
      console.error('Error fetching CVs:', error);
    } finally {
      setIsLoadingCVs(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: data.full_name })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      setProfile(prev => ({
        ...prev,
        full_name: data.full_name
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCV = (cv: any) => {
    setSelectedCV(cv);
    setShowCVDetails(true);
  };

  const handleDeleteCV = async (cvId: string) => {
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

  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Settings */}
          <div className="md:col-span-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground mt-2">
                Manage your account settings and uploaded documents.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Account</div>
              <nav className="flex flex-col space-y-1">
                <Button variant="ghost" className="justify-start">
                  Profile Information
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => window.location.href = '/dashboard'}>
                  CV Management
                </Button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              disabled
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your CVs</CardTitle>
                <CardDescription>
                  All your uploaded CVs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCVs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading your CVs...</span>
                  </div>
                ) : userCVs.length > 0 ? (
                  <div className="space-y-4">
                    {userCVs.map(cv => (
                      <div key={cv.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-6 w-6 text-primary" />
                          <div>
                            <p className="font-medium">{cv.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded on {new Date(cv.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewCV(cv)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteCV(cv.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No CVs uploaded yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.location.href = '/dashboard'}
                    >
                      Upload Your First CV
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CV Details Sheet */}
      <Sheet open={showCVDetails} onOpenChange={setShowCVDetails}>
        <SheetContent className="w-full md:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>CV Details</SheetTitle>
            <SheetDescription>
              {selectedCV?.file_name}
            </SheetDescription>
          </SheetHeader>
          
          {selectedCV?.parsed_data && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold">{selectedCV.parsed_data.name}</h3>
                <p className="text-muted-foreground">
                  {selectedCV.parsed_data.email}
                  {selectedCV.parsed_data.phone ? ` • ${selectedCV.parsed_data.phone}` : ''}
                </p>
              </div>
              
              {selectedCV.parsed_data.summary && (
                <div>
                  <h4 className="font-medium mb-1">Professional Summary</h4>
                  <p className="text-sm text-muted-foreground">{selectedCV.parsed_data.summary}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2">Experience</h4>
                <div className="space-y-3">
                  {selectedCV.parsed_data.experience?.map((exp: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between flex-wrap">
                        <h5 className="font-semibold">{exp.title}</h5>
                        <span className="text-sm text-muted-foreground">
                          {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                          {exp.endDate === 'Present' ? ' Present' : new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {exp.company}{exp.location ? `, ${exp.location}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCV.parsed_data.skills?.map((skill: any, index: number) => (
                    <span key={index} className="px-2 py-1 rounded-full bg-muted text-sm">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <Button className="w-full mt-4" onClick={() => window.location.href = '/dashboard'}>
                Manage in Dashboard
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
};

export default Profile;
