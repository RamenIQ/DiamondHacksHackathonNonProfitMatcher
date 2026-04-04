"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import { ArrowLeft, RotateCcw, Copy, Check } from "lucide-react";

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

  const draftEmail = useCallback(
    async (g: Match, o: OrgData) => {
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
    },
    []
  );

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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav currentStep={2} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* Back */}
        <button
          onClick={() => router.push("/results")}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </button>

        {/* Funder header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials(grant.name)}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-foreground">{grant.name}</h1>
            <p className="text-sm text-muted-foreground">
              {grant.grant_range} · {grant.match_score}% match
            </p>
          </div>
        </div>

        {/* Email form */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">To</label>
              <input
                type="text"
                readOnly
                value={grant.name}
                className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Email draft
            </label>

            {loading ? (
              <div className="flex items-center justify-center rounded-lg border border-input bg-card py-16">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <span className="text-sm">Drafting your outreach email…</span>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : (
              <textarea
                rows={12}
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                className="w-full resize-none rounded-lg border border-input bg-card px-3.5 py-3 text-sm leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            )}
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopy}
              disabled={!emailDraft || loading}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy email"}
            </button>

            <a
              href={grant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Apply on grants.gov
            </a>

            <button
              onClick={() => draftEmail(grant, org)}
              disabled={loading}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
