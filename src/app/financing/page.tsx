import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Banknote, Clock4, FileCheck2 } from "lucide-react";
import { FinancingCalculator } from "@/components/FinancingCalculator";
import { PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Car financing in Kenya — calculator and application",
  description:
    "Work out your monthly car repayment in KES and apply for asset finance through the banks on the Savanna Motors panel. Deposits from 20%, terms 12 to 60 months.",
};

const STEPS = [
  {
    icon: Banknote,
    title: "1. Set your deposit",
    body: "Most banks want 20% to 30% down. The calculator shows exactly what each level does to the monthly figure.",
  },
  {
    icon: FileCheck2,
    title: "2. Send the documents",
    body: "ID, KRA PIN, three months of payslips or six months of bank statements. Company buyers add CR12 and certificate of incorporation.",
  },
  {
    icon: Clock4,
    title: "3. Approval in ~48 hours",
    body: "We run your application past the banks on our panel in parallel, so you get the best offer rather than the first one.",
  },
  {
    icon: BadgeCheck,
    title: "4. Collect the car",
    body: "Insurance, logbook transfer and NTSA registration handled at the showroom. You drive out the same day.",
  },
];

export default function FinancingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Financing"
        title="Finance your next car"
        lead={`Asset finance from ${SITE.paymentPartners.length} partners, indicative rates from ${SITE.financeRateDefault}% per annum on a reducing balance.`}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Financing" }]}
        photo="extBlackSuvCity"
      />

      <section className="sm-section">
        <div className="sm-container">
          <SectionHead
            eyebrow="Calculator"
            title="What will it cost per month?"
            lead="Everything here runs in your browser — nothing is submitted until you press apply."
          />
          <FinancingCalculator />
        </div>
      </section>

      <section className="sm-section sm-section--light">
        <div className="sm-container">
          <SectionHead
            eyebrow="How it works"
            title="Four steps from enquiry to number plates"
            center
          />
          <div className="sm-usp">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} index={index} step={70}>
                <article className="sm-usp__item">
                  <span className="sm-usp__icon">
                    <step.icon size={22} aria-hidden="true" />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sm-section">
        <div className="sm-container">
          <SectionHead
            eyebrow="Finance Partners"
            title="Banks and payment partners we work with"
            lead="We are not tied to a single lender. Your application goes to the panel and you choose the offer."
          />
          <div className="sm-footer__partners" style={{ gap: "var(--sm-space-2)" }}>
            {SITE.paymentPartners.map((p) => (
              <span
                key={p}
                className="sm-footer__partner"
                style={{ borderColor: "var(--sm-border-strong)", color: "var(--sm-secondary)" }}
              >
                {p}
              </span>
            ))}
          </div>

          <p style={{ marginTop: "var(--sm-space-4)" }}>
            Not sure which car fits the repayment you have in mind?{" "}
            <Link href="/cars" style={{ color: "var(--sm-primary)", fontWeight: 500 }}>
              Browse the inventory
            </Link>{" "}
            and we will match a car to your budget.
          </p>
        </div>
      </section>
    </>
  );
}
