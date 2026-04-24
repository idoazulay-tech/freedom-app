import { useState } from "react";
import { useParams, Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetJob, useUpdateJob, useRegenerateEmail, useGetProfile, useAnalyzeJob, getGetJobQueryKey, UpdateJobBodyStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Copy, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function JobDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: jobResponse, isLoading } = useGetJob(id!, { query: { enabled: !!id, queryKey: getGetJobQueryKey(id!) } });
  const { data: profileResponse } = useGetProfile();
  
  const updateJob = useUpdateJob();
  const regenerateEmail = useRegenerateEmail();
  const analyzeJob = useAnalyzeJob();
  
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const job = jobResponse?.job;
  const profile = profileResponse?.profile;
  const isFree = profile?.subscription_type === 'free';

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!job) {
    return (
      <AppLayout>
        <div className="text-center py-20">Job not found</div>
      </AppLayout>
    );
  }

  const handleStatusChange = async (status: UpdateJobBodyStatus) => {
    try {
      await updateJob.mutateAsync({
        id: job.id,
        data: { status }
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      await queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(job.id) });
      toast({ title: "Status updated" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Failed to update status", description: message, variant: "destructive" });
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await regenerateEmail.mutateAsync({ id: job.id });
      await queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(job.id) });
      toast({ title: "Email regenerated" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Failed to regenerate", description: message, variant: "destructive" });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await analyzeJob.mutateAsync({ id: job.id });
      await queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(job.id) });
      toast({ title: "Analysis complete" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Failed to analyze", description: message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (job.generated_email) {
      void navigator.clipboard.writeText(job.generated_email);
      toast({ title: "Copied to clipboard" });
    }
  };

  const scoreColor = (job.match_score || 0) >= 80 ? "#00d4aa" : (job.match_score || 0) >= 50 ? "#ffd166" : "#ff6b6b";

  const displayedSkills = isFree && job.missing_skills ? job.missing_skills.slice(0, 2) : job.missing_skills;

  return (
    <AppLayout>
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        {/* Main Content */}
        <div>
          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="mb-1 text-sm text-muted-foreground">{job.company_name}</div>
              <h1 className="font-syne text-3xl font-extrabold">{job.job_title}</h1>
              {job.job_url && (
                <a href={job.job_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary hover:underline">
                  View original posting
                </a>
              )}
            </div>
            
            <Select value={job.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
                <SelectValue />
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

          {job.job_description && (
            <div className="mb-8">
              <h2 className="mb-4 font-syne text-sm font-bold uppercase tracking-wide text-foreground">Job Description</h2>
              <div className="rounded-xl border border-border bg-secondary/20 p-5 text-[13px] leading-relaxed text-muted-foreground max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                {job.job_description}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="mb-4 font-syne text-sm font-bold uppercase tracking-wide text-foreground">Missing Skills</h2>
            {displayedSkills && displayedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {displayedSkills.map((skill, i) => (
                  <div key={i} className="rounded-full border border-[#ff6b6b]/20 bg-[#ff6b6b]/10 px-3 py-1.5 text-xs font-medium text-[#ff6b6b]">
                    {skill.skill}
                  </div>
                ))}
                {isFree && job.missing_skills && job.missing_skills.length > 2 && (
                  <div className="flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    + {job.missing_skills.length - 2} more hidden
                  </div>
                )}
              </div>
            ) : job.match_score != null ? (
              <div className="text-sm text-muted-foreground">No critical skills missing.</div>
            ) : (
              <div className="text-sm text-muted-foreground">Not analyzed yet</div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="mb-4 font-syne text-sm font-bold uppercase tracking-wide text-foreground">Resume Suggestions</h2>
            {job.resume_suggestions && job.resume_suggestions.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {job.resume_suggestions.map((sug, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] leading-relaxed text-muted-foreground">
                    <span className="mt-0.5 text-primary">&#8594;</span>
                    {sug}
                  </li>
                ))}
              </ul>
            ) : job.match_score != null ? (
              <div className="text-sm text-muted-foreground">Resume looks solid for this role.</div>
            ) : (
              <div className="text-sm text-muted-foreground">Not analyzed yet</div>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-syne text-sm font-bold uppercase tracking-wide text-foreground">Generated Email</h2>
              {job.generated_email && !isFree && (
                <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={isRegenerating || (job.email_generates_count || 0) >= 3} className="h-8 text-xs border-border bg-transparent text-muted-foreground hover:text-primary">
                  {isRegenerating ? <Spinner className="mr-2 h-3 w-3" /> : <Sparkles className="mr-2 h-3 w-3" />}
                  Regenerate ({(job.email_generates_count || 0)}/3)
                </Button>
              )}
            </div>

            {job.match_score == null ? (
              <div className="rounded-xl border border-border bg-secondary/30 p-6 text-center">
                <p className="mb-4 text-sm text-muted-foreground">Analyze this job to generate a personalized email.</p>
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-primary hover:bg-primary/90">
                  {isAnalyzing ? "Analyzing..." : "Analyze Job"}
                </Button>
              </div>
            ) : (
              <div className="relative">
                <div className={`overflow-hidden rounded-xl border border-border bg-secondary/30 p-5 text-[13px] leading-relaxed text-muted-foreground ${isFree ? 'max-h-[200px]' : ''}`}>
                  {job.generated_email ? (
                    <div className="whitespace-pre-wrap">{job.generated_email}</div>
                  ) : (
                    <div>No email generated.</div>
                  )}
                </div>
                
                {isFree && (
                  <div className="absolute bottom-0 left-0 right-0 flex h-[100px] items-end justify-center bg-gradient-to-t from-card to-transparent pb-4">
                    <Link href="/settings">
                      <Button className="rounded-full bg-primary px-6 shadow-lg hover:bg-primary/90">
                        Upgrade to Unlock
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {job.generated_email && !isFree && (
              <Button variant="outline" onClick={handleCopy} className="mt-3 w-full border-primary bg-transparent text-primary hover:bg-primary/10">
                <Copy className="mr-2 h-4 w-4" /> Copy Email
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="rounded-2xl border border-border bg-card p-8 text-center sticky top-24">
            <div className="mx-auto mb-4 flex h-[140px] w-[140px] items-center justify-center rounded-full relative" 
              style={{
                background: job.match_score != null 
                  ? `conic-gradient(${scoreColor} 0deg ${(job.match_score / 100) * 360}deg, var(--color-secondary) ${(job.match_score / 100) * 360}deg)` 
                  : 'var(--color-secondary)'
              }}>
              <div className="absolute h-[110px] w-[110px] rounded-full bg-card" />
              <div className="relative z-10 font-syne text-4xl font-extrabold" style={{ color: scoreColor }}>
                {job.match_score != null ? `${job.match_score}%` : '--'}
              </div>
            </div>
            <div className="text-sm font-medium text-muted-foreground">Match Score</div>
            
            {job.match_score == null && (
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="mt-6 w-full bg-primary hover:bg-primary/90">
                {isAnalyzing ? "Analyzing..." : "Analyze Job"}
              </Button>
            )}

            {job.match_score != null && (
              <div className="mt-6 space-y-3 text-left">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">ATS Risk Score</span>
                  <span className="font-semibold text-foreground">{job.match_score >= 70 ? "Low" : job.match_score >= 40 ? "Medium" : "High"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Missing Skills</span>
                  <span className="font-semibold text-[#ff6b6b]">{job.missing_skills?.length ?? 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Suggestions</span>
                  <span className="font-semibold text-foreground">{job.resume_suggestions?.length ?? 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
