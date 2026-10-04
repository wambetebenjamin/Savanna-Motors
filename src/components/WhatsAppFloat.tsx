"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { waLink, WA_DEFAULT_MESSAGE } from "@/lib/notify";

/**
 * Floating WhatsApp button. Pulses on load, then every 10 seconds.
 * Colours come from the design source palette (primary #D81324).
 */
export function WhatsAppFloat() {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPulse(false);
      return;
    }
    const interval = window.setInterval(() => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 3400);
    }, 10000);
    const initial = window.setTimeout(() => setPulse(false), 3400);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(initial);
    };
  }, []);

  return (
    <div className="sm-wa">
      <span className="sm-wa__tooltip" role="tooltip">
        Enquire about a car or book a test drive
      </span>
      <a
        className="sm-wa__btn"
        data-pulse={pulse}
        href={waLink(WA_DEFAULT_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Enquire about a car or book a test drive on WhatsApp"
      >
        <MessageCircle size={26} aria-hidden="true" />
      </a>
    </div>
  );
}
