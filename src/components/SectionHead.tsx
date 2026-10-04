import type { ReactNode } from "react";

export function SectionHead({
  eyebrow,
  title,
  lead,
  center = false,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  center?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`sm-section-head${center ? " sm-section-head--center" : ""}`}>
      <span className="sm-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {lead ? <p className="sm-lead">{lead}</p> : null}
      {children}
    </div>
  );
}
