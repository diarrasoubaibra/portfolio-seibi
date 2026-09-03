import type { SiteContent } from "@/types/content";
import { MediaBlockIconGlyph } from "./icons";

export function MediaSection({ media }: { media: SiteContent["media"] }) {
  return (
    <section id="medias" className="section-pad">
      <div className="wrap media-grid">
        <div>
          <p className="eyebrow" style={{ color: "#ecd8a6" }}>
            {media.eyebrow}
          </p>
          <h2>{media.title}</h2>
          <p className="lede">{media.lede}</p>
        </div>
        <div className="media-cards">
          {media.blocks.map((block, i) => (
            <div className="media-card" key={i}>
              <div className="icon">
                <MediaBlockIconGlyph icon={block.icon} />
              </div>
              <h3>{block.title}</h3>
              <p>{block.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
