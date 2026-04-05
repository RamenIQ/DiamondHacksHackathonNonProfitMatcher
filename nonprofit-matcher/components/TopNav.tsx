"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Bookmark } from "lucide-react";

interface TopNavProps {
  currentStep?: number;
}

const GRANT_STEPS = ["Org profile", "Match results", "Outreach"];

export default function TopNav({ currentStep = 0 }: TopNavProps) {
  const pathname = usePathname();
  const isFundraiser = pathname.startsWith("/fundraiser");

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Grant<span className="text-primary">Match</span>
          </span>
        </Link>

        {/* Saved link */}
        <Link
          href="/saved"
          className={`hidden items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all sm:flex ${
            pathname === "/saved"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          Saved
        </Link>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary p-1">
          <Link
            href="/"
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              !isFundraiser
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="hidden sm:inline">Grant Matching</span>
            <span className="sm:hidden">Grants</span>
          </Link>
          <Link
            href="/fundraiser"
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              isFundraiser
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="hidden sm:inline">Fundraiser Builder</span>
            <span className="sm:hidden">Fundraiser</span>
          </Link>
        </div>

        {/* Grant flow step indicators (desktop) */}
        {!isFundraiser && (
          <div className="hidden items-center lg:flex">
            {GRANT_STEPS.map((step, i) => {
              const isCompleted = i < currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step} className="flex items-center">
                  {i > 0 && (
                    <div className={`mx-3 h-px w-8 rounded-full ${i <= currentStep ? "bg-primary" : "bg-border"}`} />
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                          ? "border-2 border-primary bg-primary/10 text-primary"
                          : "border border-border bg-card text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3 w-3" /> : i + 1}
                    </div>
                    <span className={`text-xs ${isCurrent ? "font-semibold text-foreground" : isCompleted ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {step}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile step dots (grants only) */}
        {!isFundraiser && (
          <div className="flex items-center gap-1.5 lg:hidden">
            {GRANT_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full ${
                  i < currentStep ? "w-4 bg-primary" : i === currentStep ? "w-6 bg-primary" : "w-4 bg-border"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
