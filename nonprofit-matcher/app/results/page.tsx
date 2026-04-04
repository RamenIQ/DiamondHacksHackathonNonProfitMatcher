"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import { ArrowRight, ChevronDown, ExternalLink } from "lucide-react";

interface Match {
  name: string;
  match_score: number;
  match_reason: string;
  grant_range: string;
  geographic_focus: string[];
  focus_areas: string[];
  website: string;
}

function scoreStyle(score: number): string {
  if (score >= 85) return "bg-score-high-bg text-score-high";
  if (score >= 70) return "bg-score-green-bg text-score-green";
  return "bg-score-amber-bg text-score-amber";
}

type SortKey = "match_score" | "grant_range";

export default function MatchResults() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("match_score");

  useEffect(() => {
    const raw = sessionStorage.getItem("matchResults");
    if (!raw) {
      router.push("/");
      return;
    }
    setMatches(JSON.parse(raw));
  }, [router]);

  const sorted = [...matches].sort((a, b) => {
    if (sortBy === "match_score") return b.match_score - a.match_score;
    // sort by lower bound of grant_range numerically
    const parse = (s: string) => parseInt(s.replace(/[^0-9]/g, "") || "0");
    return parse(b.grant_range) - parse(a.grant_range);
  });

  const handleDraftOutreach = (match: Match) => {
    sessionStorage.setItem("selectedGrant", JSON.stringify(match));
    router.push("/outreach");
  };

  if (!matches.length) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav currentStep={1} />
        <main className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav currentStep={1} />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Match results</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing {matches.length} grant opportunities ranked by AI
            </p>
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="appearance-none rounded-lg border border-input bg-card px-3.5 py-2 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="match_score">Sort by match score</option>
              <option value="grant_range">Sort by amount</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((g, i) => (
            <div
              key={g.name}
              className={`flex flex-col rounded-2xl border border-border bg-card p-5 ${
                i === 0 ? "border-l-4 border-l-primary" : ""
              }`}
            >
              {/* Score + amount row */}
              <div className="mb-3 flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreStyle(g.match_score)}`}>
                  {g.match_score}%
                </span>
                <span className="text-xs font-semibold text-foreground">{g.grant_range}</span>
              </div>

              {/* Title */}
              <h3 className="mb-1 text-sm font-semibold leading-snug text-foreground line-clamp-2">
                {g.name}
              </h3>

              {/* Focus areas */}
              <div className="mb-3 flex flex-wrap gap-1">
                {g.focus_areas.slice(0, 3).map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {area}
                  </span>
                ))}
              </div>

              {/* Reason */}
              <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                "{g.match_reason}"
              </p>

              {/* Geography */}
              <div className="mb-4 text-xs text-muted-foreground">
                {g.geographic_focus.join(", ")}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleDraftOutreach(g)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Draft outreach
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <a
                  href={g.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
                >
                  View on grants.gov
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            ← Start a new search
          </button>
        </div>
      </main>
    </div>
  );
}
