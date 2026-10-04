import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  PhoneCall,
  Twitter,
  Youtube,
} from "lucide-react";
import { SITE } from "@/data/site";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { waLink, WA_DEFAULT_MESSAGE } from "@/lib/notify";

const SOCIAL_ICON = {
  Facebook,
  Instagram,
  X: Twitter,
  LinkedIn: Linkedin,
  YouTube: Youtube,
} as const;

export function Footer() {
  return (
    <footer className="sm-footer">
      <div className="sm-container">
        <div className="sm-footer__grid">
          <div>
            <h4>Savanna Motors</h4>
            <p style={{ fontSize: "var(--sm-fs-body-sm)" }}>
              New and certified used cars, bank-backed financing and a full service
              centre — all on one site on Mombasa Road, Nairobi.
            </p>
            <p className="sm-footer__contact" style={{ fontSize: "var(--sm-fs-body-sm)" }}>
              <span style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <MapPin size={15} aria-hidden="true" /> {SITE.address.full}
              </span>
              <a href={`tel:${SITE.phone}`} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <PhoneCall size={15} aria-hidden="true" /> {SITE.phoneDisplay}
              </a>
              <a
                href={waLink(WA_DEFAULT_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", gap: 8, marginBottom: 6 }}
              >
                <MessageCircle size={15} aria-hidden="true" /> WhatsApp us
              </a>
              <a href={`mailto:${SITE.email}`} style={{ display: "flex", gap: 8 }}>
                <Mail size={15} aria-hidden="true" /> {SITE.email}
              </a>
            </p>

            <div className="sm-footer__social">
              {SITE.social.map((s) => {
                const Icon = SOCIAL_ICON[s.label as keyof typeof SOCIAL_ICON];
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={15} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4>Browse Cars</h4>
            <Link className="sm-footer__link" href="/cars?condition=New">
              New Cars
            </Link>
            <Link className="sm-footer__link" href="/cars?condition=Used">
              Certified Used Cars
            </Link>
            <Link className="sm-footer__link" href="/cars?body=SUV">
              SUVs &amp; Crossovers
            </Link>
            <Link className="sm-footer__link" href="/cars?body=Pickup">
              Pickups &amp; Fleet
            </Link>
            <Link className="sm-footer__link" href="/cars?body=Sedan">
              Sedans
            </Link>
            <Link className="sm-footer__link" href="/cars?fuel=Hybrid,Electric">
              Hybrid &amp; Electric
            </Link>
          </div>

          <div>
            <h4>Services</h4>
            <Link className="sm-footer__link" href="/financing">
              Financing &amp; Calculator
            </Link>
            <Link className="sm-footer__link" href="/service">
              Service Centre
            </Link>
            <Link className="sm-footer__link" href="/#trade-in">
              Trade-In Valuation
            </Link>
            <Link className="sm-footer__link" href="/compare">
              Compare Cars
            </Link>
            <Link className="sm-footer__link" href="/blog">
              Guides &amp; Advice
            </Link>
            <Link className="sm-footer__link" href="/contact">
              Contact &amp; Directions
            </Link>
          </div>

          <div>
            <h4>New Arrivals</h4>
            <p style={{ fontSize: "var(--sm-fs-body-sm)" }}>
              One email a week with the cars that just landed and the finance deals
              attached to them.
            </p>
            <NewsletterForm />

            <h4 style={{ marginTop: "var(--sm-space-4)" }}>Payment Partners</h4>
            <div className="sm-footer__partners">
              {SITE.paymentPartners.map((p) => (
                <span key={p} className="sm-footer__partner">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="sm-footer__copyright">
          <span>
            &copy; {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </span>
          <span>
            Showroom open Mon – Sat · <Link href="/contact">Find us on Mombasa Road</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
