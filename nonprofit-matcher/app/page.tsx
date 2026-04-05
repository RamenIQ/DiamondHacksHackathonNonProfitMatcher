"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import { ArrowRight, ChevronDown, Building2, FileText, MapPin, DollarSign } from "lucide-react";

const FOCUS_AREAS = [
  { label: "Education", emoji: "🎓" },
  { label: "Health", emoji: "❤️" },
  { label: "Housing", emoji: "🏠" },
  { label: "Environment", emoji: "🌿" },
  { label: "Arts & Culture", emoji: "🎨" },
  { label: "Youth & Families", emoji: "👨‍👩‍👧" },
  { label: "Food Security", emoji: "🌾" },
];

const BUDGET_RANGES = [
  "Under $250,000",
  "$250,000 – $1M",
  "$1M – $5M",
  "$5M+",
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

const inputClass =
  "w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 shadow-sm";

export default function OrgProfile() {
  const router = useRouter();
  const [form, setForm] = useState({
    orgName: "",
    mission: "",
    causeArea: FOCUS_AREAS[0].label,
    state: "",
    budgetRange: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      sessionStorage.setItem("matchResults", JSON.stringify(data));
      sessionStorage.setItem("orgData", JSON.stringify(form));
      router.push("/results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to find matches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav currentStep={0} />

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border/50 px-4 py-10 text-center">
        <div className="mx-auto max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            AI-powered grant matching
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Find grants that fit<br />
            <span className="text-primary">your mission</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Tell us about your nonprofit and we'll surface the most relevant foundation grants — ranked by how well they match you.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[600px] px-4 py-10">
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          {/* Card header */}
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-base font-semibold text-foreground">Organization profile</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              All fields help improve match quality. Only name and mission are required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
            {/* Org name */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Organization name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. San Diego Youth Alliance"
                value={form.orgName}
                onChange={(e) => setForm((f) => ({ ...f, orgName: e.target.value }))}
                className={inputClass}
              />
            </div>

            {/* Mission */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Mission statement <span className="text-destructive">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe your organization's mission, programs, and the communities you serve…"
                value={form.mission}
                onChange={(e) => setForm((f) => ({ ...f, mission: e.target.value }))}
                className={`${inputClass} resize-none`}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                More detail = better matches. Mention your target population, programs, and geography.
              </p>
            </div>

            {/* Focus area chips */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Primary focus area
              </label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map(({ label, emoji }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, causeArea: label }))}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium shadow-sm ${
                      form.causeArea === label
                        ? "border-transparent bg-primary text-primary-foreground shadow-primary/25"
                        : "border-border bg-white text-foreground hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <span>{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* State + Budget row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  State
                </label>
                <div className="relative">
                  <select
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Annual budget
                </label>
                <div className="relative">
                  <select
                    value={form.budgetRange}
                    onChange={(e) => setForm((f) => ({ ...f, budgetRange: e.target.value }))}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">Select range</option>
                    {BUDGET_RANGES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Finding your best matches…
                </>
              ) : (
                <>
                  Find matching grants
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Your data is used only to generate matches and is never stored or shared.
        </p>
      </main>
    </div>
  );
}
