import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calculator, CheckCircle2, MessageCircle } from "lucide-react";
import { Gallery } from "@/components/Gallery";
import { CarCarousel } from "@/components/CarCarousel";
import { SectionHead } from "@/components/SectionHead";
import { BookTestDriveButton } from "@/components/BookTestDriveButton";
import { FinancingCalculator } from "@/components/FinancingCalculator";
import { PHOTOS } from "@/data/generated/photos";
import { CARS, carFullTitle, carTitle, getCar } from "@/data/cars";
import { SITE } from "@/data/site";
import { formatKesShort, formatMileage, formatUsd, monthlyInstallment } from "@/lib/format";
import { kesPerUsd, toUsd } from "@/lib/currency";
import { similarCars } from "@/lib/search";
import { waLink } from "@/lib/notify";

/** ISR — inventory pages revalidate every 5 minutes. */
export const revalidate = 300;

export function generateStaticParams() {
  return CARS.map((car) => ({ slug: car.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const car = getCar(params.slug);
  if (!car) return { title: "Car not found" };

  const title = `${carFullTitle(car)} — ${formatKesShort(car.priceKes)}`;
  const description = `${car.condition} ${carTitle(car)} for sale at Savanna Motors, Mombasa Road Nairobi. ${
    car.condition === "New" ? "Brand new" : formatMileage(car.mileageKm)
  }, ${car.engineLabel}, ${car.transmission}, ${car.fuelType}. ${formatKesShort(car.priceKes)}.`;
  const image = PHOTOS[car.photos[0]].remote;

  return {
    title,
    description,
    alternates: { canonical: `/cars/${car.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE.url}/cars/${car.slug}`,
      images: [{ url: image, width: 1200, height: 800, alt: carTitle(car) }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CarDetailPage({ params }: { params: { slug: string } }) {
  const car = getCar(params.slug);
  if (!car) notFound();

  const { rate, live } = await kesPerUsd();
  const usd = toUsd(car.priceKes, rate);
  const monthly = monthlyInstallment(
    car.priceKes * (1 - SITE.financeDepositDefaultPct / 100),
    SITE.financeRateDefault,
    SITE.financeTermDefaultMonths,
  );

  const waMessage = waLink(
    `Hello Savanna Motors! I would like to enquire about the ${carFullTitle(
      car,
    )} listed at ${formatKesShort(car.priceKes)} (ref ${car.registration}).`,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: carFullTitle(car),
    description: car.summary,
    image: car.photos.map((p) => PHOTOS[p].remote),
    brand: { "@type": "Brand", name: car.make },
    model: car.model,
    vehicleModelDate: String(car.year),
    productionDate: String(car.year),
    itemCondition:
      car.condition === "New"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: car.mileageKm,
      unitCode: "KMT",
    },
    vehicleTransmission: car.transmission,
    fuelType: car.fuelType,
    bodyType: car.bodyType,
    color: car.color,
    driveWheelConfiguration: car.drive,
    vehicleSeatingCapacity: car.seats,
    vehicleEngine: {
      "@type": "EngineSpecification",
      name: car.engineLabel,
      engineDisplacement: car.engineCc
        ? { "@type": "QuantitativeValue", value: car.engineCc, unitCode: "CMQ" }
        : undefined,
    },
    offers: {
      "@type": "Offer",
      price: car.priceKes,
      priceCurrency: "KES",
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/cars/${car.slug}`,
      seller: {
        "@type": "AutoDealer",
        name: SITE.name,
        telephone: SITE.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: SITE.address.street,
          addressLocality: SITE.address.locality,
          addressCountry: SITE.address.country,
        },
      },
    },
  };

  const specs: [string, string][] = [
    ["Make", car.make],
    ["Model", `${car.model} ${car.variant}`],
    ["Year", String(car.year)],
    ["Mileage", car.condition === "New" ? "Brand new (0 km)" : formatMileage(car.mileageKm)],
    ["Engine", car.engineLabel],
    ["Transmission", car.transmission],
    ["Fuel type", car.fuelType],
    ["Body type", car.bodyType],
    ["Colour", car.color],
    ["Condition", car.condition],
    ["Drive", car.drive],
    ["Seats", String(car.seats)],
    ["Registration", car.registration],
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="sm-section">
        <div className="sm-container">
          <ol className="sm-breadcrumb" style={{ color: "var(--sm-body)", marginBottom: "var(--sm-space-4)" }}>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/cars">Cars</Link>
            </li>
            <li>{carTitle(car)}</li>
          </ol>

          <div className="sm-detail">
            <div>
              <Gallery photos={car.photos} title={carTitle(car)} has360={car.has360} />

              <div style={{ marginTop: "var(--sm-space-5)" }}>
                <span className="sm-eyebrow">{car.condition} · {car.bodyType}</span>
                <h1 style={{ marginBottom: "var(--sm-space-3)" }}>{carFullTitle(car)}</h1>
                <p className="sm-lead">{car.summary}</p>

                <ul style={{ display: "grid", gap: 8, marginBottom: "var(--sm-space-5)" }}>
                  {car.highlights.map((h) => (
                    <li
                      key={h}
                      style={{
                        display: "flex",
                        gap: 10,
                        fontSize: "var(--sm-fs-body-sm)",
                      }}
                    >
                      <CheckCircle2
                        size={16}
                        aria-hidden="true"
                        style={{ color: "var(--sm-primary)", flex: "none", marginTop: 2 }}
                      />
                      {h}
                    </li>
                  ))}
                </ul>

                <h2 style={{ fontSize: "1.5rem" }}>Specifications</h2>
                <table className="sm-specs-table">
                  <caption className="sm-visually-hidden">
                    Full specification for the {carFullTitle(car)}
                  </caption>
                  <tbody>
                    {specs.map(([label, value]) => (
                      <tr key={label}>
                        <th scope="row">{label}</th>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="sm-buybox">
              <p className="sm-buybox__price">{formatKesShort(car.priceKes)}</p>
              <p className="sm-buybox__usd">
                ≈ {formatUsd(usd)} for international buyers
                {live ? "" : " (indicative rate)"}
              </p>

              <div className="sm-buybox__installment">
                <span className="sm-meta">Estimated monthly installment</span>
                <strong>{formatKesShort(monthly)}</strong>
                <span>
                  {SITE.financeDepositDefaultPct}% deposit over{" "}
                  {SITE.financeTermDefaultMonths} months at {SITE.financeRateDefault}%
                </span>
              </div>

              <div className="sm-buybox__ctas">
                <BookTestDriveButton
                  carSlug={car.slug}
                  carName={carTitle(car)}
                  className="sm-btn sm-btn--primary sm-btn--block"
                  label="Book a Test Drive"
                />
                <a href="#finance" className="sm-btn sm-btn--secondary sm-btn--block">
                  <Calculator size={15} aria-hidden="true" />
                  Apply for Financing
                </a>
                <a
                  href={waMessage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm-btn sm-btn--outline sm-btn--block"
                >
                  <MessageCircle size={15} aria-hidden="true" />
                  Enquire via WhatsApp
                </a>
              </div>

              <p className="sm-help" style={{ marginTop: "var(--sm-space-3)" }}>
                Reserve this car with a refundable KES 5,000 M-Pesa deposit when you book a
                test drive. Trade-ins accepted against the purchase price.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="sm-section sm-section--light" id="finance">
        <div className="sm-container">
          <SectionHead
            eyebrow="Financing"
            title={`Finance this ${car.make} ${car.model}`}
            lead="Pre-filled with this car's price. Adjust the deposit and term to see exactly what you would pay each month."
          />
          <FinancingCalculator
            initialPrice={car.priceKes}
            carSlug={car.slug}
            carName={carTitle(car)}
          />
        </div>
      </section>

      <section className="sm-section">
        <div className="sm-container">
          <SectionHead eyebrow="Similar Cars" title="You might also consider" />
          <CarCarousel cars={similarCars(car, 6)} />
        </div>
      </section>
    </>
  );
}
