import Link from "next/link";
import { Photo } from "@/components/Photo";
import type { PhotoKey } from "@/data/generated/photos";

export function PageHeader({
  title,
  eyebrow,
  lead,
  breadcrumb,
  photo,
}: {
  title: string;
  eyebrow: string;
  lead?: string;
  breadcrumb: { label: string; href?: string }[];
  photo: PhotoKey;
}) {
  return (
    <section className="sm-pagehead">
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <Photo name={photo} alt="" sizes="100vw" />
      </div>
      <div className="sm-pagehead__inner" style={{ position: "relative" }}>
        <div className="sm-container">
          <span className="sm-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {lead ? (
            <p className="sm-lead" style={{ color: "var(--sm-white)", opacity: 0.9 }}>
              {lead}
            </p>
          ) : null}
          <ol className="sm-breadcrumb">
            {breadcrumb.map((crumb) => (
              <li key={crumb.label}>
                {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
