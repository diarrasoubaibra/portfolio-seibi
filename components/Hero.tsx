import type { SiteContent } from "@/types/content";

function HeroArt({ imageUrl }: { imageUrl: string }) {
  if (imageUrl.trim()) {
    // eslint-disable-next-line @next/next/no-img-element -- content-managed, external URL
    return <img src={imageUrl} alt="Photo de terrain" />;
  }
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="300" fill="#173f35" />
      <path d="M-20 260 Q60 200 130 240 T260 210 T420 250" stroke="#2c5347" strokeWidth="18" fill="none" opacity=".9" />
      <path d="M-20 210 Q80 150 160 190 T300 160 T420 195" stroke="#2c5347" strokeWidth="1" fill="none" opacity=".7" />
      <path d="M-20 160 Q90 100 170 140 T310 105 T420 145" stroke="#2c5347" strokeWidth="1" fill="none" opacity=".6" />
      <path d="M-20 110 Q100 55 190 90 T330 55 T420 95" stroke="#2c5347" strokeWidth="1" fill="none" opacity=".5" />
      <path d="M-20 60 Q110 10 200 40 T340 10 T420 45" stroke="#2c5347" strokeWidth="1" fill="none" opacity=".4" />
      <g opacity=".5" stroke="#ecd8a6" strokeWidth=".6">
        <path d="M40 0 V300 M120 0 V300 M200 0 V300 M280 0 V300 M360 0 V300" />
        <path d="M0 40 H400 M0 110 H400 M0 180 H400 M0 250 H400" />
      </g>
      <g transform="translate(198,150)">
        <circle r="34" fill="none" stroke="#c46c4d" strokeWidth="1" />
        <circle r="3" fill="#c46c4d" />
        <path d="M0 -46 V-34 M0 34 V46 M-46 0 H-34 M34 0 H46" stroke="#ecd8a6" strokeWidth="1.4" />
      </g>
      <path
        d="M198 150 C198 120 220 90 220 68 C220 54 209 44 198 44 C187 44 176 54 176 68 C176 90 198 120 198 150 Z"
        fill="#c46c4d"
      />
      <circle cx="198" cy="68" r="8" fill="#173f35" />
    </svg>
  );
}

export function Hero({ hero }: { hero: SiteContent["hero"] }) {
  const cvUrl = hero.cvUrl.trim();
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>
            {hero.titleBefore} <em>{hero.titleAccent}</em>
            {hero.titleAfter}
          </h1>
          <p className="lede">{hero.lede}</p>
          <div className="hero-actions">
            <a href="#missions" className="btn btn-solid">
              {hero.ctaPrimary} ↘
            </a>
            {cvUrl && (
              <a href={cvUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
                {hero.cvLabel} ⭳
              </a>
            )}
          </div>
          <div className="metrics">
            {hero.metrics.map((metric, i) => (
              <div className="metric" key={i}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-tag">
            {hero.tagLine1}
            <span>{hero.tagLine2}</span>
          </div>
          <div className="hero-art-frame">
            <HeroArt imageUrl={hero.imageUrl} />
          </div>
          <div className="hero-caption">
            <p className="eyebrow">{hero.captionEyebrow}</p>
            <p className="body">{hero.captionBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
