import { ArrowRight, ChevronDown } from "lucide-react";
import TopNav from "@/components/TopNav";

interface Grant {
  score: number;
  scoreColor: "high" | "green" | "amber";
  title: string;
  agency: string;
  type: string;
  amount: string;
  reason: string;
  closes: string;
  tag: string;
  accent?: boolean;
}

const grants: Grant[] = [
  {
    score: 98,
    scoreColor: "high",
    title: "Youth Development Initiative",
    agency: "Dept. of Education",
    type: "Federal",
    amount: "$250,000",
    reason: "Strong alignment with youth education focus...",
    closes: "Jun 30",
    tag: "501(c)(3)",
    accent: true,
  },
  {
    score: 91,
    scoreColor: "green",
    title: "Community Health & Education Grant",
    agency: "Robert Wood Johnson Foundation",
    type: "",
    amount: "$150,000",
    reason: "History of funding education-health programs...",
    closes: "Aug 15",
    tag: "Rolling basis",
  },
  {
    score: 84,
    scoreColor: "green",
    title: "After-School Programs Fund",
    agency: "San Diego Community Foundation",
    type: "",
    amount: "$75,000",
    reason: "Local foundation with strong youth track record...",
    closes: "Sep 1",
    tag: "LOI required",
  },
  {
    score: 79,
    scoreColor: "amber",
    title: "Equity in Education Grant",
    agency: "Bill & Melinda Gates Foundation",
    type: "",
    amount: "$500,000",
    reason: "Matches educational equity mission focus...",
    closes: "Oct 15",
    tag: "501(c)(3)",
  },
  {
    score: 73,
    scoreColor: "amber",
    title: "Neighborhood Youth Initiative",
    agency: "California Wellness Foundation",
    type: "",
    amount: "$60,000",
    reason: "Geographic match with San Diego County...",
    closes: "Nov 1",
    tag: "CA nonprofits only",
  },
  {
    score: 68,
    scoreColor: "amber",
    title: "Arts & Youth Development",
    agency: "National Endowment for the Arts",
    type: "",
    amount: "$40,000",
    reason: "Secondary match on youth development...",
    closes: "Dec 1",
    tag: "501(c)(3)",
  },
];

const scoreBg: Record<string, string> = {
  high: "bg-score-high-bg text-score-high",
  green: "bg-score-green-bg text-score-green",
  amber: "bg-score-amber-bg text-score-amber",
};

const MatchResults = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav currentStep={1} />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Match results
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing 6 opportunities
            </p>
          </div>
          <div className="relative">
            <select className="appearance-none rounded-lg border border-input bg-card px-3.5 py-2 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
              <option>Sort by match score</option>
              <option>Sort by amount</option>
              <option>Sort by deadline</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {grants.map((g) => (
            <div
              key={g.title}
              className={`flex flex-col rounded-2xl border border-border bg-card p-5 ${
                g.accent ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreBg[g.scoreColor]}`}
                >
                  {g.score}%
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {g.amount}
                </span>
              </div>

              <h3 className="mb-1 text-sm font-semibold leading-snug text-foreground">
                {g.title}
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                {g.agency}
                {g.type ? ` · ${g.type}` : ""}
              </p>

              <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground">
                "{g.reason}"
              </p>

              <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Closes {g.closes}</span>
                <span>·</span>
                <span>{g.tag}</span>
              </div>

              <button className="flex items-center justify-center gap-1.5 rounded-lg border border-primary bg-card px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                Draft outreach
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MatchResults;
