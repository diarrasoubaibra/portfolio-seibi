import { FieldMark } from "./icons";
import type { SiteContent } from "@/types/content";

export function Header({ brand }: { brand: SiteContent["brand"] }) {
  return (
    <header>
      <div className="wrap header-row">
        <a className="brand" href="#top">
          <FieldMark />
          <span className="brand-text">
            <strong>{brand.name}</strong>
            <span>{brand.tagline}</span>
          </span>
        </a>
        <nav>
          <a href="#missions">Missions</a>
          <a href="#expertises">Expertises</a>
          <a href="#medias">Médias</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </header>
  );
}
