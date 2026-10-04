"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Car, Clock, GitCompareArrows, MapPin, Menu, PhoneCall, Search, X } from "lucide-react";
import { NAV_LINKS, SITE } from "@/data/site";
import { useCompare } from "@/lib/compareStore";
import { BookTestDriveButton } from "@/components/BookTestDriveButton";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const count = useCompare((s) => s.slugs.length);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    if (base === "/") return pathname === "/";
    return pathname.startsWith(base);
  };

  return (
    <>
      <div className="sm-topbar">
        <div className="sm-container sm-topbar__inner">
          <div className="sm-topbar__group">
            <span className="sm-topbar__item">
              <MapPin size={13} aria-hidden="true" /> {SITE.address.full}
            </span>
            <span className="sm-topbar__item">
              <Clock size={13} aria-hidden="true" /> Mon – Fri: 08:00 – 18:00
            </span>
          </div>
          <div className="sm-topbar__group">
            <a className="sm-topbar__item" href={`tel:${SITE.phone}`}>
              <PhoneCall size={13} aria-hidden="true" /> {SITE.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <header className="sm-header">
        <div className="sm-container">
          <nav className="sm-nav" aria-label="Primary">
            <Link href="/" className="sm-brand">
              <Car size={26} className="sm-brand__mark" aria-hidden="true" />
              Savanna<span className="sm-brand__accent">Motors</span>
            </Link>

            <ul className="sm-nav__links" data-open={menuOpen} id="primary-navigation">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="sm-nav__link"
                    aria-current={isActive(link.href) ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="sm-nav__actions">
              <button
                type="button"
                className="sm-square sm-square--sm"
                aria-label="Search cars"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={16} aria-hidden="true" />
              </button>

              <Link href="/compare" className="sm-compare-pill">
                <GitCompareArrows size={15} aria-hidden="true" />
                <span className="sm-nav__compare-label">Compare</span>
                <span className="sm-compare-pill__count">{mounted ? count : 0}/3</span>
              </Link>

              <span className="sm-nav__cta-wrap">
                <BookTestDriveButton
                  className="sm-btn sm-btn--primary sm-nav__cta"
                  withIcon={false}
                />
              </span>

              <button
                type="button"
                className="sm-nav__toggle"
                aria-expanded={menuOpen}
                aria-controls="primary-navigation"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
                <span className="sm-visually-hidden">Menu</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {searchOpen ? (
        <div
          className="sm-search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search cars"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false);
          }}
        >
          <form
            className="sm-search-overlay__box"
            onSubmit={(e) => {
              e.preventDefault();
              const value = searchRef.current?.value.trim();
              setSearchOpen(false);
              router.push(value ? `/cars?q=${encodeURIComponent(value)}` : "/cars");
            }}
          >
            <div className="sm-search-overlay__row">
              <input
                ref={searchRef}
                type="search"
                placeholder="Search make, model or body type — e.g. Prado, hybrid, pickup"
                aria-label="Search cars"
              />
              <button type="submit" className="sm-btn sm-btn--primary">
                Search
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
