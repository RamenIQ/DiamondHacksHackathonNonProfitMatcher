"use client";

import { Check } from "lucide-react";

interface TopNavProps {
  currentStep: number;
}

const steps = ["Org profile", "Match results", "Outreach"];

export default function TopNav({ currentStep }: TopNavProps) {
  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Grant<span className="text-primary">Match</span>
          </span>
        </div>

        {/* Steps */}
        <div className="hidden items-center sm:flex">
          {steps.map((step, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step} className="flex items-center">
                {i > 0 && (
                  <div
                    className={`mx-3 h-px w-10 rounded-full ${
                      i <= currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold shadow-sm ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                        ? "border-2 border-primary bg-primary/10 text-primary"
                        : "border border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      isCurrent
                        ? "font-semibold text-foreground"
                        : isCompleted
                        ? "font-medium text-foreground"
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

        {/* Mobile step indicator */}
        <div className="flex items-center gap-1.5 sm:hidden">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full ${
                i < currentStep
                  ? "w-4 bg-primary"
                  : i === currentStep
                  ? "w-6 bg-primary"
                  : "w-4 bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
