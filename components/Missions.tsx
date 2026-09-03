import type { Mission, SiteContent } from "@/types/content";
import { FieldMarkSmall, PieceIcon, PinIcon } from "./icons";

function pad2(i: number) {
  return String(i + 1).padStart(2, "0");
}

function MissionMedia({ mission, index, total }: { mission: Mission; index: number; total: number }) {
  const imageUrl = (mission.imageUrl || "").trim();
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- content-managed, external URL
    return <img className="cover" src={imageUrl} alt={`Illustration de la mission ${mission.title}`} />;
  }
  return (
    <>
      <FieldMarkSmall className="mark" />
      <p className="cap">Photo de mission à ajouter depuis l’Atelier.</p>
      <span className="idx">
        {index + 1} / {total}
      </span>
    </>
  );
}

function MissionCard({ mission, index, total }: { mission: Mission; index: number; total: number }) {
  return (
    <article className="mission">
      <div className="mission-index">
        <span className="mk">{pad2(index)}</span>
        <span className="rule" />
      </div>
      <div>
        <div className="mission-tags">
          <span className="tag">{mission.sector}</span>
          <span className="tag">{mission.country}</span>
          {mission.crops.map((crop) => (
            <span className="tag accent" key={crop}>
              {crop}
            </span>
          ))}
          {mission.metric && <span className="tag accent">{mission.metric}</span>}
        </div>
        <h3>{mission.title}</h3>
        <p className="role">{mission.role}</p>
        <p className="org">
          {mission.organization} · {mission.period}
        </p>
        <p className="summary">{mission.summary}</p>
        <span className="loc">
          <PinIcon />
          <span>{mission.location}</span>
        </span>
        {mission.media.length > 0 && (
          <div className="pieces">
            {mission.media.map((piece, i) => (
              <a className="piece" href={piece.url || "#"} target="_blank" rel="noreferrer" key={i}>
                <PieceIcon type={piece.type} />
                <span>
                  <span className="psec">{piece.section}</span>
                  <span className="ptitle">{piece.title}</span>
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="mission-media">
        <MissionMedia mission={mission} index={index} total={total} />
      </div>
    </article>
  );
}

export function Missions({ missionsIntro, missions }: { missionsIntro: SiteContent["missionsIntro"]; missions: Mission[] }) {
  return (
    <section id="missions" className="section-pad">
      <div className="wrap">
        <div className="mission-head">
          <div>
            <p className="eyebrow">{missionsIntro.eyebrow}</p>
            <h2>{missionsIntro.title}</h2>
            <span className="mcount">
              {missions.length} mission{missions.length > 1 ? "s" : ""}
            </span>
          </div>
          <p className="desc">{missionsIntro.desc}</p>
        </div>
        <div>
          {missions.length === 0 ? (
            <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--ink-soft)" }}>
              Aucune mission pour le moment.
            </p>
          ) : (
            missions.map((mission, i) => (
              <MissionCard mission={mission} index={i} total={missions.length} key={mission.id} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
