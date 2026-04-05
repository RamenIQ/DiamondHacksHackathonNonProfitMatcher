"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface DonationModalProps {
  orgName: string;
  campaignTitle: string;
  donationTiers: number[];
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

function formatCardNumber(val: string) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export default function DonationModal({
  orgName,
  campaignTitle,
  donationTiers,
  onClose,
  onSuccess,
}: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(donationTiers[1] || 25);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [step, setStep] = useState<"amount" | "payment" | "success">("amount");
  const [processing, setProcessing] = useState(false);

  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "", email: "" });
  const [errors, setErrors] = useState<Partial<typeof card>>({});

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const finalAmount = isCustom
    ? parseFloat(customAmount) || 0
    : selectedAmount;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function validate() {
    const errs: Partial<typeof card> = {};
    if (!card.name.trim()) errs.name = "Required";
    if (!card.email.includes("@")) errs.email = "Valid email required";
    if (card.number.replace(/\s/g, "").length < 16) errs.number = "Invalid card number";
    if (card.expiry.length < 5) errs.expiry = "Invalid expiry";
    if (card.cvv.length < 3) errs.cvv = "Invalid CVV";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setProcessing(false);
    setStep("success");
    onSuccess(finalAmount);
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ maxWidth: 460, maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Donating to</p>
            <h2 className="text-base font-semibold text-gray-900 leading-snug">{orgName}</h2>
            <p className="text-sm text-gray-500 mt-0.5 leading-snug line-clamp-1">{campaignTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(92vh - 80px)" }}>
          {/* Step: Amount */}
          {step === "amount" && (
            <div className="px-6 py-6">
              <p className="mb-4 text-sm font-medium text-gray-700">Choose an amount</p>

              {/* Tier grid */}
              <div className="mb-4 grid grid-cols-3 gap-2.5">
                {donationTiers.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => { setSelectedAmount(tier); setIsCustom(false); }}
                    className={`rounded-xl border py-3 text-sm font-semibold transition-all ${
                      !isCustom && selectedAmount === tier
                        ? "border-transparent bg-primary text-white shadow-md shadow-primary/20"
                        : "border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    ${tier}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  isCustom ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
                }`}
                onClick={() => setIsCustom(true)}
              >
                <span className="text-sm font-medium text-gray-500">$</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setIsCustom(true); }}
                  className="flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>

              {finalAmount > 0 && (
                <div className="mt-4 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
                  <p className="text-sm text-gray-600">
                    You are donating{" "}
                    <span className="font-bold text-primary">${finalAmount.toLocaleString()}</span> to{" "}
                    <span className="font-medium">{orgName}</span>
                  </p>
                </div>
              )}

              <button
                onClick={() => setStep("payment")}
                disabled={finalAmount <= 0}
                className="mt-5 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue to payment →
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                🔒 Secure donation · Demo mode — no real charges
              </p>
            </div>
          )}

          {/* Step: Payment */}
          {step === "payment" && (
            <form onSubmit={handleSubmit} className="px-6 py-6">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Payment details</p>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                  ${finalAmount.toLocaleString()}
                </span>
              </div>

              <div className="space-y-4">
                {/* Card number */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Card number</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={card.number}
                      onChange={(e) => setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))}
                      className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm font-mono text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-primary/30 ${errors.number ? "border-red-400" : "border-gray-200 focus:border-primary/50"}`}
                    />
                    <svg className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  {errors.number && <p className="mt-1 text-xs text-red-500">{errors.number}</p>}
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Expiry</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                      className={`w-full rounded-xl border px-4 py-3 text-sm font-mono text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-primary/30 ${errors.expiry ? "border-red-400" : "border-gray-200 focus:border-primary/50"}`}
                    />
                    {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">CVV</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="123"
                      maxLength={4}
                      value={card.cvv}
                      onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                      className={`w-full rounded-xl border px-4 py-3 text-sm font-mono text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-primary/30 ${errors.cvv ? "border-red-400" : "border-gray-200 focus:border-primary/50"}`}
                    />
                    {errors.cvv && <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Cardholder name</label>
                  <input
                    type="text"
                    placeholder="Jane Smith"
                    value={card.name}
                    onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-primary/30 ${errors.name ? "border-red-400" : "border-gray-200 focus:border-primary/50"}`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Email for receipt</label>
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    value={card.email}
                    onChange={(e) => setCard((c) => ({ ...c, email: e.target.value }))}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-primary/30 ${errors.email ? "border-red-400" : "border-gray-200 focus:border-primary/50"}`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {processing ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Processing…
                  </>
                ) : (
                  <>
                    🔒 Donate ${finalAmount.toLocaleString()} securely
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("amount")}
                className="mt-3 w-full text-center text-sm text-gray-400 hover:text-gray-600"
              >
                ← Change amount
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                Demo mode — no real charges will be made
              </p>
            </form>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Thank you!</h3>
              <p className="mb-1 text-2xl font-bold text-primary">${finalAmount.toLocaleString()}</p>
              <p className="mb-5 text-sm text-gray-500">
                Your donation to <span className="font-semibold text-gray-700">{orgName}</span> has been received.
              </p>
              <div className="w-full rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-left">
                <p className="text-xs font-semibold text-green-800 mb-1">Receipt sent to</p>
                <p className="text-sm text-green-700">{card.email}</p>
              </div>
              <button
                onClick={onClose}
                className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
