"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import {
  getSavedSearches,
  getSavedFundraisers,
  deleteSavedSearch,
  deleteSavedFundraiser,
  formatSavedDate,
  type SavedSearch,
  type SavedFundraiser,
} from "@/lib/storage";
import { Trash2, ArrowRight, Search, Heart } from "lucide-react";

type Tab = "grants" | "fundraisers";

function formatCurrency(n: number) {
  return "$" + n.toLocaleString("en-US");
}

export default function SavedPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("grants");
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [fundraisers, setFundraisers] = useState<SavedFundraiser[]>([]);

  useEffect(() => {
    startTransition(() => {
      setSearches(getSavedSearches());
      setFundraisers(getSavedFundraisers());
    });
  }, []);

  function loadSearch(s: SavedSearch) {
    sessionStorage.setItem("matchResults", JSON.stringify(s.results));
    sessionStorage.setItem("orgData", JSON.stringify(s.orgData));
    router.push("/results");
  }

  function removeSearch(id: string) {
    deleteSavedSearch(id);
    setSearches((prev) => prev.filter((s) => s.id !== id));
  }

  function loadFundraiser(f: SavedFundraiser) {
    sessionStorage.setItem(
      "fundraiserResult",
      JSON.stringify({ ...f.campaign, orgName: f.orgName, cause: f.cause })
    );
    router.push("/fundraiser/live");
  }

  function removeFundraiser(id: string) {
    deleteSavedFundraiser(id);
    setFundraisers((prev) => prev.filter((f) => f.id !== id));
  }

  const totalSaved = searches.length + fundraisers.length;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-8 shadow-sm">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-foreground">Saved items</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalSaved === 0
              ? "Nothing saved yet — your searches and campaigns will appear here."
              : `${totalSaved} saved item${totalSaved !== 1 ? "s" : ""} across grants and fundraisers.`}
          </p>

          {/* Tabs */}
          <div className="mt-5 flex gap-1 rounded-xl border border-border bg-secondary p-1 w-fit">
            <button
              onClick={() => setTab("grants")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === "grants"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              Grant searches
              {searches.length > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${tab === "grants" ? "bg-primary/10 text-primary" : "bg-border text-muted-foreground"}`}>
                  {searches.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("fundraisers")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === "fundraisers"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className="h-3.5 w-3.5" />
              Fundraiser campaigns
              {fundraisers.length > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${tab === "fundraisers" ? "bg-primary/10 text-primary" : "bg-border text-muted-foreground"}`}>
                  {fundraisers.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* ── Saved Grant Searches ── */}
        {tab === "grants" && (
          <div className="space-y-4">
            {searches.length === 0 ? (
              <EmptyState
                icon={<Search className="h-8 w-8 text-muted-foreground/40" />}
                title="No saved grant searches"
                description="When you save a grant search from the results page, it will appear here. You can reload it anytime."
                action={{ label: "Find grants", onClick: () => router.push("/") }}
              />
            ) : (
              searches.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center"
                >
                  {/* Org avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                    {s.orgData.orgName.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">{s.orgData.orgName}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {s.orgData.causeArea && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {s.orgData.causeArea}
                        </span>
                      )}
                      {s.orgData.state && (
                        <span className="text-xs text-muted-foreground">{s.orgData.state}</span>
                      )}
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {s.results.length} match{s.results.length !== 1 ? "es" : ""}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">Saved {formatSavedDate(s.savedAt)}</span>
                    </div>
                    {/* Top match preview */}
                    {s.results[0] && (
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">
                        Top match: <span className="font-medium text-foreground">{s.results[0].name}</span>
                        {" "}· {s.results[0].match_score}% match
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <button
                      onClick={() => removeSearch(s.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => loadSearch(s)}
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
                    >
                      Load results
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Saved Fundraisers ── */}
        {tab === "fundraisers" && (
          <div className="space-y-4">
            {fundraisers.length === 0 ? (
              <EmptyState
                icon={<Heart className="h-8 w-8 text-muted-foreground/40" />}
                title="No saved fundraisers"
                description="When you save a fundraiser campaign from the live page, it will appear here."
                action={{ label: "Build a fundraiser", onClick: () => router.push("/fundraiser") }}
              />
            ) : (
              fundraisers.map((f) => (
                <div
                  key={f.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center"
                >
                  {/* Org avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foreground text-sm font-bold text-white shadow-sm">
                    {f.orgName.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">{f.campaign.campaign_title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{f.orgName}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      {f.cause && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {f.cause}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">Saved {formatSavedDate(f.savedAt)}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Goal: <span className="font-semibold text-foreground">{formatCurrency(f.campaign.goal_amount)}</span>
                      {" "}· {f.campaign.days_left} day campaign · {f.campaign.campaign_type}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <button
                      onClick={() => removeFundraiser(f.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => loadFundraiser(f)}
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
                    >
                      View campaign
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
        {icon}
      </div>
      <h3 className="mb-1 text-base font-semibold text-foreground">{title}</h3>
      <p className="mb-5 max-w-sm text-sm text-muted-foreground">{description}</p>
      <button
        onClick={action.onClick}
        className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
      >
        {action.label}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
