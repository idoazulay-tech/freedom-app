import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
    ),
    title: "Paste Any Job URL",
    desc: "Drop a link from LinkedIn, Indeed, or any company careers page. Reckon reads it instantly and extracts every requirement.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    ),
    title: "AI Match Score",
    desc: "Get a precise 0-100% score showing how well your resume matches the role — backed by Claude's deep reasoning.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
    ),
    title: "Missing Skills Pinpointed",
    desc: "Know exactly which skills the employer wants that your resume doesn't show — with explanations of why each matters.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
    ),
    title: "Personalized Opening Email",
    desc: "Generates a highly targeted outreach email that speaks directly to the hiring manager's needs — not a generic template.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
    ),
    title: "Kanban Job Tracker",
    desc: "Track every application from Saved to Offer in one board. Get nudges when it's time to follow up on stale applications.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ),
    title: "ATS Risk Analysis",
    desc: "Know your odds of passing automated screening before you apply. Reckon flags formatting and keyword issues ATS systems reject.",
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-[#05050a] text-foreground font-sans">
      <nav className="sticky top-0 z-50 flex flex-wrap items-center gap-2 border-b border-border bg-[#05050a]/95 backdrop-blur px-8 py-5">
        <div className="mr-4 flex items-center gap-2 font-syne text-xl font-extrabold text-foreground">
          R<span className="text-primary">.</span>
        </div>
        <div className="ml-auto flex gap-2">
          {user ? (
            <Link href="/dashboard" className="nav-btn active">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="nav-btn">
                Login
              </Link>
              <Link href="/signup" className="nav-btn active">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <div className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-8 text-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,111,255,0.12)_0%,transparent_65%)]" />
          
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            AI-Powered Job Search
          </div>

          <h1 className="mb-6 max-w-[700px] font-syne text-[clamp(32px,4.5vw,60px)] font-bold leading-[1.15] tracking-tight">
            Stop guessing why you're not{" "}
            <em className="bg-gradient-to-br from-primary to-[#ff6b9d] bg-clip-text not-italic text-transparent">
              getting interviews
            </em>
          </h1>

          <p className="mb-12 max-w-[520px] text-lg font-light leading-relaxed text-muted-foreground">
            Reckon reads every job posting, compares it to your resume, and tells you exactly what's missing — then writes the perfect outreach email for you.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="rounded-xl px-8 py-6 text-base h-auto font-semibold">
                Start Free — No Credit Card
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="rounded-xl px-8 py-6 text-base h-auto border-border bg-transparent hover:border-primary hover:text-primary">
                See How It Works
              </Button>
            </a>
          </div>

          <div className="mt-20 flex flex-wrap justify-center gap-12 border-t border-border pt-12">
            <div className="text-center">
              <div className="font-syne text-3xl font-extrabold text-primary">78%</div>
              <div className="mt-1 text-[13px] text-muted-foreground">avg match score improvement</div>
            </div>
            <div className="text-center">
              <div className="font-syne text-3xl font-extrabold text-primary">3x</div>
              <div className="mt-1 text-[13px] text-muted-foreground">more interview callbacks</div>
            </div>
            <div className="text-center">
              <div className="font-syne text-3xl font-extrabold text-primary">&lt;30s</div>
              <div className="mt-1 text-[13px] text-muted-foreground">to analyze any job posting</div>
            </div>
            <div className="text-center">
              <div className="font-syne text-3xl font-extrabold text-[#00d4aa]">12k+</div>
              <div className="mt-1 text-[13px] text-muted-foreground">jobs analyzed this month</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="mx-auto max-w-[1200px] px-8 pb-24">
          <div className="mb-12 text-center">
            <h2 className="font-syne text-[clamp(24px,3vw,40px)] font-bold tracking-tight">
              Everything you need to<br />land more interviews
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-7 transition-all hover:border-primary hover:-translate-y-0.5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {f.icon}
                </div>
                <div className="mb-2 font-syne text-[17px] font-bold">{f.title}</div>
                <div className="text-sm leading-[1.7] text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mx-auto max-w-[1100px] px-8 pb-32">
          <div className="mb-12 text-center">
            <h2 className="font-syne text-[clamp(24px,3vw,40px)] font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-muted-foreground">Start free. Pay only when you need more.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-[800px] mx-auto w-full">
            {/* PAYG */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="mb-1 font-syne text-lg font-bold">Pay As You Go</div>
              <div className="mb-2 flex items-baseline gap-1">
                <span className="font-syne text-5xl font-extrabold">$1</span>
                <span className="text-sm text-muted-foreground">/ 12 analyses</span>
              </div>
              <p className="mb-6 text-xs text-muted-foreground">First 3 analyses always free. Top up when you need more.</p>
              <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><span className="text-primary">&#10003;</span> 12 analyses per $1 top-up</li>
                <li className="flex items-center gap-2"><span className="text-primary">&#10003;</span> Full AI email generation</li>
                <li className="flex items-center gap-2"><span className="text-primary">&#10003;</span> Complete missing skills list</li>
                <li className="flex items-center gap-2"><span className="text-primary">&#10003;</span> ATS risk assessment</li>
                <li className="flex items-center gap-2"><span className="text-primary">&#10003;</span> No subscription, no lock-in</li>
              </ul>
              <Link href="/signup">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Start Free
                </Button>
              </Link>
            </div>

            {/* Monthly — highlighted */}
            <div className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-[0_0_40px_rgba(124,111,255,0.15)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[11px] font-semibold text-white">
                Best Value
              </div>
              <div className="mb-1 font-syne text-lg font-bold">Monthly</div>
              <div className="mb-2 flex items-baseline gap-1">
                <span className="font-syne text-5xl font-extrabold">$19</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <p className="mb-6 text-xs text-muted-foreground">7-day free trial. Cancel any time.</p>
              <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><span className="text-[#00d4aa]">&#10003;</span> Unlimited job analyses</li>
                <li className="flex items-center gap-2"><span className="text-[#00d4aa]">&#10003;</span> Full AI email generation</li>
                <li className="flex items-center gap-2"><span className="text-[#00d4aa]">&#10003;</span> Complete skill gap analysis</li>
                <li className="flex items-center gap-2"><span className="text-[#00d4aa]">&#10003;</span> ATS risk assessment</li>
                <li className="flex items-center gap-2"><span className="text-[#00d4aa]">&#10003;</span> Priority AI processing</li>
              </ul>
              <Link href="/signup">
                <Button className="w-full bg-gradient-to-r from-primary to-[#ff6b9d] hover:opacity-90 text-white">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border px-8 py-8 text-center text-xs text-muted-foreground">
        <div className="font-syne font-bold text-foreground mb-2">R<span className="text-primary">.</span> Reckon</div>
        <div>AI-powered job search intelligence. Stop guessing, start landing interviews.</div>
      </footer>

      <style>{`
        .nav-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: transparent;
          color: var(--color-muted-foreground);
          font-size: 13px;
          transition: all 0.15s;
          display: inline-block;
        }
        .nav-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .nav-btn.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
        .nav-btn.active:hover { background: color-mix(in srgb, var(--color-primary) 90%, black); }
      `}</style>
    </div>
  );
}
