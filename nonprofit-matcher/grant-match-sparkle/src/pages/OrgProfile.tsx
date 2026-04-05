import { ArrowRight, ChevronDown } from "lucide-react";
import TopNav from "@/components/TopNav";
import { useState } from "react";

const focusAreas = [
  "Education",
  "Health",
  "Housing",
  "Environment",
  "Arts & Culture",
  "Youth & Families",
  "Food Security",
];

const OrgProfile = () => {
  const [selectedArea, setSelectedArea] = useState("Education");

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

          <div className="space-y-5">
            {/* Org name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Organization name
              </label>
              <input
                type="text"
                placeholder="e.g. San Diego Youth Alliance"
                className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {/* EIN */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                EIN number
              </label>
              <input
                type="text"
                placeholder="XX-XXXXXXX"
                className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {/* Mission */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Mission statement
              </label>
              <textarea
                rows={4}
                placeholder="Describe your organization's mission and goals..."
                className="w-full resize-none rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {/* Focus area chips */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Focus area
              </label>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      selectedArea === area
                        ? "border-transparent bg-chip-selected text-chip-selected-foreground"
                        : "border-border bg-card text-foreground hover:bg-accent"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Annual budget */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Annual budget
              </label>
              <div className="relative">
                <select className="w-full appearance-none rounded-lg border border-input bg-card px-3.5 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
                  <option>Under $250,000</option>
                  <option>$250,000 – $1M</option>
                  <option>$1M – $5M</option>
                  <option>$5M+</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Geographic focus */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Geographic focus
              </label>
              <input
                type="text"
                placeholder="e.g. San Diego County, CA"
                className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          {/* CTA */}
          <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Find matching grants
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default OrgProfile;
