import { useState } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetJobs, useGetProfile, Job } from "@workspace/api-client-react";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddJobModal } from "@/components/AddJobModal";
import { formatDistanceToNow } from "date-fns";

const STATUSES = [
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "interview", label: "Interview" },
  { id: "rejected", label: "Rejected" },
  { id: "offer", label: "Offer" },
];

function JobCard({ job }: { job: Job }) {
  const updatedOrCreated = job.updated_at ?? job.created_at;
  const isOldApplication = job.status === "applied" && updatedOrCreated != null && (new Date().getTime() - new Date(updatedOrCreated).getTime()) > 7 * 24 * 60 * 60 * 1000;
  
  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary mb-3">
        <div className="mb-1 text-xs text-muted-foreground">{job.company_name}</div>
        <div className="mb-3 font-syne text-sm font-bold leading-tight">{job.job_title}</div>
        
        <div className="flex items-center justify-between">
          {job.match_score != null ? (
            <div className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              job.match_score >= 80 ? "bg-[#00d4aa]/10 text-[#00d4aa]" :
              job.match_score >= 50 ? "bg-[#ffd166]/10 text-[#ffd166]" :
              "bg-[#ff6b6b]/10 text-[#ff6b6b]"
            }`}>
              {job.match_score}% Match
            </div>
          ) : (
            <div className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Unscored
            </div>
          )}
          <div className="text-[11px] text-muted-foreground">
            {job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : ""}
          </div>
        </div>
        
        {isOldApplication && (
          <div className="mt-2 inline-block rounded-full bg-[#ff6b9d]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ff6b9d]">
            Follow Up
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: jobsResponse, isLoading: jobsLoading, isError: jobsError } = useGetJobs();
  const { data: profileResponse, isLoading: profileLoading } = useGetProfile();
  
  const jobs = jobsResponse?.jobs || [];
  const profile = profileResponse?.profile;

  if (jobsLoading || profileLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (jobsError) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <p className="text-muted-foreground">Failed to load your jobs. Please try again.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </AppLayout>
    );
  }
  
  const totalApplied = jobs.filter((j) => ["applied", "interview", "offer", "rejected"].includes(j.status)).length;
  const totalInterviews = jobs.filter((j) => ["interview", "offer"].includes(j.status)).length;
  const scoredJobs = jobs.filter(j => j.match_score != null);
  const avgMatch = scoredJobs.length > 0 
    ? Math.round(scoredJobs.reduce((acc, j) => acc + (j.match_score || 0), 0) / scoredJobs.length) 
    : 0;
  const totalOffers = jobs.filter((j) => j.status === "offer").length;

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <h1 className="font-syne text-3xl font-extrabold tracking-tight">
            {profile?.full_name ? `Welcome, ${profile.full_name.split(" ")[0]}` : "Dashboard"}
          </h1>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 rounded-xl px-5">
          <Plus className="h-4 w-4" />
          Add Job
        </Button>
      </div>

      {profile?.subscription_type === 'free' && (profile.jobs_count || 0) >= 3 && (
        <div className="mb-6 rounded-xl border border-[#ffd166]/30 bg-[#ffd166]/5 p-4 text-sm text-[#ffd166]">
          <strong>Free plan limit reached.</strong> You have analyzed {(profile.jobs_count || 0)} jobs. Please upgrade your plan in Settings to analyze more jobs.
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Applied</div>
          <div className="font-syne text-3xl font-extrabold">{totalApplied}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Interviews</div>
          <div className="font-syne text-3xl font-extrabold text-[#00d4aa]">{totalInterviews}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Match</div>
          <div className="font-syne text-3xl font-extrabold text-primary">{avgMatch}%</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Offers</div>
          <div className="font-syne text-3xl font-extrabold text-[#ffd166]">{totalOffers}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {STATUSES.map((status) => {
          const colJobs = jobs.filter((j) => j.status === status.id);
          
          return (
            <div key={status.id} className="flex flex-col gap-3">
              <div className="mb-2 flex items-center gap-2 px-1">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {status.label}
                </h3>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                  {colJobs.length}
                </span>
              </div>
              
              <div className="flex flex-col min-h-[200px]">
                {colJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
                
                {colJobs.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/50 bg-secondary/20 p-4 text-center text-xs text-muted-foreground h-24 flex items-center justify-center">
                    No jobs
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddJobModal open={modalOpen} onOpenChange={setModalOpen} />
    </AppLayout>
  );
}
