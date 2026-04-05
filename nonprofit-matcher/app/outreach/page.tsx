"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import { ArrowLeft, RotateCcw, Copy, Check, ExternalLink } from "lucide-react";

interface Match {
  name: string;
  match_score: number;
  match_reason: string;
  grant_range: string;
  website: string;
}

interface OrgData {
  orgName: string;
  mission: string;
  state: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function EmailOutreach() {
  const router = useRouter();
  const [grant, setGrant] = useState<Match | null>(null);
  const [org, setOrg] = useState<OrgData | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const draftEmail = useCallback(async (g: Match, o: OrgData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: o.orgName,
          mission: o.mission,
          state: o.state,
          foundationName: g.name,
          matchReason: g.match_reason,
          grantRange: g.grant_range,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to draft email");
      setEmailDraft(data.email);
      setSubject(`Grant Inquiry: ${o.orgName} × ${g.name}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to draft email. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const rawGrant = sessionStorage.getItem("selectedGrant");
    const rawOrg = sessionStorage.getItem("orgData");
    if (!rawGrant || !rawOrg) {
      router.push("/");
      return;
    }
    const g: Match = JSON.parse(rawGrant);
    const o: OrgData = JSON.parse(rawOrg);
    setGrant(g);
    setOrg(o);
    draftEmail(g, o);
  }, [router, draftEmail]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(emailDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!grant || !org) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav currentStep={2} />
        <main className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm">Loading…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav currentStep={2} />

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Back */}
        <button
          onClick={() => router.push("/results")}
          className="mb-6 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </button>

        {/* Funder card */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md shadow-primary/20">
            {initials(grant.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-foreground">{grant.name}</h1>
            <p className="text-sm text-muted-foreground">
              {grant.grant_range}
              <span className="mx-2 text-border">·</span>
              <span className="font-medium text-score-high">{grant.match_score}% match</span>
            </p>
          </div>
          <a
            href={grant.website}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground sm:flex"
          >
            Apply
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Email composer */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Outreach email draft</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              AI-generated and editable. Copy it directly into your email client.
            </p>
          </div>

          <div className="space-y-4 px-6 py-5">
            {/* To + Subject */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  To
                </label>
                <input
                  type="text"
                  readOnly
                  value={grant.name}
                  className="w-full rounded-xl border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-input bg-white px-3.5 py-2.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>
            </div>

            {/* Body */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email body
              </label>

              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-input bg-secondary py-16 text-muted-foreground">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <span className="text-sm">Drafting your outreach email…</span>
                </div>
              ) : error ? (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              ) : (
                <textarea
                  rows={14}
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  className="w-full resize-none rounded-xl border border-input bg-white px-4 py-3.5 text-sm leading-relaxed text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
              )}
            </div>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-3 border-t border-border px-6 py-4">
            <button
              onClick={handleCopy}
              disabled={!emailDraft || loading}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-40 ${
                copied
                  ? "bg-score-green-bg text-score-green"
                  : "bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary-hover"
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied to clipboard!" : "Copy email"}
            </button>

            <a
              href={grant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent sm:hidden"
            >
              Apply on grants.gov
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <button
              onClick={() => draftEmail(grant, org)}
              disabled={loading}
              className="ml-auto flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Review and personalize before sending. This draft is a starting point.
        </p>
      </main>
    </div>
  );
}
