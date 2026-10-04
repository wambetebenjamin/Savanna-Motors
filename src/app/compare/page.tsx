import type { Metadata } from "next";
import { CompareTable } from "@/components/CompareTable";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Compare cars side by side",
  description:
    "Compare up to three cars from the Savanna Motors inventory — price, mileage, engine, transmission, fuel, body type and colour, side by side.",
};

export default function ComparePage() {
  return (
    <>
      <PageHeader
        eyebrow="Comparison Tool"
        title="Compare up to three cars"
        lead="Your selection is kept for this browsing session, so you can keep adding cars as you browse the inventory."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Compare" }]}
        photo="extSilverMerc"
      />

      <section className="sm-section">
        <div className="sm-container">
          <CompareTable />
        </div>
      </section>
    </>
  );
}
