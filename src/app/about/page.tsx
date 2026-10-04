import type { Metadata } from "next";
import { CheckCircle2, MapPin, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { CountUp } from "@/components/CountUp";
import { Photo } from "@/components/Photo";
import { Testimonials } from "@/components/Testimonials";
import { STATS } from "@/data/content";

export const metadata: Metadata = {
  title: "About Savanna Motors",
  description:
    "Twelve years selling new and certified used cars on Mombasa Road, Nairobi — with financing, trade-ins and a full service centre under one roof.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title="A Nairobi dealership that stays around after the sale"
        lead="Founded in 2014 on Mombasa Road, Savanna Motors has handed over more than 500 cars to Kenyan families, companies and first-time owners."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
        photo="heroNairobiAerial"
      />

      <section className="sm-section">
        <div className="sm-container">
          <div className="sm-contact-grid">
            <div style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden" }}>
              <Photo
                name="showroomRow"
                alt="Cars lined up inside the showroom"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
            <div>
              <span className="sm-eyebrow">Our story</span>
              <h2>From one yard to a full motor centre</h2>
              <p>
                We started with eight cars on a leased yard off Mombasa Road. What grew the
                business was not advertising — it was handing buyers the inspection report
                before they asked for it, and still answering the phone two years later.
              </p>
              <p>
                Today the site holds a showroom, a six-bay workshop, a body shop and a
                finance desk that works with seven Kenyan banks. Fleet customers from
                Nairobi, Eldoret and Mombasa run their vehicles on our service schedule.
              </p>
              <ul style={{ display: "grid", gap: 10, marginTop: "var(--sm-space-4)" }}>
                {[
                  "120-point inspection on every used car before it is listed",
                  "Odometer and import documentation verified against the auction sheet",
                  "Three-year powertrain warranty on certified units",
                  "Trade-ins valued free, offer valid for seven days",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", gap: 10, fontSize: "var(--sm-fs-body-sm)" }}>
                    <CheckCircle2
                      size={16}
                      aria-hidden="true"
                      style={{ color: "var(--sm-primary)", flex: "none", marginTop: 2 }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p style={{ display: "flex", gap: 10, marginTop: "var(--sm-space-4)" }}>
                <MapPin size={16} aria-hidden="true" style={{ color: "var(--sm-primary)" }} />
                Savanna Motors Centre, Mombasa Road, Nairobi
              </p>
            </div>
          </div>

          <div className="sm-stats">
            {STATS.map((stat) => (
              <div key={stat.label} className="sm-stat">
                <span className="sm-stat__value">
                  <TrendingUp
                    size={18}
                    aria-hidden="true"
                    style={{ marginRight: 8, color: "var(--sm-primary)" }}
                  />
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    decimals={"decimals" in stat ? (stat.decimals as number) : 0}
                  />
                </span>
                <span className="sm-stat__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sm-section sm-section--light">
        <div className="sm-container">
          <SectionHead eyebrow="Customer Stories" title="In their words" center />
          <Testimonials />
        </div>
      </section>
    </>
  );
}
