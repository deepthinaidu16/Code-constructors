
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Download, Copy, Share2 } from 'lucide-react';
import { generateResumeQRCode } from '@/utils/resumeAnalysis';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  resumeData: any;
}

const QRCodeGenerator = ({ resumeData }: QRCodeGeneratorProps) => {
  const { toast } = useToast();
  const [qrData, setQrData] = useState<{ url: string; instructions: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrOptions, setQrOptions] = useState({
    includeContact: true,
    includePortfolio: true,
    includeSocial: false
  });

  const handleGenerate = () => {
    if (!resumeData) {
      toast({
        title: "No resume data",
        description: "Please upload a resume first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    // Simulate API call delay
    setTimeout(() => {
      const generatedData = generateResumeQRCode(resumeData);
      setQrData(generatedData);
      setIsGenerating(false);
      
      toast({
        title: "QR Code generated",
        description: "Your resume QR code has been created successfully."
      });
    }, 1500);
  };

  const handleCopyLink = () => {
    if (qrData?.url) {
      navigator.clipboard.writeText(qrData.url);
      toast({
        title: "Link copied",
        description: "The resume link has been copied to your clipboard."
      });
    }
  };

  const handleOptionChange = (option: keyof typeof qrOptions) => {
    setQrOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="mr-2 h-5 w-5" />
          Resume QR Code Generator
        </CardTitle>
        <CardDescription>
          Create a QR code for your resume that employers can scan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrData ? (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>QR Code Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="includeContact" 
                      checked={qrOptions.includeContact}
                      onChange={() => handleOptionChange('includeContact')}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="includeContact" className="cursor-pointer">Include contact information</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="includePortfolio" 
                      checked={qrOptions.includePortfolio}
                      onChange={() => handleOptionChange('includePortfolio')}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="includePortfolio" className="cursor-pointer">Include portfolio links</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="includeSocial" 
                      checked={qrOptions.includeSocial}
                      onChange={() => handleOptionChange('includeSocial')}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="includeSocial" className="cursor-pointer">Include social profiles</Label>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleGenerate} 
                className="w-full"
                disabled={isGenerating || !resumeData}
              >
                {isGenerating ? "Generating..." : "Generate QR Code"}
              </Button>
              
              {!resumeData && (
                <p className="text-sm text-muted-foreground text-center">
                  Upload a resume first to generate a QR code
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center">
              {/* In a real implementation, this would be an actual QR code image */}
              <div className="w-48 h-48 bg-muted flex items-center justify-center relative">
                <QrCode className="h-32 w-32 text-primary opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-background rounded-full p-2">
                    <span className="text-xl font-bold text-primary">CV</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-center text-muted-foreground">
                {qrData.instructions}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qr-url">Resume URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="qr-url"
                  value={qrData.url}
                  readOnly
                  className="flex-1"
                />
                <Button size="icon" variant="outline" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button className="flex-1" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button className="flex-1" variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
