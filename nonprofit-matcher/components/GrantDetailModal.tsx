"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ApplicantType {
  id: string;
  description: string;
}

interface FundingInstrument {
  id: string;
  description: string;
}

interface FundingCategory {
  id: string;
  description: string;
}

interface Grant {
  id: string;
  opportunity_number: string;
  title: string;
  agency_code: string;
  agency_name: string | null;
  status: string;
  posted_date: string;
  closing_date: string | null;
  award_floor: string;
  award_ceiling: string;
  cost_sharing: boolean;
  applicant_types: ApplicantType[];
  funding_instruments: FundingInstrument[];
  funding_categories: FundingCategory[];
  aln_codes: string[];
  description: string;
  source: string;
}

interface GrantDetailModalProps {
  grant: Grant;
  onClose: () => void;
  onDraftOutreach: (grant: Grant) => void;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: string | null): string {
  if (!value || value === "none" || value === "0") return "Not specified";
  const num = parseInt(value, 10);
  if (isNaN(num) || num === 0) return "Not specified";
  return "$" + num.toLocaleString("en-US");
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Not specified";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getBadgeStyle(status: string): { bg: string; text: string } {
  switch (status?.toLowerCase()) {
    case "posted":
      return { bg: "#EAF3DE", text: "#27500A" };
    case "closed":
      return { bg: "#FEE2E2", text: "#991B1B" };
    case "forecasted":
      return { bg: "#FEF3C7", text: "#92400E" };
    default:
      return { bg: "#f3f4f6", text: "#6b7280" };
  }
}

function isClosingDateExpired(closingDate: string | null): boolean {
  if (!closingDate) return true;
  try {
    return new Date(closingDate) < new Date();
  } catch {
    return false;
  }
}

// ── component ─────────────────────────────────────────────────────────────────

export default function GrantDetailModal({ grant, onClose, onDraftOutreach }: GrantDetailModalProps) {
  const [expanded, setExpanded] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const oppUrl = `https://www.grants.gov/search-results-detail/${grant.id}`;
  const cleanDescription = stripHtml(grant.description);
  const truncateLimit = 400;
  const shouldTruncate = cleanDescription.length > truncateLimit;
  const displayedDescription =
    !expanded && shouldTruncate
      ? cleanDescription.slice(0, truncateLimit) + "…"
      : cleanDescription;

  const statusBadge = getBadgeStyle(grant.status);
  const fundingInstrument = grant.funding_instruments?.[0]?.description || "—";
  const fundingCategory = grant.funding_categories?.[0]?.description || "—";
  const closingExpired = isClosingDateExpired(grant.closing_date);

  // Escape key + focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();
    const previouslyFocused = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [handleKeyDown]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  // Eligibility items
  const applicantTypes = grant.applicant_types || [];
  const isUnrestricted =
    applicantTypes.length === 0 ||
    applicantTypes.some((a) => a.description?.toLowerCase().includes("unrestricted"));
  const eligibilityItems: string[] = isUnrestricted
    ? ["Open to all entity types", "Subject to additional eligibility clarification"]
    : applicantTypes.map((a) => a.description);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="grant-modal-title"
    >
      <div
        ref={modalRef}
        className="relative flex w-full flex-col overflow-hidden rounded-xl bg-white"
        style={{
          maxWidth: 620,
          maxHeight: "90vh",
          border: "0.5px solid #e5e7eb",
          borderRadius: 12,
        }}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0"
          style={{
            padding: "20px 24px 16px",
            borderBottom: "0.5px solid #e5e7eb",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left: opportunity number, title, badges */}
            <div className="min-w-0 flex-1">
              <p
                style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 11,
                  color: "#9ca3af",
                  marginBottom: 4,
                }}
              >
                {grant.opportunity_number}
              </p>
              <h2
                id="grant-modal-title"
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: "#111827",
                  marginBottom: 10,
                }}
              >
                {stripHtml(grant.title)}
              </h2>
              {/* Pill badges */}
              <div className="flex flex-wrap gap-2">
                {/* Status */}
                <span
                  style={{
                    backgroundColor: statusBadge.bg,
                    color: statusBadge.text,
                    borderRadius: 9999,
                    padding: "3px 10px",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {grant.status
                    ? grant.status.charAt(0).toUpperCase() + grant.status.slice(1)
                    : "Unknown"}
                </span>
                {/* Funding instrument */}
                <span
                  style={{
                    backgroundColor: "#E6F1FB",
                    color: "#0C447C",
                    borderRadius: 9999,
                    padding: "3px 10px",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {fundingInstrument}
                </span>
                {/* Category */}
                <span
                  style={{
                    backgroundColor: "#f3f4f6",
                    color: "#6b7280",
                    border: "0.5px solid #e5e7eb",
                    borderRadius: 9999,
                    padding: "3px 10px",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {fundingCategory}
                </span>
              </div>
            </div>

            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close modal"
              className="flex-shrink-0 hover:bg-gray-50 transition-colors"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: "0.5px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "white",
                cursor: "pointer",
                fontSize: 16,
                color: "#6b7280",
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────────── */}
        <div
          className="overflow-y-auto"
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxHeight: 420,
          }}
        >
          {/* Section 1: General Information */}
          <section>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              General Information
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[
                {
                  label: "Opportunity No.",
                  value: grant.opportunity_number,
                  mono: true,
                },
                {
                  label: "Agency",
                  value: grant.agency_name || grant.agency_code || "—",
                },
                {
                  label: "Posted Date",
                  value: formatDate(grant.posted_date),
                },
                {
                  label: "Closing Date",
                  value: grant.closing_date ? formatDate(grant.closing_date) : "Not specified",
                  red: closingExpired,
                },
                {
                  label: "Cost Sharing",
                  value: grant.cost_sharing ? "Yes" : "No",
                },
                {
                  label: "Source",
                  value: grant.source || "grants.gov",
                },
              ].map(({ label, value, mono, red }) => (
                <div key={label}>
                  <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>{label}</p>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: mono ? 400 : 500,
                      color: red ? "#dc2626" : "#111827",
                      fontFamily: mono ? "ui-monospace, monospace" : undefined,
                      wordBreak: "break-word",
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: 0, borderTop: "0.5px solid #e5e7eb" }} />

          {/* Section 2: Funding Details */}
          <section>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              Funding Details
            </p>

            {/* Metric cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[
                { label: "Award Floor", value: formatCurrency(grant.award_floor) },
                { label: "Award Ceiling", value: formatCurrency(grant.award_ceiling) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    backgroundColor: "#f9fafb",
                    borderRadius: 8,
                    padding: "12px 14px",
                  }}
                >
                  <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 20, fontWeight: 500, color: "#111827" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Grid fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>Funding Instrument</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                  {grant.funding_instruments?.map((fi) => fi.description).join(", ") || "—"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>Funding Category</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                  {grant.funding_categories?.map((fc) => fc.description).join(", ") || "—"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>ALN Codes</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                  {grant.aln_codes?.length
                    ? grant.aln_codes.join(", ")
                    : <span style={{ color: "#9ca3af", fontWeight: 400 }}>Not listed</span>}
                </p>
              </div>
            </div>
          </section>

          <div style={{ height: 0, borderTop: "0.5px solid #e5e7eb" }} />

          {/* Section 3: Eligibility */}
          <section>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              Eligibility
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {eligibilityItems.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div
                    style={{
                      flexShrink: 0,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: "#EAF3DE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4l2.5 2.5L9 1"
                        stroke="#27500A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: 0, borderTop: "0.5px solid #e5e7eb" }} />

          {/* Section 4: Description */}
          <section>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              Description
            </p>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
              {displayedDescription}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setExpanded((v) => !v)}
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: "#1d6fb8",
                  fontWeight: 500,
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </section>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0"
          style={{
            padding: "14px 24px",
            borderTop: "0.5px solid #e5e7eb",
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
          }}
        >
          <a
            href={oppUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              border: "0.5px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 18px",
              fontSize: 13,
              color: "#374151",
              background: "white",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            View on Grants.gov
          </a>
          <button
            onClick={() => onDraftOutreach(grant)}
            style={{
              backgroundColor: "#1d6fb8",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#185FA5")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1d6fb8")}
          >
            Draft outreach →
          </button>
        </div>
      </div>
    </div>
  );
}
