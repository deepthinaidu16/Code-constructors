
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, FileArchive, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { parseResume } from '@/utils/resumeAnalysis';
import { Progress } from '@/components/ui/progress';

interface CVUploaderProps {
  onUploadSuccess: (cv: any) => void;
}

const CVUploader = ({ onUploadSuccess }: CVUploaderProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Set up drop zone event listeners
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('border-primary');
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('border-primary');
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('border-primary');
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (validateResumeFile(file)) {
          handleUpload(file);
        }
      }
    };

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, []);

  const validateResumeFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive",
      });
      return false;
    }
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (validateResumeFile(file)) {
      handleUpload(file);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') return <FileArchive className="h-6 w-6 text-red-500" />;
    if (fileType.includes('word')) return <FileText className="h-6 w-6 text-blue-500" />;
    if (fileType === 'text/plain') return <FileCode className="h-6 w-6 text-gray-500" />;
    return <FileText className="h-6 w-6 text-muted-foreground" />;
  };

  const handleUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload your CV.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setProcessingStep("Preparing file");
    
    try {
      // Start the upload process
      setProcessingStep("Analyzing CV content");
      setUploadProgress(20);
      
      toast({
        title: "Processing CV",
        description: "Extracting information from your CV...",
      });
      
      // Parse the CV first to extract real data from the file
      const parsedData = await parseResume(file);
      
      setProcessingStep("Extracting data");
      setUploadProgress(60);
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      setProcessingStep("Uploading file");
      setUploadProgress(80);
      
      const { error: uploadError } = await supabase.storage
        .from('cv_files')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Create a record in the user_cvs table
      setProcessingStep("Saving to database");
      setUploadProgress(90);
      
      // Cast the parsed data to a plain object to ensure compatibility with Json type
      const { data: cvRecord, error: dbError } = await supabase
        .from('user_cvs')
        .insert({
          user_id: user.id,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          parsed_data: parsedData as unknown as Record<string, any>,
          is_active: true
        })
        .select()
        .single();
      
      if (dbError) throw dbError;
      
      setUploadProgress(100);
      setProcessingStep("Complete");
      
      toast({
        title: "CV Uploaded Successfully",
        description: "Your CV has been processed and saved.",
      });
      
      // Call the success callback with the new CV record
      onUploadSuccess(cvRecord);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error processing your CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProcessingStep(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="p-4 pb-2">
        <CardTitle>Upload Your CV</CardTitle>
        <CardDescription>
          Upload your CV to get AI-powered analysis and improvement suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isUploading ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h3 className="font-medium mb-2">{processingStep}</h3>
              <Progress value={uploadProgress} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">Please wait while we process your CV...</p>
            </div>
          </div>
        ) : (
          <div 
            ref={dropZoneRef}
            className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center transition-colors"
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Drag & drop your CV here</h3>
              <p className="text-sm text-muted-foreground">
                Support for PDF, DOCX, TXT (Max 5MB)
              </p>
            </div>
            <div className="mt-4">
              <label htmlFor="cv-upload">
                <input
                  id="cv-upload"
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <Button
                  variant="default"
                  className="mt-2"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? "Processing..." : "Select File"}
                </Button>
              </label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CVUploader;
