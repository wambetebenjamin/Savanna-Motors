"use client";

import { useMemo, useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { FlipNumber } from "@/components/FlipNumber";
import { Modal } from "@/components/Modal";
import { FinancingForm } from "@/components/forms/FinancingForm";
import { SITE } from "@/data/site";
import { formatKesShort, formatNumber, monthlyInstallment } from "@/lib/format";

/**
 * Entirely client-side: no API call is made while the user drags the sliders.
 * The installment recalculates on every input change and flips digit by digit.
 */
export function FinancingCalculator({
  initialPrice = 3000000,
  carSlug,
  carName,
}: {
  initialPrice?: number;
  carSlug?: string;
  carName?: string;
}) {
  const [price, setPrice] = useState(initialPrice);
  const [deposit, setDeposit] = useState(
    Math.round((initialPrice * SITE.financeDepositDefaultPct) / 100),
  );
  const [term, setTerm] = useState<number>(SITE.financeTermDefaultMonths);
  const [rate, setRate] = useState<number>(SITE.financeRateDefault);

  const principal = Math.max(price - deposit, 0);
  const monthly = useMemo(
    () => monthlyInstallment(principal, rate, term),
    [principal, rate, term],
  );
  const totalRepaid = monthly * term;
  const totalInterest = Math.max(totalRepaid - principal, 0);
  const depositPct = price > 0 ? Math.round((deposit / price) * 100) : 0;

  const [open, setOpen] = useState(false);

  return (
    <div className="sm-calc">
      <div className="sm-calc__panel">
        <div className="sm-field">
          <label className="sm-label" htmlFor="calc-price">
            Car price (KES)
          </label>
          <input
            id="calc-price"
            className="sm-input"
            type="number"
            min={200000}
            max={50000000}
            step={50000}
            value={price}
            onChange={(e) => {
              const next = Number(e.target.value) || 0;
              setPrice(next);
              if (deposit > next) setDeposit(next);
            }}
          />
        </div>

        <div className="sm-field">
          <div className="sm-slider-head">
            <label className="sm-label" htmlFor="calc-deposit">
              Deposit amount (KES)
            </label>
            <output htmlFor="calc-deposit">{depositPct}%</output>
          </div>
          <input
            id="calc-deposit"
            className="sm-input"
            type="number"
            min={0}
            max={price}
            step={25000}
            value={deposit}
            onChange={(e) => setDeposit(Math.min(Number(e.target.value) || 0, price))}
          />
          <input
            className="sm-range"
            type="range"
            min={0}
            max={price}
            step={25000}
            value={deposit}
            aria-label="Deposit slider"
            onChange={(e) => setDeposit(Number(e.target.value))}
          />
        </div>

        <div className="sm-field">
          <div className="sm-slider-head">
            <label className="sm-label" htmlFor="calc-term">
              Loan term
            </label>
            <output htmlFor="calc-term">{term} months</output>
          </div>
          <input
            id="calc-term"
            className="sm-range"
            type="range"
            min={12}
            max={60}
            step={6}
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
          />
        </div>

        <div className="sm-field">
          <div className="sm-slider-head">
            <label className="sm-label" htmlFor="calc-rate">
              Interest rate (p.a. reducing balance)
            </label>
            <output htmlFor="calc-rate">{rate.toFixed(1)}%</output>
          </div>
          <input
            id="calc-rate"
            className="sm-range"
            type="range"
            min={8}
            max={24}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
          <span className="sm-help">
            Pre-filled at {SITE.financeRateDefault}% — the current average Kenyan asset
            finance rate (banks typically quote 14% – 16%).
          </span>
        </div>
      </div>

      <div className="sm-calc__readout">
        <span className="sm-eyebrow" style={{ color: "var(--sm-white)" }}>
          Monthly installment
        </span>
        <FlipNumber value={formatNumber(monthly)} prefix="KES " />

        <dl className="sm-calc__summary">
          <div>
            <dt>Amount financed</dt>
            <dd>{formatKesShort(principal)}</dd>
          </div>
          <div>
            <dt>Deposit</dt>
            <dd>
              {formatKesShort(deposit)} ({depositPct}%)
            </dd>
          </div>
          <div>
            <dt>Total interest</dt>
            <dd>{formatKesShort(totalInterest)}</dd>
          </div>
          <div>
            <dt>Total repayable</dt>
            <dd>{formatKesShort(totalRepaid + deposit)}</dd>
          </div>
        </dl>

        <button
          type="button"
          className="sm-btn sm-btn--primary sm-btn--block"
          style={{ marginTop: "var(--sm-space-4)" }}
          onClick={() => setOpen(true)}
        >
          <Calculator size={15} aria-hidden="true" />
          Apply for Financing
        </button>

        <p
          className="sm-meta"
          style={{ color: "var(--sm-white)", opacity: 0.75, marginTop: "var(--sm-space-3)" }}
        >
          <TrendingUp size={13} aria-hidden="true" style={{ display: "inline", marginRight: 6 }} />
          Indicative only. Facility fees and comprehensive insurance are additional.
        </p>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Apply for financing"
        subtitle={`${formatKesShort(monthly)} per month over ${term} months at ${rate.toFixed(1)}%`}
      >
        <FinancingForm
          carPrice={price}
          deposit={deposit}
          termMonths={term}
          interestRate={rate}
          monthlyEstimate={Math.round(monthly)}
          carSlug={carSlug}
          carName={carName}
        />
      </Modal>
    </div>
  );
}
