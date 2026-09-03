import type { SiteContent } from "@/types/content";

export function Expertise({ expertise }: { expertise: SiteContent["expertise"] }) {
  return (
    <section id="expertises" className="section-pad">
      <div className="wrap exp-grid">
        <div className="exp-intro">
          <p className="eyebrow">{expertise.eyebrow}</p>
          <h2>{expertise.title}</h2>
          <p>{expertise.intro}</p>
        </div>
        <div className="exp-cards">
          {expertise.items.map((item, i) => (
            <div className="exp-card" key={i}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
