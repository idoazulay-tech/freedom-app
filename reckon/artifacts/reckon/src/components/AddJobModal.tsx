import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateJob, useExtractJobFromUrl, useExtractJobFromImage, useAnalyzeJob, CreateJobBodyStatus } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface AddJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddJobModal({ open, onOpenChange }: AddJobModalProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const createJob = useCreateJob();
  const extractUrl = useExtractJobFromUrl();
  const extractImage = useExtractJobFromImage();
  const analyzeJob = useAnalyzeJob();

  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [manualForm, setManualForm] = useState({
    company_name: "",
    job_title: "",
    job_description: "",
    job_url: "",
    status: "saved" as CreateJobBodyStatus,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsProcessing(true);
    try {
      const extracted = await extractUrl.mutateAsync({ data: { url } });
      const job = await createJob.mutateAsync({
        data: {
          company_name: extracted.extracted.company_name || "Unknown Company",
          job_title: extracted.extracted.job_title || "Unknown Title",
          job_description: extracted.extracted.job_description || "",
          job_url: url,
          status: "saved",
        }
      });
      
      void analyzeJob.mutateAsync({ id: job.job.id }).catch(console.error);
      
      toast({ title: "Job added successfully" });
      onOpenChange(false);
      setLocation(`/jobs/${job.job.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error extracting job", description: message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImageSubmit = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    try {
      const extracted = await extractImage.mutateAsync({ data: { image: file } });
      const job = await createJob.mutateAsync({
        data: {
          company_name: extracted.extracted.company_name || "Unknown Company",
          job_title: extracted.extracted.job_title || "Unknown Title",
          job_description: extracted.extracted.job_description || "",
          status: "saved",
        }
      });
      
      void analyzeJob.mutateAsync({ id: job.job.id }).catch(console.error);
      
      toast({ title: "Job added successfully" });
      onOpenChange(false);
      setLocation(`/jobs/${job.job.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error extracting job", description: message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.company_name || !manualForm.job_title) return;

    setIsProcessing(true);
    try {
      const job = await createJob.mutateAsync({ data: manualForm });
      
      void analyzeJob.mutateAsync({ id: job.job.id }).catch(console.error);
      
      toast({ title: "Job added successfully" });
      onOpenChange(false);
      setLocation(`/jobs/${job.job.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error adding job", description: message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="font-syne text-2xl font-extrabold">Add New Job</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Paste a URL, upload a screenshot, or enter details manually.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
            <TabsTrigger value="url">Paste URL</TabsTrigger>
            <TabsTrigger value="image">Screenshot</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="mt-6">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-url">Job Posting URL</Label>
                <Input
                  id="job-url"
                  placeholder="https://linkedin.com/jobs/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-secondary/50"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isProcessing || !url}>
                {isProcessing ? "Processing..." : "Extract & Add Job"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="image" className="mt-6">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary transition-colors">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="job-image"
                />
                <Label htmlFor="job-image" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="text-4xl text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {file ? file.name : <span>Click to upload a screenshot</span>}
                  </span>
                </Label>
              </div>
              <Button onClick={handleImageSubmit} className="w-full" disabled={isProcessing || !file}>
                {isProcessing ? "Processing..." : "Extract & Add Job"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="mt-6">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={manualForm.company_name}
                    onChange={(e) => setManualForm({ ...manualForm, company_name: e.target.value })}
                    className="bg-secondary/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={manualForm.job_title}
                    onChange={(e) => setManualForm({ ...manualForm, job_title: e.target.value })}
                    className="bg-secondary/50"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url-manual">URL (Optional)</Label>
                <Input
                  id="url-manual"
                  value={manualForm.job_url}
                  onChange={(e) => setManualForm({ ...manualForm, job_url: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={manualForm.status}
                  onValueChange={(val: CreateJobBodyStatus) => setManualForm({ ...manualForm, status: val })}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saved">Saved</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="desc">Job Description</Label>
                <Textarea
                  id="desc"
                  value={manualForm.job_description}
                  onChange={(e) => setManualForm({ ...manualForm, job_description: e.target.value })}
                  className="bg-secondary/50 min-h-[100px]"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isProcessing || !manualForm.company_name || !manualForm.job_title}>
                {isProcessing ? "Processing..." : "Add Job"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
