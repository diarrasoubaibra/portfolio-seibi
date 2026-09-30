"use client";

import { useEffect, useState } from "react";
import { FieldMark } from "./icons";
import type { SiteContent } from "@/types/content";

const LINKS = [
  { href: "#missions", label: "Missions" },
  { href: "#expertises", label: "Expertises" },
  { href: "#medias", label: "Médias" },
  { href: "#parcours", label: "Parcours" },
];

export function Header({ brand }: { brand: SiteContent["brand"] }) {
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Highlights whichever section's heading has crossed roughly the upper
  // third of the viewport — gives visitors a sense of where they are on a
  // long single-page site instead of a nav that never changes.
  useEffect(() => {
    const sections = LINKS.map((link) => document.getElementById(link.href.slice(1))).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header>
      <div className="wrap header-row">
        <a className="brand" href="#top" onClick={() => setMenuOpen(false)}>
          <FieldMark />
          <span className="brand-text">
            <strong>{brand.name}</strong>
            <span>{brand.tagline}</span>
          </span>
        </a>

        <nav>
          {LINKS.map((link) => (
            <a href={link.href} key={link.href} className={active === link.href ? "active" : ""}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a href="#contact" className="btn btn-accent header-cta">
            Me contacter
          </a>
          <button
            type="button"
            className={`nav-toggle${menuOpen ? " open" : ""}`}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <div className="mobile-menu-inner">
          {LINKS.map((link) => (
            <a href={link.href} key={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href="#contact" className="btn btn-accent" onClick={() => setMenuOpen(false)}>
            Me contacter
          </a>
        </div>
      </div>
    </header>
  );
}
