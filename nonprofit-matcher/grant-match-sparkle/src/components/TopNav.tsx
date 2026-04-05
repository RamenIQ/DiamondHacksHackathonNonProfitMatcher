import { Check } from "lucide-react";

interface TopNavProps {
  currentStep: number;
}

const steps = ["Org profile", "Match results", "Outreach"];

const TopNav = ({ currentStep }: TopNavProps) => {
  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <span className="text-lg font-semibold tracking-tight text-foreground">
          GrantMatch
        </span>

        <div className="hidden items-center gap-1 sm:flex">
          {steps.map((step, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step} className="flex items-center gap-1">
                {i > 0 && (
                  <div
                    className={`mx-2 h-px w-8 ${
                      i <= currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                        ? "border-2 border-primary text-primary"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      isCurrent
                        ? "font-medium text-foreground"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-20" />
      </div>
    </nav>
  );
};

export default TopNav;
