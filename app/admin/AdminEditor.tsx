"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ExpertiseItem,
  MediaBlock,
  MediaPiece,
  MediaPieceType,
  Mission,
  SiteContent,
  TimelineItem,
} from "@/types/content";
import { ImageUploadField } from "./ImageUploadField";

/** Mission, but with `crops` kept as a raw comma-separated string while
 * editing — converting it to/from an array on every keystroke (so the
 * `<input>` stays a controlled field bound to `crops.join(', ')`) makes it
 * impossible to type a comma followed by more text, since the array→string
 * round trip collapses the very separator you just typed. */
type MissionDraft = Omit<Mission, "crops"> & { cropsText: string };

function missionToDraft(mission: Mission): MissionDraft {
  const { crops, ...rest } = mission;
  return { ...rest, cropsText: crops.join(", ") };
}

function draftToMission(draft: MissionDraft): Mission {
  const { cropsText, ...rest } = draft;
  return {
    ...rest,
    crops: cropsText
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean),
  };
}

function emptyMission(): MissionDraft {
  return {
    id: `m_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    organization: "",
    role: "",
    period: "",
    location: "",
    country: "Côte d’Ivoire",
    cropsText: "",
    sector: "",
    metric: "",
    summary: "",
    imageUrl: "",
    media: [],
  };
}

function emptyMediaPiece(): MediaPiece {
  return { type: "image", section: "", title: "", url: "" };
}

function emptyExpertiseItem(): ExpertiseItem {
  return { title: "", desc: "" };
}

function emptyTimelineItem(): TimelineItem {
  return { period: "", title: "", text: "" };
}

function updateAt<T>(arr: T[], index: number, patch: Partial<T>): T[] {
  return arr.map((item, i) => (i === index ? { ...item, ...patch } : item));
}
function removeAt<T>(arr: T[], index: number): T[] {
  return arr.filter((_, i) => i !== index);
}
function moveAt<T>(arr: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= arr.length) return arr;
  const copy = arr.slice();
  const tmp = copy[index];
  copy[index] = copy[target];
  copy[target] = tmp;
  return copy;
}

const MEDIA_TYPES: { value: MediaPieceType; label: string }[] = [
  { value: "image", label: "Image" },
  { value: "video", label: "Vidéo" },
  { value: "document", label: "Document" },
  { value: "reference", label: "Référence" },
  { value: "linkedin", label: "LinkedIn" },
];

export function AdminEditor({ initialContent }: { initialContent: SiteContent }) {
  const router = useRouter();

  const [brand, setBrandState] = useState(initialContent.brand);
  const [hero, setHeroState] = useState(initialContent.hero);
  const [expertiseMeta, setExpertiseMeta] = useState({
    eyebrow: initialContent.expertise.eyebrow,
    title: initialContent.expertise.title,
    intro: initialContent.expertise.intro,
  });
  const [expertiseItems, setExpertiseItems] = useState<ExpertiseItem[]>(initialContent.expertise.items);
  const [missionsIntro, setMissionsIntro] = useState(initialContent.missionsIntro);
  const [missions, setMissions] = useState<MissionDraft[]>(initialContent.missions.map(missionToDraft));
  const [mediaMeta, setMediaMeta] = useState({
    eyebrow: initialContent.media.eyebrow,
    title: initialContent.media.title,
    lede: initialContent.media.lede,
  });
  const [mediaBlocks, setMediaBlocks] = useState<MediaBlock[]>(initialContent.media.blocks);
  const [parcoursMeta, setParcoursMeta] = useState({
    eyebrow: initialContent.parcours.eyebrow,
    title: initialContent.parcours.title,
  });
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(initialContent.parcours.items);
  const [contact, setContact] = useState(initialContent.contact);
  const [footer, setFooter] = useState(initialContent.footer);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind: "ok" | "error" | "" }>({ text: "", kind: "" });

  const missionCount = missions.length;

  const payload: SiteContent = useMemo(
    () => ({
      brand,
      hero,
      expertise: { ...expertiseMeta, items: expertiseItems },
      missionsIntro,
      missions: missions.map(draftToMission),
      media: { ...mediaMeta, blocks: mediaBlocks },
      parcours: { ...parcoursMeta, items: timelineItems },
      contact,
      footer,
    }),
    [brand, hero, expertiseMeta, expertiseItems, missionsIntro, missions, mediaMeta, mediaBlocks, parcoursMeta, timelineItems, contact, footer],
  );

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function handleSave() {
    setSaving(true);
    setMessage({ text: "Publication en cours…", kind: "" });
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ text: data.error || "La publication a échoué.", kind: "error" });
        setSaving(false);
        return;
      }
      if (data.mode === "github") {
        setMessage({
          text: "Enregistré. Le site public sera à jour dans environ une minute (redéploiement automatique).",
          kind: "ok",
        });
      } else {
        setMessage({ text: "Enregistré localement (data/content.json).", kind: "ok" });
      }
    } catch {
      setMessage({ text: "Impossible de contacter le serveur. Réessaie.", kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <div>
          <h1>Atelier — modifier le portfolio</h1>
          <span className={message.kind ? `admin-msg ${message.kind}` : "admin-msg"}>
            {message.text || "Les changements sont publiés pour tous les visiteurs dès l’enregistrement."}
          </span>
        </div>
        <div className="admin-topbar-actions">
          <button type="button" className="ebtn" onClick={handleLogout}>
            Se déconnecter
          </button>
          <button type="button" className="ebtn primary" onClick={handleSave} disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="admin-layout">
        <nav className="admin-nav">
          <a href="#section-brand">En-tête</a>
          <a href="#section-accueil">Accueil</a>
          <a href="#section-expertises">Expertises</a>
          <a href="#section-missions">Missions</a>
          <a href="#section-medias">Médias</a>
          <a href="#section-parcours">Parcours</a>
          <a href="#section-contact">Contact</a>
          <a href="#section-footer">Pied de page</a>
        </nav>

        <div className="admin-body">
        <section className="esection" id="section-brand">
          <h2>En-tête</h2>
          <div className="efield">
            <label>Nom affiché</label>
            <input value={brand.name} onChange={(e) => setBrandState({ ...brand, name: e.target.value })} />
          </div>
          <div className="efield">
            <label>Sous-titre</label>
            <input value={brand.tagline} onChange={(e) => setBrandState({ ...brand, tagline: e.target.value })} />
          </div>
        </section>

        <section className="esection" id="section-accueil">
          <h2>Accueil</h2>
          <div className="efield">
            <label>Phrase d’intro (au-dessus du titre)</label>
            <input value={hero.eyebrow} onChange={(e) => setHeroState({ ...hero, eyebrow: e.target.value })} />
          </div>
          <div className="erow3">
            <div className="efield">
              <label>Titre — début</label>
              <input value={hero.titleBefore} onChange={(e) => setHeroState({ ...hero, titleBefore: e.target.value })} />
            </div>
            <div className="efield">
              <label>Titre — mot mis en valeur</label>
              <input value={hero.titleAccent} onChange={(e) => setHeroState({ ...hero, titleAccent: e.target.value })} />
            </div>
            <div className="efield">
              <label>Titre — fin</label>
              <input value={hero.titleAfter} onChange={(e) => setHeroState({ ...hero, titleAfter: e.target.value })} />
            </div>
          </div>
          <div className="efield">
            <label>Paragraphe d’introduction</label>
            <textarea value={hero.lede} onChange={(e) => setHeroState({ ...hero, lede: e.target.value })} />
          </div>
          <div className="erow2">
            <div className="efield">
              <label>Texte du bouton principal</label>
              <input value={hero.ctaPrimary} onChange={(e) => setHeroState({ ...hero, ctaPrimary: e.target.value })} />
            </div>
            <div className="efield">
              <label>Texte du bouton CV</label>
              <input value={hero.cvLabel} onChange={(e) => setHeroState({ ...hero, cvLabel: e.target.value })} />
            </div>
          </div>
          <div className="efield">
            <label>Lien vers le CV (facultatif)</label>
            <input value={hero.cvUrl} onChange={(e) => setHeroState({ ...hero, cvUrl: e.target.value })} placeholder="https://…" />
            <p className="ehint">Laisse vide pour ne pas afficher le bouton de téléchargement.</p>
          </div>

          <h2 style={{ marginTop: "1.2rem" }}>Chiffres clés</h2>
          {[0, 1, 2].map((i) => {
            const metric = hero.metrics[i] || { value: "", label: "" };
            return (
              <div className="erow2" key={i}>
                <div className="efield">
                  <label>Chiffre {i + 1}</label>
                  <input
                    value={metric.value}
                    onChange={(e) =>
                      setHeroState({ ...hero, metrics: updateAt(hero.metrics, i, { value: e.target.value }) })
                    }
                  />
                </div>
                <div className="efield">
                  <label>Légende {i + 1}</label>
                  <input
                    value={metric.label}
                    onChange={(e) =>
                      setHeroState({ ...hero, metrics: updateAt(hero.metrics, i, { label: e.target.value }) })
                    }
                  />
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: "0.8rem" }}>
            <ImageUploadField
              label="Photo de couverture"
              value={hero.imageUrl}
              onChange={(url) => setHeroState({ ...hero, imageUrl: url })}
              hint="Laisse vide pour garder le visuel d’illustration par défaut."
            />
          </div>
          <div className="erow2">
            <div className="efield">
              <label>Étiquette (ligne 1)</label>
              <input value={hero.tagLine1} onChange={(e) => setHeroState({ ...hero, tagLine1: e.target.value })} />
            </div>
            <div className="efield">
              <label>Étiquette (ligne 2)</label>
              <input value={hero.tagLine2} onChange={(e) => setHeroState({ ...hero, tagLine2: e.target.value })} />
            </div>
          </div>
          <div className="erow2">
            <div className="efield">
              <label>Encart — titre</label>
              <input value={hero.captionEyebrow} onChange={(e) => setHeroState({ ...hero, captionEyebrow: e.target.value })} />
            </div>
            <div className="efield">
              <label>Encart — texte</label>
              <input value={hero.captionBody} onChange={(e) => setHeroState({ ...hero, captionBody: e.target.value })} />
            </div>
          </div>
        </section>

        <section className="esection" id="section-expertises">
          <h2>Champ d’action (expertises)</h2>
          <div className="efield">
            <label>Étiquette</label>
            <input value={expertiseMeta.eyebrow} onChange={(e) => setExpertiseMeta({ ...expertiseMeta, eyebrow: e.target.value })} />
          </div>
          <div className="efield">
            <label>Titre de section</label>
            <input value={expertiseMeta.title} onChange={(e) => setExpertiseMeta({ ...expertiseMeta, title: e.target.value })} />
          </div>
          <div className="efield">
            <label>Texte d’introduction</label>
            <textarea value={expertiseMeta.intro} onChange={(e) => setExpertiseMeta({ ...expertiseMeta, intro: e.target.value })} />
          </div>

          {expertiseItems.map((item, i) => (
            <div className="eitem" key={i}>
              <div className="eitem-head">
                <strong>Domaine {i + 1}</strong>
                <div className="eitem-tools">
                  <button type="button" onClick={() => setExpertiseItems(removeAt(expertiseItems, i))} title="Supprimer">
                    ✕
                  </button>
                </div>
              </div>
              <div className="efield">
                <label>Titre</label>
                <input value={item.title} onChange={(e) => setExpertiseItems(updateAt(expertiseItems, i, { title: e.target.value }))} />
              </div>
              <div className="efield">
                <label>Description</label>
                <textarea value={item.desc} onChange={(e) => setExpertiseItems(updateAt(expertiseItems, i, { desc: e.target.value }))} />
              </div>
            </div>
          ))}
          <button type="button" className="add-btn" onClick={() => setExpertiseItems([...expertiseItems, emptyExpertiseItem()])}>
            + Ajouter un domaine
          </button>
        </section>

        <section className="esection" id="section-missions">
          <h2>Carnet de missions</h2>
          <div className="efield">
            <label>Étiquette</label>
            <input value={missionsIntro.eyebrow} onChange={(e) => setMissionsIntro({ ...missionsIntro, eyebrow: e.target.value })} />
          </div>
          <div className="efield">
            <label>Titre de section</label>
            <input value={missionsIntro.title} onChange={(e) => setMissionsIntro({ ...missionsIntro, title: e.target.value })} />
          </div>
          <div className="efield">
            <label>Texte d’introduction</label>
            <textarea value={missionsIntro.desc} onChange={(e) => setMissionsIntro({ ...missionsIntro, desc: e.target.value })} />
          </div>

          {missions.map((mission, i) => (
            <div className="eitem" key={mission.id}>
              <div className="eitem-head">
                <strong>Mission {i + 1}</strong>
                <div className="eitem-tools">
                  <button type="button" onClick={() => setMissions(moveAt(missions, i, -1))} disabled={i === 0} title="Monter">
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => setMissions(moveAt(missions, i, 1))}
                    disabled={i === missionCount - 1}
                    title="Descendre"
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => setMissions(removeAt(missions, i))} title="Supprimer">
                    ✕
                  </button>
                </div>
              </div>
              <div className="efield">
                <label>Intitulé</label>
                <input value={mission.title} onChange={(e) => setMissions(updateAt(missions, i, { title: e.target.value }))} />
              </div>
              <div className="erow2">
                <div className="efield">
                  <label>Organisation / client</label>
                  <input value={mission.organization} onChange={(e) => setMissions(updateAt(missions, i, { organization: e.target.value }))} />
                </div>
                <div className="efield">
                  <label>Rôle occupé</label>
                  <input value={mission.role} onChange={(e) => setMissions(updateAt(missions, i, { role: e.target.value }))} />
                </div>
              </div>
              <div className="erow2">
                <div className="efield">
                  <label>Période</label>
                  <input value={mission.period} onChange={(e) => setMissions(updateAt(missions, i, { period: e.target.value }))} />
                </div>
                <div className="efield">
                  <label>Pays</label>
                  <input value={mission.country} onChange={(e) => setMissions(updateAt(missions, i, { country: e.target.value }))} />
                </div>
              </div>
              <div className="efield">
                <label>Localisation détaillée</label>
                <input value={mission.location} onChange={(e) => setMissions(updateAt(missions, i, { location: e.target.value }))} />
              </div>
              <div className="erow2">
                <div className="efield">
                  <label>Secteur</label>
                  <input value={mission.sector} onChange={(e) => setMissions(updateAt(missions, i, { sector: e.target.value }))} />
                </div>
                <div className="efield">
                  <label>Chiffre clé (facultatif)</label>
                  <input value={mission.metric || ""} onChange={(e) => setMissions(updateAt(missions, i, { metric: e.target.value }))} />
                </div>
              </div>
              <div className="efield">
                <label>Cultures / filières (séparées par une virgule)</label>
                <input
                  value={mission.cropsText}
                  onChange={(e) => setMissions(updateAt(missions, i, { cropsText: e.target.value }))}
                  placeholder="Ex. Cacao, Palmier à huile"
                />
              </div>
              <div className="efield">
                <label>Contexte et contribution</label>
                <textarea value={mission.summary} onChange={(e) => setMissions(updateAt(missions, i, { summary: e.target.value }))} />
              </div>
              <ImageUploadField
                label="Photo"
                value={mission.imageUrl || ""}
                onChange={(url) => setMissions(updateAt(missions, i, { imageUrl: url }))}
                hint="Laisse vide pour un repère par défaut."
              />

              <div className="media-list">
                {mission.media.map((piece, j) => (
                  <div className="media-item" key={j}>
                    <div className="eitem-head">
                      <strong>Pièce {j + 1}</strong>
                      <div className="eitem-tools">
                        <button
                          type="button"
                          onClick={() => setMissions(updateAt(missions, i, { media: removeAt(mission.media, j) }))}
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="erow2">
                      <div className="efield">
                        <label>Type</label>
                        <select
                          value={piece.type}
                          onChange={(e) =>
                            setMissions(
                              updateAt(missions, i, {
                                media: updateAt(mission.media, j, { type: e.target.value as MediaPieceType }),
                              }),
                            )
                          }
                        >
                          {MEDIA_TYPES.map((t) => (
                            <option value={t.value} key={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="efield">
                        <label>Section de la mission</label>
                        <input
                          value={piece.section}
                          onChange={(e) => setMissions(updateAt(missions, i, { media: updateAt(mission.media, j, { section: e.target.value }) }))}
                        />
                      </div>
                    </div>
                    <div className="efield">
                      <label>Titre de la pièce</label>
                      <input
                        value={piece.title}
                        onChange={(e) => setMissions(updateAt(missions, i, { media: updateAt(mission.media, j, { title: e.target.value }) }))}
                      />
                    </div>
                    {piece.type === "image" ? (
                      <ImageUploadField
                        label="Image"
                        value={piece.url}
                        onChange={(url) => setMissions(updateAt(missions, i, { media: updateAt(mission.media, j, { url }) }))}
                      />
                    ) : (
                      <div className="efield">
                        <label>Lien (URL)</label>
                        <input
                          value={piece.url}
                          onChange={(e) => setMissions(updateAt(missions, i, { media: updateAt(mission.media, j, { url: e.target.value }) }))}
                          placeholder="https://…"
                        />
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => setMissions(updateAt(missions, i, { media: [...mission.media, emptyMediaPiece()] }))}
                >
                  + Ajouter une pièce (image, vidéo, document…)
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="add-btn" onClick={() => setMissions([...missions, emptyMission()])}>
            + Ajouter une mission
          </button>
        </section>

        <section className="esection" id="section-medias">
          <h2>Pièces de mission (bandeau sombre)</h2>
          <div className="efield">
            <label>Étiquette</label>
            <input value={mediaMeta.eyebrow} onChange={(e) => setMediaMeta({ ...mediaMeta, eyebrow: e.target.value })} />
          </div>
          <div className="efield">
            <label>Titre de section</label>
            <input value={mediaMeta.title} onChange={(e) => setMediaMeta({ ...mediaMeta, title: e.target.value })} />
          </div>
          <div className="efield">
            <label>Texte</label>
            <textarea value={mediaMeta.lede} onChange={(e) => setMediaMeta({ ...mediaMeta, lede: e.target.value })} />
          </div>
          {mediaBlocks.map((block, i) => (
            <div className="eitem" key={i}>
              <div className="eitem-head">
                <strong>Bloc {i + 1}</strong>
              </div>
              <div className="efield">
                <label>Icône</label>
                <select value={block.icon} onChange={(e) => setMediaBlocks(updateAt(mediaBlocks, i, { icon: e.target.value as MediaBlock["icon"] }))}>
                  <option value="video">Vidéo</option>
                  <option value="document">Document</option>
                </select>
              </div>
              <div className="efield">
                <label>Titre</label>
                <input value={block.title} onChange={(e) => setMediaBlocks(updateAt(mediaBlocks, i, { title: e.target.value }))} />
              </div>
              <div className="efield">
                <label>Texte</label>
                <textarea value={block.text} onChange={(e) => setMediaBlocks(updateAt(mediaBlocks, i, { text: e.target.value }))} />
              </div>
            </div>
          ))}
        </section>

        <section className="esection" id="section-parcours">
          <h2>Parcours</h2>
          <div className="efield">
            <label>Étiquette</label>
            <input value={parcoursMeta.eyebrow} onChange={(e) => setParcoursMeta({ ...parcoursMeta, eyebrow: e.target.value })} />
          </div>
          <div className="efield">
            <label>Titre de section</label>
            <input value={parcoursMeta.title} onChange={(e) => setParcoursMeta({ ...parcoursMeta, title: e.target.value })} />
          </div>
          {timelineItems.map((item, i) => (
            <div className="eitem" key={i}>
              <div className="eitem-head">
                <strong>Étape {i + 1}</strong>
                <div className="eitem-tools">
                  <button type="button" onClick={() => setTimelineItems(removeAt(timelineItems, i))} title="Supprimer">
                    ✕
                  </button>
                </div>
              </div>
              <div className="efield">
                <label>Période</label>
                <input value={item.period} onChange={(e) => setTimelineItems(updateAt(timelineItems, i, { period: e.target.value }))} />
              </div>
              <div className="efield">
                <label>Titre</label>
                <input value={item.title} onChange={(e) => setTimelineItems(updateAt(timelineItems, i, { title: e.target.value }))} />
              </div>
              <div className="efield">
                <label>Description</label>
                <textarea value={item.text} onChange={(e) => setTimelineItems(updateAt(timelineItems, i, { text: e.target.value }))} />
              </div>
            </div>
          ))}
          <button type="button" className="add-btn" onClick={() => setTimelineItems([...timelineItems, emptyTimelineItem()])}>
            + Ajouter une étape
          </button>
        </section>

        <section className="esection" id="section-contact">
          <h2>Contact</h2>
          <div className="efield">
            <label>Étiquette</label>
            <input value={contact.eyebrow} onChange={(e) => setContact({ ...contact, eyebrow: e.target.value })} />
          </div>
          <div className="efield">
            <label>Titre</label>
            <input value={contact.title} onChange={(e) => setContact({ ...contact, title: e.target.value })} />
          </div>
          <div className="efield">
            <label>Adresse / disponibilité</label>
            <input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
          </div>
          <div className="erow2">
            <div className="efield">
              <label>Email</label>
              <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
            </div>
            <div className="efield">
              <label>Téléphone</label>
              <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
            </div>
          </div>
        </section>

        <section className="esection" id="section-footer">
          <h2>Pied de page</h2>
          <div className="efield">
            <label>Ligne 1</label>
            <input value={footer.line1} onChange={(e) => setFooter({ ...footer, line1: e.target.value })} />
          </div>
          <div className="efield">
            <label>Ligne 2</label>
            <input value={footer.line2} onChange={(e) => setFooter({ ...footer, line2: e.target.value })} />
          </div>
        </section>

        <div className="admin-footer-space" />
        </div>
      </div>
    </div>
  );
}
