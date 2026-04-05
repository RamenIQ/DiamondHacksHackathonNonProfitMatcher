"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import { ArrowRight, ArrowLeft } from "lucide-react";

const CAUSES = [
  { label: "Education", emoji: "🎓" },
  { label: "Health", emoji: "❤️" },
  { label: "Housing", emoji: "🏠" },
  { label: "Environment", emoji: "🌿" },
  { label: "Arts & Culture", emoji: "🎨" },
  { label: "Youth & Families", emoji: "👨‍👩‍👧" },
  { label: "Food Security", emoji: "🌾" },
  { label: "Animal Welfare", emoji: "🐾" },
];

const TIMELINES = [
  { label: "30 days", value: "30" },
  { label: "60 days", value: "60" },
  { label: "90 days", value: "90" },
  { label: "6 months", value: "180" },
  { label: "Ongoing", value: "365" },
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const inputClass =
  "w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 shadow-sm";

interface WizardData {
  orgName: string;
  cause: string;
  state: string;
  purpose: string;
  beneficiaries: string;
  timeline: string;
  story: string;
  urgency: string;
}

const STEPS = ["Organization", "Your Campaign", "Your Story"];

export default function FundraiserWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WizardData>({
    orgName: "",
    cause: "Education",
    state: "",
    purpose: "",
    beneficiaries: "",
    timeline: "60",
    story: "",
    urgency: "",
  });

  useEffect(() => {
    if (!loading) { setProgress(0); return; }
    setProgress(0);
    const start = Date.now();
    const interval = setInterval(() => {
      setProgress(Math.min(88, ((Date.now() - start) / 7000) * 88));
    }, 80);
    return () => clearInterval(interval);
  }, [loading]);

  const set = (key: keyof WizardData) => (val: string) =>
    setData((d) => ({ ...d, [key]: val }));

  const canAdvance = () => {
    if (step === 0) return data.orgName.trim().length > 0;
    if (step === 1) return data.purpose.trim().length > 10;
    return true;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/create-fundraiser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong");
      setProgress(100);
      sessionStorage.setItem(
        "fundraiserResult",
        JSON.stringify({ ...result, orgName: data.orgName, cause: data.cause })
      );
      router.push("/fundraiser/live");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
            <div className="mb-5 flex items-center justify-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <svg className="absolute inset-0 h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary/10" />
                  <circle
                    cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                    className="text-primary transition-all duration-100 ease-linear"
                  />
                </svg>
                <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
              </div>
            </div>
            <h3 className="mb-1 text-base font-semibold text-foreground">Building your fundraiser</h3>
            <p className="mb-5 text-sm text-muted-foreground">
              Our AI is crafting your campaign story, setting a realistic goal, and preparing your donation page…
            </p>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/10">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">This usually takes 5–15 seconds</p>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border/50 px-4 py-10 text-center">
        <div className="mx-auto max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            AI fundraiser builder
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Launch your fundraiser<br />
            <span className="text-primary">in minutes</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Answer a few questions and our AI will write your campaign story, set a realistic goal, and build your donation page automatically.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[600px] px-4 py-10">
        {/* Step progress */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border-2 ${
                    i < step
                      ? "bg-primary border-primary text-white"
                      : i === step
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-white text-muted-foreground"
                  }`}
                >
                  {i < step ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-xs font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm">
          {/* Step 0: Organization */}
          {step === 0 && (
            <>
              <div className="border-b border-border px-6 py-5">
                <h2 className="text-base font-semibold text-foreground">Tell us about your organization</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">We&apos;ll use this to personalize your campaign.</p>
              </div>
              <div className="space-y-6 px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Organization name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Riverside Youth Foundation"
                    value={data.orgName}
                    onChange={(e) => set("orgName")(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Primary cause area</label>
                  <div className="flex flex-wrap gap-2">
                    {CAUSES.map(({ label, emoji }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => set("cause")(label)}
                        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium shadow-sm ${
                          data.cause === label
                            ? "border-transparent bg-primary text-primary-foreground"
                            : "border-border bg-white text-foreground hover:border-primary/40 hover:bg-primary/5"
                        }`}
                      >
                        <span>{emoji}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">State (optional)</label>
                  <div className="relative">
                    <select
                      value={data.state}
                      onChange={(e) => set("state")(e.target.value)}
                      className={`${inputClass} appearance-none pr-10`}
                    >
                      <option value="">Select state</option>
                      {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 1: Campaign details */}
          {step === 1 && (
            <>
              <div className="border-b border-border px-6 py-5">
                <h2 className="text-base font-semibold text-foreground">What are you raising money for?</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Be specific — the more detail, the better your campaign.</p>
              </div>
              <div className="space-y-6 px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Campaign purpose <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. We need to raise funds to build a new computer lab for 200 students who currently have no access to technology at school…"
                    value={data.purpose}
                    onChange={(e) => set("purpose")(e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">Describe the specific need, project, or program you&apos;re funding.</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Who will this help?</label>
                  <input
                    type="text"
                    placeholder="e.g. 200 low-income students aged 10–18 in South Chicago"
                    value={data.beneficiaries}
                    onChange={(e) => set("beneficiaries")(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Campaign timeline</label>
                  <div className="flex flex-wrap gap-2">
                    {TIMELINES.map(({ label, value }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set("timeline")(value)}
                        className={`rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm ${
                          data.timeline === value
                            ? "border-transparent bg-primary text-primary-foreground"
                            : "border-border bg-white text-foreground hover:border-primary/40 hover:bg-primary/5"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Story */}
          {step === 2 && (
            <>
              <div className="border-b border-border px-6 py-5">
                <h2 className="text-base font-semibold text-foreground">Share your story</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Stories with personal detail raise 3× more. Tell donors why this matters.</p>
              </div>
              <div className="space-y-6 px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">What inspired this campaign?</label>
                  <textarea
                    rows={5}
                    placeholder="e.g. Last year we met Maria, a 12-year-old who had to walk 2 miles to the library just to use a computer for homework. There are hundreds of kids like Maria in our community…"
                    value={data.story}
                    onChange={(e) => set("story")(e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">Optional but highly recommended. Real stories create emotional connection.</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Any urgency or deadline?</label>
                  <input
                    type="text"
                    placeholder="e.g. School year starts in September — we need to be ready by then"
                    value={data.urgency}
                    onChange={(e) => set("urgency")(e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">Urgency increases donor action. Leave blank if not applicable.</p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer nav */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {step < 2 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Building…
                  </>
                ) : (
                  <>
                    Build my fundraiser
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Your fundraiser page is generated instantly and can be shared immediately.
        </p>
      </main>
    </div>
  );
}
