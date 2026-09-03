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
