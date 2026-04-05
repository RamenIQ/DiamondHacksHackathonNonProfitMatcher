"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import DonationModal from "@/components/DonationModal";
import { ArrowLeft, Share2, Users, Clock, Heart, Bookmark, BookmarkCheck } from "lucide-react";
import { saveFundraiser, getSavedFundraisers } from "@/lib/storage";

interface ImpactItem {
  amount: number;
  description: string;
}

interface CampaignUpdate {
  date: string;
  text: string;
}

interface FundraiserResult {
  orgName: string;
  cause: string;
  campaign_title: string;
  tagline: string;
  story_paragraphs: string[];
  goal_amount: number;
  days_left: number;
  impact_items: ImpactItem[];
  donation_tiers: number[];
  campaign_type: "emergency" | "project" | "ongoing";
  updates: CampaignUpdate[];
}

function formatCurrency(n: number) {
  return "$" + n.toLocaleString("en-US");
}

export default function FundraiserLive() {
  const router = useRouter();
  const [campaign, setCampaign] = useState<FundraiserResult | null>(null);
  const [raised, setRaised] = useState(0);
  const [donorCount, setDonorCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedCampaign, setSavedCampaign] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("fundraiserResult");
    if (!raw) { router.push("/fundraiser"); return; }
    const parsed = JSON.parse(raw);
    const existing = getSavedFundraisers().find(
      (f) => f.orgName === parsed.orgName && f.campaign.campaign_title === parsed.campaign_title
    );
    startTransition(() => {
      setCampaign(parsed);
      if (existing) setSavedCampaign(true);
    });
  }, [router]);

  const handleDonationSuccess = (amount: number) => {
    setRaised((r) => r + amount);
    setDonorCount((d) => d + 1);
    setShowModal(false);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <main className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm">Loading your fundraiser…</p>
          </div>
        </main>
      </div>
    );
  }

  const progress = Math.min(100, Math.round((raised / campaign.goal_amount) * 100));
  const progressDisplay = raised > 0 ? progress : 0;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      {showModal && (
        <DonationModal
          orgName={campaign.orgName}
          campaignTitle={campaign.campaign_title}
          donationTiers={campaign.donation_tiers}
          onClose={() => setShowModal(false)}
          onSuccess={handleDonationSuccess}
        />
      )}

      {/* Campaign hero */}
      <div className="relative overflow-hidden bg-foreground text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #4ade80 0%, transparent 50%), radial-gradient(circle at 80% 20%, #86efac 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:py-20">
          {/* Back + Save */}
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => router.push("/fundraiser")}
              className="flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Edit campaign
            </button>
            <span className="text-white/20">·</span>
            <button
              onClick={() => {
                if (!campaign || savedCampaign) return;
                saveFundraiser(campaign.orgName, campaign.cause, {
                  campaign_title: campaign.campaign_title,
                  tagline: campaign.tagline,
                  goal_amount: campaign.goal_amount,
                  days_left: campaign.days_left,
                  story_paragraphs: campaign.story_paragraphs,
                  impact_items: campaign.impact_items,
                  donation_tiers: campaign.donation_tiers,
                  campaign_type: campaign.campaign_type,
                  updates: campaign.updates,
                });
                setSavedCampaign(true);
              }}
              disabled={savedCampaign}
              className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
                savedCampaign ? "text-primary cursor-default" : "text-white/60 hover:text-white"
              }`}
            >
              {savedCampaign ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {savedCampaign ? "Campaign saved" : "Save campaign"}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="rounded-full border border-primary/40 bg-primary/20 px-3 py-1 text-xs font-semibold text-primary-foreground">
              {campaign.cause}
            </span>
            {campaign.campaign_type === "emergency" && (
              <span className="rounded-full border border-red-400/40 bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200">
                Urgent
              </span>
            )}
            <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
              <Clock className="h-3 w-3" />
              {campaign.days_left} days left
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {campaign.campaign_title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/70 leading-relaxed">
            {campaign.tagline}
          </p>

          <div className="mt-6 flex items-center gap-3 text-sm text-white/50">
            <span className="font-semibold text-white">{campaign.orgName}</span>
            <span>·</span>
            <span>Nonprofit</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left: Story + Impact */}
          <div className="space-y-8">
            {/* Story */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-foreground">Our story</h2>
              <div className="space-y-4">
                {campaign.story_paragraphs.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {/* Impact */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-foreground">Your impact</h2>
              <div className="space-y-3">
                {campaign.impact_items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl border border-border bg-background p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                      {formatCurrency(item.amount)}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground pt-1.5">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Updates */}
            {campaign.updates?.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-5 text-base font-semibold text-foreground">Campaign updates</h2>
                <div className="space-y-4">
                  {campaign.updates.map((u, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
                        {i < campaign.updates.length - 1 && (
                          <div className="mt-1 w-px flex-1 bg-border" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">{u.date}</p>
                        <p className="text-sm text-foreground">{u.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Donation widget */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              {/* Progress */}
              <div className="mb-5">
                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-foreground">
                      {formatCurrency(raised)}
                    </span>
                    <span className="ml-1.5 text-sm text-muted-foreground">
                      raised of {formatCurrency(campaign.goal_amount)}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary">{progressDisplay}%</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(progressDisplay, raised > 0 ? 3 : 0)}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {donorCount} donor{donorCount !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {campaign.days_left} days left
                  </span>
                </div>
              </div>

              {/* Donate button */}
              <button
                onClick={() => setShowModal(true)}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-hover"
              >
                <Heart className="h-4 w-4" />
                Donate now
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Share2 className="h-4 w-4" />
                {copied ? "Link copied!" : "Share this campaign"}
              </button>

              {/* Quick tier preview */}
              <div className="mt-5 border-t border-border pt-5">
                <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Quick donate
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {campaign.donation_tiers.slice(0, 6).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setShowModal(true)}
                      className="rounded-xl border border-border bg-background py-2 text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      ${tier}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                🔒 Secure · Tax-deductible · Demo mode
              </p>
            </div>

            {/* Org badge */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                {campaign.orgName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{campaign.orgName}</p>
                <p className="text-xs text-muted-foreground">Verified nonprofit · {campaign.cause}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
