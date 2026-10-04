import type { Metadata } from "next";
import { Wrench } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { ServiceCentre } from "@/components/ServiceCentre";
import { Photo } from "@/components/Photo";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Service centre — Mombasa Road, Nairobi",
  description:
    "Full service, oil change, brake check, tyre replacement, diagnostics and body work at the Savanna Motors service centre on Mombasa Road, Nairobi.",
};

export default function ServicePage() {
  return (
    <>
      <PageHeader
        eyebrow="Service Centre"
        title="Service, diagnostics and body work"
        lead="Behind the showroom sits a six-bay workshop with multi-brand diagnostic equipment and technicians who have been with us for years."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Service Centre" }]}
        photo="serviceMechanic"
      />

      <section className="sm-section">
        <div className="sm-container">
          <SectionHead
            eyebrow="What we do"
            title="Book a slot in under a minute"
            lead="Pick a service, choose a drop-off time and we will confirm on WhatsApp. Courtesy shuttle to the CBD on request."
          />
          <ServiceCentre />
        </div>
      </section>

      <section className="sm-section sm-section--light">
        <div className="sm-container">
          <div className="sm-contact-grid">
            <div style={{ position: "relative", aspectRatio: "16 / 11", overflow: "hidden" }}>
              <Photo
                name="serviceMechanic"
                alt="Technician inspecting a raised vehicle in the workshop"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
            <div>
              <span className="sm-eyebrow">Our promise</span>
              <h2>No surprises on the invoice</h2>
              <p>
                We photograph anything we recommend replacing and send you the quote before
                we start. If the car does not need the work, we say so.
              </p>
              <ul style={{ display: "grid", gap: 10, marginTop: "var(--sm-space-4)" }}>
                {[
                  "Genuine and OEM-equivalent parts only, with the part number on the invoice",
                  "Written health report after every service, emailed the same day",
                  "Warranty on all workmanship for 5,000 km or three months",
                  `Service bookings confirmed on WhatsApp at ${SITE.phoneDisplay}`,
                ].map((item) => (
                  <li key={item} style={{ display: "flex", gap: 10, fontSize: "var(--sm-fs-body-sm)" }}>
                    <Wrench
                      size={16}
                      aria-hidden="true"
                      style={{ color: "var(--sm-primary)", flex: "none", marginTop: 2 }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
