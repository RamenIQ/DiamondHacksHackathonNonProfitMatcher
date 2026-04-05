// localStorage keys
const SEARCHES_KEY = "gm_saved_searches";
const FUNDRAISERS_KEY = "gm_saved_fundraisers";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SavedOrgData {
  orgName: string;
  mission: string;
  causeArea: string;
  state: string;
  budgetRange: string;
}

export interface SavedMatch {
  name: string;
  opportunity_number: string;
  match_score: number;
  match_reason: string;
  grant_range: string;
  geographic_focus: string[];
  focus_areas: string[];
  website: string;
  grantDetail: unknown;
}

export interface SavedSearch {
  id: string;
  savedAt: string;
  orgData: SavedOrgData;
  results: SavedMatch[];
}

export interface SavedFundraiser {
  id: string;
  savedAt: string;
  orgName: string;
  cause: string;
  campaign: {
    campaign_title: string;
    tagline: string;
    goal_amount: number;
    days_left: number;
    story_paragraphs: string[];
    impact_items: { amount: number; description: string }[];
    donation_tiers: number[];
    campaign_type: string;
    updates: { date: string; text: string }[];
  };
}

// ── Saved Searches ────────────────────────────────────────────────────────────

export function getSavedSearches(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveSearch(orgData: SavedOrgData, results: SavedMatch[]): string {
  const searches = getSavedSearches();
  const id = Date.now().toString();
  searches.unshift({ id, savedAt: new Date().toISOString(), orgData, results });
  localStorage.setItem(SEARCHES_KEY, JSON.stringify(searches.slice(0, 10)));
  return id;
}

export function deleteSavedSearch(id: string): void {
  const searches = getSavedSearches().filter((s) => s.id !== id);
  localStorage.setItem(SEARCHES_KEY, JSON.stringify(searches));
}

// ── Saved Fundraisers ─────────────────────────────────────────────────────────

export function getSavedFundraisers(): SavedFundraiser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FUNDRAISERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveFundraiser(
  orgName: string,
  cause: string,
  campaign: SavedFundraiser["campaign"]
): string {
  const fundraisers = getSavedFundraisers();
  const id = Date.now().toString();
  fundraisers.unshift({ id, savedAt: new Date().toISOString(), orgName, cause, campaign });
  localStorage.setItem(FUNDRAISERS_KEY, JSON.stringify(fundraisers.slice(0, 10)));
  return id;
}

export function deleteSavedFundraiser(id: string): void {
  const fundraisers = getSavedFundraisers().filter((f) => f.id !== id);
  localStorage.setItem(FUNDRAISERS_KEY, JSON.stringify(fundraisers));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatSavedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
