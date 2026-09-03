import type { SiteContent } from "@/types/content";

/**
 * Minimal structural validation for content submitted from the admin
 * dashboard. Not exhaustive (this is a single-owner CMS, not a public API),
 * but enough to stop a malformed save from corrupting data/content.json or
 * crashing the public page's render.
 */
export function validateContent(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Contenu invalide.";
  const c = body as Partial<SiteContent>;

  if (!c.brand || typeof c.brand.name !== "string") return "Le nom (en-tête) est manquant.";
  if (!c.hero || typeof c.hero.titleAccent !== "string") return "La section Accueil est incomplète.";
  if (!Array.isArray(c.hero.metrics)) return "Les chiffres clés doivent être une liste.";
  if (!c.expertise || !Array.isArray(c.expertise.items)) return "La section Expertises est incomplète.";
  if (!c.missionsIntro || typeof c.missionsIntro.title !== "string") return "L’intro du Carnet de missions est incomplète.";
  if (!Array.isArray(c.missions)) return "Les missions doivent être une liste.";

  for (const mission of c.missions) {
    if (typeof mission.title !== "string" || !mission.title.trim()) {
      return "Chaque mission doit avoir un intitulé.";
    }
    if (!Array.isArray(mission.crops)) return `La mission « ${mission.title} » : les cultures doivent être une liste.`;
    if (!Array.isArray(mission.media)) return `La mission « ${mission.title} » : les pièces doivent être une liste.`;
    for (const piece of mission.media) {
      if (typeof piece.url !== "string") return `La mission « ${mission.title} » a une pièce sans lien.`;
    }
  }

  if (!c.media || !Array.isArray(c.media.blocks)) return "La section Médias est incomplète.";
  if (!c.parcours || !Array.isArray(c.parcours.items)) return "La section Parcours est incomplète.";
  if (!c.contact || typeof c.contact.email !== "string") return "La section Contact est incomplète.";
  if (!c.footer || typeof c.footer.line1 !== "string") return "Le pied de page est incomplet.";

  return null;
}
