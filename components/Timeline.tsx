import type { SiteContent } from "@/types/content";

export function Timeline({ parcours }: { parcours: SiteContent["parcours"] }) {
  return (
    <section id="parcours" className="section-pad">
      <div className="wrap parcours-grid">
        <div>
          <p className="eyebrow">{parcours.eyebrow}</p>
          <h2>{parcours.title}</h2>
        </div>
        <div className="tl-grid">
          {parcours.items.map((item, i) => (
            <div className="tl-card" key={i}>
              <p className="period">{item.period}</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
