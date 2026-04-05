import { ArrowLeft, RotateCcw } from "lucide-react";
import TopNav from "@/components/TopNav";

const EmailOutreach = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav currentStep={2} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* Back link */}
        <button className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </button>

        {/* Funder header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
            DE
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Dept. of Education
            </h1>
            <p className="text-sm text-muted-foreground">
              Youth Development Initiative · $250,000
            </p>
          </div>
        </div>

        {/* Email form */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                To
              </label>
              <input
                type="text"
                placeholder=""
                className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Subject
              </label>
              <input
                type="text"
                placeholder=""
                className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Email draft
            </label>
            <textarea
              rows={10}
              placeholder="Your outreach email will appear here"
              className="w-full resize-none rounded-lg border border-input bg-card px-3.5 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Send email
            </button>
            <button className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
              Edit draft
            </button>
            <button className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
              <RotateCcw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailOutreach;
