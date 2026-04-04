"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import { ArrowRight, ChevronDown } from "lucide-react";

const FOCUS_AREAS = [
  "Education",
  "Health",
  "Housing",
  "Environment",
  "Arts & Culture",
  "Youth & Families",
  "Food Security",
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
  "w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function OrgProfile() {
  const router = useRouter();
  const [form, setForm] = useState({
    orgName: "",
    mission: "",
    causeArea: FOCUS_AREAS[0],
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
      <main className="mx-auto max-w-[560px] px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h1 className="mb-1 text-xl font-semibold text-foreground">
            Organization profile
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Tell us about your nonprofit to find the best grant matches.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Org name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
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
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Mission statement <span className="text-destructive">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe your organization's mission, programs, and the communities you serve..."
                value={form.mission}
                onChange={(e) => setForm((f) => ({ ...f, mission: e.target.value }))}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Focus area chips */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Focus area
              </label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, causeArea: area }))}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      form.causeArea === area
                        ? "border-transparent bg-chip-selected text-chip-selected-foreground"
                        : "border-border bg-card text-foreground hover:bg-accent"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* State */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                State
              </label>
              <div className="relative">
                <select
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="">Select your state</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Annual budget */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Annual budget
              </label>
              <div className="relative">
                <select
                  value={form.budgetRange}
                  onChange={(e) => setForm((f) => ({ ...f, budgetRange: e.target.value }))}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="">Select budget range</option>
                  {BUDGET_RANGES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}

            {/* CTA */}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
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
      </main>
    </div>
  );
}
