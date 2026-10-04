"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="sm-modal"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sm-modal__panel">
        <div className="sm-modal__head">
          <div>
            <h3 style={{ margin: 0 }}>{title}</h3>
            {subtitle ? (
              <p className="sm-meta" style={{ margin: 0 }}>
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="sm-square sm-square--sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="sm-modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
