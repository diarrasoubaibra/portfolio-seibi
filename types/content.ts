export type Metric = {
  value: string;
  label: string;
};

export type MediaPieceType = "image" | "video" | "document" | "reference" | "linkedin";

export type MediaPiece = {
  type: MediaPieceType;
  section: string;
  title: string;
  url: string;
};

export type Mission = {
  id: string;
  title: string;
  organization: string;
  role: string;
  period: string;
  location: string;
  country: string;
  crops: string[];
  sector: string;
  metric?: string;
  summary: string;
  imageUrl?: string;
  media: MediaPiece[];
};

export type ExpertiseItem = {
  title: string;
  desc: string;
};

export type TimelineItem = {
  period: string;
  title: string;
  text: string;
};

export type MediaBlockIcon = "video" | "document";

export type MediaBlock = {
  icon: MediaBlockIcon;
  title: string;
  text: string;
};

export type CustomSectionType = "text" | "gallery" | "list" | "quote";

export type CustomSectionImage = {
  url: string;
  caption: string;
};

export type CustomSectionListItem = {
  title: string;
  text: string;
};

/**
 * A section the owner can add from the Atelier without a developer, beyond
 * the fixed built-in sections (Accueil, Missions, Expertises...). Kept to a
 * small set of pre-designed block types (rather than a free HTML editor) so
 * it can't be broken visually — flexible in count and content, not in markup.
 */
export type CustomSection = {
  id: string;
  enabled: boolean;
  eyebrow: string;
  title: string;
  type: CustomSectionType;
  text?: string;
  quote?: string;
  quoteAuthor?: string;
  items?: CustomSectionListItem[];
  images?: CustomSectionImage[];
};

export type SiteContent = {
  brand: {
    name: string;
    tagline: string;
  };
  hero: {
    eyebrow: string;
    titleBefore: string;
    titleAccent: string;
    titleAfter: string;
    lede: string;
    ctaPrimary: string;
    cvLabel: string;
    cvUrl: string;
    imageUrl: string;
    tagLine1: string;
    tagLine2: string;
    captionEyebrow: string;
    captionBody: string;
    metrics: Metric[];
  };
  expertise: {
    eyebrow: string;
    title: string;
    intro: string;
    items: ExpertiseItem[];
  };
  missionsIntro: {
    eyebrow: string;
    title: string;
    desc: string;
  };
  missions: Mission[];
  media: {
    eyebrow: string;
    title: string;
    lede: string;
    blocks: MediaBlock[];
  };
  parcours: {
    eyebrow: string;
    title: string;
    items: TimelineItem[];
  };
  customSections: CustomSection[];
  contact: {
    eyebrow: string;
    title: string;
    address: string;
    email: string;
    phone: string;
  };
  footer: {
    line1: string;
    line2: string;
  };
};
