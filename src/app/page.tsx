import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Clock,
  GitCompareArrows,
  Mail,
  MapPin,
  MessageCircle,
  PhoneCall,
  Repeat,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Hero } from "@/components/Hero";
import { CarGrid } from "@/components/CarGrid";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { FinancingCalculator } from "@/components/FinancingCalculator";
import { TradeInForm } from "@/components/forms/TradeInForm";
import { ServiceCentre } from "@/components/ServiceCentre";
import { Testimonials } from "@/components/Testimonials";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Photo } from "@/components/Photo";
import { CARS } from "@/data/cars";
import { POSTS, STATS, USPS } from "@/data/content";
import { SITE } from "@/data/site";
import { formatDate } from "@/lib/format";

export const revalidate = 300;

const USP_ICON = {
  "check-circle": CheckCircle2,
  calculator: Calculator,
  wrench: Wrench,
  repeat: Repeat,
} as const;

export default function HomePage() {
  const featured = CARS.filter((c) => c.featured).slice(0, 8);

  return (
    <>
      <Hero />

      {/* ------------------------------------------------ Featured vehicles */}
      <section className="sm-section" id="featured">
        <div className="sm-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "var(--sm-space-4)",
              flexWrap: "wrap",
            }}
          >
            <SectionHead
              eyebrow="Featured Vehicles"
              title="Cars on the floor this week"
              lead="Every used car is 120-point certified, odometer verified and sold with a three-year powertrain warranty."
            />
            <Link
              href="/cars"
              className="sm-btn sm-btn--outline"
              style={{ marginBottom: "var(--sm-space-5)" }}
            >
              View all inventory
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <CarGrid cars={featured} />
        </div>
      </section>

      {/* ------------------------------------------------ Why choose + stats */}
      <section className="sm-section sm-section--light" id="why">
        <div className="sm-container">
          <SectionHead
            eyebrow="Why Savanna Motors"
            title="Twelve years on Mombasa Road, and still here"
            lead="We sell cars we would put our own families in, and we are still open when something goes wrong."
            center
          />

          <div className="sm-usp">
            {USPS.map((usp, index) => {
              const Icon = USP_ICON[usp.icon];
              return (
                <Reveal key={usp.title} index={index} step={70}>
                  <article className="sm-usp__item">
                    <span className="sm-usp__icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <h3>{usp.title}</h3>
                    <p>{usp.body}</p>
                  </article>
                </Reveal>
              );
            })}
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

      {/* ------------------------------------------------ Financing */}
      <section className="sm-section" id="financing">
        <div className="sm-container">
          <SectionHead
            eyebrow="Financing"
            title="Work out the monthly repayment before you commit"
            lead="Drag the sliders — the installment recalculates instantly, right here in your browser. Nothing is sent anywhere until you choose to apply."
          />
          <FinancingCalculator />
        </div>
      </section>

      {/* ------------------------------------------------ Compare */}
      <section className="sm-section sm-section--dark" id="compare">
        <div className="sm-container">
          <div className="sm-cta-split">
            <div>
              <span className="sm-eyebrow">Comparison Tool</span>
              <h2>Put three cars side by side</h2>
              <p className="sm-lead" style={{ color: "var(--sm-white)", opacity: 0.85 }}>
                Tick <strong>Compare</strong> on any listing and we line the specs up
                column by column — price, mileage, engine, transmission, fuel, body type
                and colour — so the decision makes itself.
              </p>
            </div>
            <Link href="/compare" className="sm-btn sm-btn--on-dark">
              <GitCompareArrows size={15} aria-hidden="true" />
              Open comparison
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Trade-in */}
      <section className="sm-section" id="trade-in">
        <div className="sm-container">
          <div
            className="sm-contact-grid"
            style={{ alignItems: "start" }}
          >
            <div>
              <SectionHead
                eyebrow="Trade-In"
                title="Sell or trade in your current car"
                lead="Bring it to Mombasa Road or send us the details and we will come to you. Free valuation, no obligation, and the offer is valid for seven days."
              />
              <div
                style={{
                  position: "relative",
                  aspectRatio: "16 / 10",
                  overflow: "hidden",
                }}
              >
                <Photo
                  name="coupleDealership"
                  alt="A couple discussing a car purchase with a salesperson"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            </div>

            <div
              style={{
                border: "1px solid var(--sm-border)",
                padding: "var(--sm-space-4)",
                boxShadow: "var(--sm-shadow-sm)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Get a free valuation</h3>
              <TradeInForm />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Service centre */}
      <section className="sm-section sm-section--light" id="service">
        <div className="sm-container">
          <SectionHead
            eyebrow="Service Centre"
            title="Servicing, diagnostics and body work on site"
            lead="Our workshop sits behind the showroom. Genuine parts, multi-brand diagnostic equipment and a written report on every job."
          />
          <ServiceCentre />
        </div>
      </section>

      {/* ------------------------------------------------ Testimonials */}
      <section className="sm-section" id="testimonials">
        <div className="sm-container">
          <SectionHead
            eyebrow="Customer Stories"
            title="What Kenyan buyers say"
            center
          />
          <Testimonials />
        </div>
      </section>

      {/* ------------------------------------------------ Blog */}
      <section className="sm-section sm-section--light" id="blog">
        <div className="sm-container">
          <SectionHead
            eyebrow="Guides & Advice"
            title="Read before you buy"
            lead="Buying guides, maintenance schedules and financing advice written for Kenyan roads and Kenyan banks."
          />

          <div className="sm-posts">
            {POSTS.map((post, index) => (
              <Reveal key={post.slug} index={index} step={70}>
                <article className="sm-post sm-card">
                  <Link href={`/blog/${post.slug}`} className="sm-post__media">
                    <Photo
                      name={post.photo}
                      alt={post.title}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </Link>
                  <div className="sm-post__body">
                    <p className="sm-meta" style={{ marginBottom: 6 }}>
                      {post.category} · {formatDate(post.date)} · {post.readMinutes} min
                      read
                    </p>
                    <h3 style={{ fontSize: "1.125rem" }}>
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p style={{ fontSize: "var(--sm-fs-body-sm)" }}>{post.excerpt}</p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="sm-btn sm-btn--ghost sm-btn--sm"
                    >
                      Read article
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Contact & showroom */}
      <section className="sm-section" id="contact">
        <div className="sm-container">
          <SectionHead
            eyebrow="Visit the Showroom"
            title="Mombasa Road, Nairobi"
            lead="Free parking, test drives on the bypass and tea while the paperwork is prepared."
          />

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
                <a href={`mailto:${SITE.email}`} style={{ display: "flex", gap: 10 }}>
                  <Mail size={16} aria-hidden="true" style={{ color: "var(--sm-primary)" }} />
                  {SITE.email}
                </a>
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", gap: 10 }}
                >
                  <MessageCircle
                    size={16}
                    aria-hidden="true"
                    style={{ color: "var(--sm-primary)" }}
                  />
                  WhatsApp {SITE.phoneDisplay}
                </a>
              </div>

              <table className="sm-hours" style={{ marginTop: "var(--sm-space-4)" }}>
                <caption className="sm-visually-hidden">Opening hours</caption>
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
              <h3 style={{ marginTop: 0 }}>Send a general enquiry</h3>
              <p style={{ fontSize: "var(--sm-fs-body-sm)" }}>
                Tell us what you are looking for and your budget — we will come back with
                two or three options, including cars not yet listed online.
              </p>
              <EnquiryForm subject="General enquiry" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
