import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { SITE } from "@/data/site";
import { waLink, WA_DEFAULT_MESSAGE } from "@/lib/notify";

export const metadata: Metadata = {
  title: "Contact & showroom — Mombasa Road, Nairobi",
  description:
    "Visit the Savanna Motors showroom on Mombasa Road, Nairobi. Phone, WhatsApp, email, opening hours, directions and a general enquiry form.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Come and see the cars"
        lead="Free parking on site, test drives on the Southern Bypass, and someone at the desk every day of the week."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        photo="heroNairobiDusk"
      />

      <section className="sm-section">
        <div className="sm-container">
          <div className="sm-contact-grid">
            <div>
              <iframe
                className="sm-map"
                title="Savanna Motors showroom location on Mombasa Road, Nairobi"
                src="https://www.google.com/maps?q=Mombasa%20Road%2C%20Nairobi%2C%20Kenya&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <a
                className="sm-btn sm-btn--outline sm-btn--sm"
                style={{ marginTop: "var(--sm-space-3)" }}
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  SITE.address.full,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin size={14} aria-hidden="true" />
                Get directions
              </a>

              <div
                style={{
                  display: "grid",
                  gap: "var(--sm-space-2)",
                  marginTop: "var(--sm-space-4)",
                  fontSize: "var(--sm-fs-body-sm)",
                }}
              >
                <span style={{ display: "flex", gap: 10 }}>
                  <MapPin size={16} aria-hidden="true" style={{ color: "var(--sm-primary)" }} />
                  {SITE.address.full}
                </span>
                <a href={`tel:${SITE.phone}`} style={{ display: "flex", gap: 10 }}>
                  <PhoneCall size={16} aria-hidden="true" style={{ color: "var(--sm-primary)" }} />
                  {SITE.phoneDisplay}
                </a>
                <a
                  href={waLink(WA_DEFAULT_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", gap: 10 }}
                >
                  <MessageCircle size={16} aria-hidden="true" style={{ color: "var(--sm-primary)" }} />
                  WhatsApp the sales desk
                </a>
                <a href={`mailto:${SITE.email}`} style={{ display: "flex", gap: 10 }}>
                  <Mail size={16} aria-hidden="true" style={{ color: "var(--sm-primary)" }} />
                  {SITE.email}
                </a>
                <a href={`mailto:${SITE.serviceEmail}`} style={{ display: "flex", gap: 10 }}>
                  <Mail size={16} aria-hidden="true" style={{ color: "var(--sm-primary)" }} />
                  {SITE.serviceEmail} (workshop)
                </a>
              </div>

              <h2 style={{ fontSize: "1.25rem", marginTop: "var(--sm-space-5)" }}>
                Opening hours
              </h2>
              <table className="sm-hours">
                <tbody>
                  {SITE.hours.map((h) => (
                    <tr key={h.day}>
                      <th scope="row">
                        <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                          <Clock size={14} aria-hidden="true" style={{ color: "var(--sm-primary)" }} />
                          {h.day}
                        </span>
                      </th>
                      <td>{h.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                border: "1px solid var(--sm-border)",
                padding: "var(--sm-space-4)",
                boxShadow: "var(--sm-shadow-sm)",
              }}
            >
              <h2 style={{ marginTop: 0, fontSize: "1.5rem" }}>General enquiry</h2>
              <p style={{ fontSize: "var(--sm-fs-body-sm)" }}>
                Tell us the car you want, the budget and whether you need financing. We
                reply within one working day — usually much sooner on WhatsApp.
              </p>
              <EnquiryForm subject="Contact page enquiry" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
