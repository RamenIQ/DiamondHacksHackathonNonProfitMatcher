"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import { ArrowRight, ChevronDown, ExternalLink, Trophy } from "lucide-react";

interface Match {
  name: string;
  match_score: number;
  match_reason: string;
  grant_range: string;
  geographic_focus: string[];
  focus_areas: string[];
  website: string;
}

function ScorePill({ score }: { score: number }) {
  const style =
    score >= 85
      ? "bg-score-high-bg text-score-high"
      : score >= 70
      ? "bg-score-green-bg text-score-green"
      : "bg-score-amber-bg text-score-amber";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${style}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          score >= 85 ? "bg-score-high" : score >= 70 ? "bg-score-green" : "bg-score-amber"
        }`}
      />
      {score}% match
    </span>
  );
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
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm">Loading results…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav currentStep={1} />

      {/* Results header */}
      <div className="border-b border-border bg-card px-4 py-5 shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {matches.length} grant matches found
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              AI-ranked foundations aligned with your mission
            </p>
          </div>
          <div className="relative w-fit">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="appearance-none rounded-xl border border-input bg-white px-4 py-2.5 pr-9 text-sm font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="match_score">Sort by match score</option>
              <option value="grant_range">Sort by grant amount</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((g, i) => (
            <div
              key={g.name}
              className={`group relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md ${
                i === 0
                  ? "border-primary/40 ring-1 ring-primary/20"
                  : "border-border"
              }`}
            >
              {/* Top match badge */}
              {i === 0 && (
                <div className="absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25">
                  <Trophy className="h-3 w-3" />
                  Best match
                </div>
              )}

              {/* Score + amount */}
              <div className="mb-3 flex items-center justify-between">
                <ScorePill score={g.match_score} />
                <span className="text-xs font-semibold text-foreground">{g.grant_range}</span>
              </div>

              {/* Name */}
              <h3 className="mb-2 text-sm font-semibold leading-snug text-foreground line-clamp-2">
                {g.name}
              </h3>

              {/* Focus area tags */}
              <div className="mb-3 flex flex-wrap gap-1">
                {g.focus_areas.slice(0, 3).map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {area}
                  </span>
                ))}
              </div>

              {/* Match reason */}
              <p className="mb-3 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                {g.match_reason}
              </p>

              {/* Geography */}
              <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="line-clamp-1">{g.geographic_focus.join(", ")}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleDraftOutreach(g)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary-hover"
                >
                  Draft outreach email
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <a
                  href={g.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  View on grants.gov
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground"
          >
            ← Start a new search
          </button>
        </div>
      </main>
    </div>
  );
}
