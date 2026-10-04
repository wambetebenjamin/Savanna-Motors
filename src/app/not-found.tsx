import Link from "next/link";
import { Car } from "lucide-react";

export default function NotFound() {
  return (
    <section className="sm-section">
      <div className="sm-container" style={{ textAlign: "center", padding: "4rem 0" }}>
        <Car size={48} aria-hidden="true" style={{ color: "var(--sm-primary)", margin: "0 auto" }} />
        <span className="sm-eyebrow" style={{ marginTop: "var(--sm-space-4)" }}>
          404
        </span>
        <h1>That page has already been sold</h1>
        <p className="sm-lead" style={{ margin: "0 auto var(--sm-space-4)" }}>
          The page you were looking for is not here. The cars definitely are.
        </p>
        <div style={{ display: "inline-flex", gap: "var(--sm-space-2)", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/cars" className="sm-btn sm-btn--primary">
            Browse inventory
          </Link>
          <Link href="/" className="sm-btn sm-btn--outline">
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}
