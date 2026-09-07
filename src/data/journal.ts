export interface JournalEntry {
  slug: string;
  title: string;
  category: string;
  date?: string;
  location?: string;
  camera?: string;
  cover: string;
  frames: string[];
  excerpt: string;
  body: string[];
}

const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    slug: "desert-study-golden-hour",
    title: "Desert Study — Golden Hour",
    category: "Field Notes",
    date: "2024-05",
    location: "Tempe, AZ",
    camera: "Sony a7 IV · 50mm",
    cover: "/images/favorite/DSC04384.jpg",
    frames: [
      "/images/favorite/DSC04384.jpg",
      "/images/favorite/DSC_1317.jpg",
      "/images/favorite/_AG_9030.jpg",
    ],
    excerpt:
      "Chasing the last light across the Salt River basin — a backlit portrait at golden hour.",
    body: [
      "The grade comes on fast in Tempe: the sun drops, the dust turns orange, and for about twenty minutes every surface becomes a reflector. This frame is one of three I shot back-to-back on 50mm, waiting for the wind to settle.",
      "I underexposed by a stop to hold the sky, then let the silhouette carry the rest. The haze you see in the air was real — it was pushing triple digits that day.",
      "It's the frame I keep returning to when I remember why I pick the camera up at all.",
    ],
  },
  {
    slug: "summer-picnic-late-sun",
    title: "Summer Picnic — Late Sun",
    category: "Sessions",
    cover: "/images/summer-picnic/_AG_9030.jpg",
    frames: [
      "/images/summer-picnic/_AG_9013.jpg",
      "/images/summer-picnic/_AG_9030.jpg",
      "/images/summer-picnic/_AG_9152.jpg",
      "/images/summer-picnic/_AG_9387.jpg",
    ],
    excerpt:
      "Friends, food, and a late-summer sun that didn't want to leave — candid frames from a golden-hour picnic.",
    body: [
      "Some of the best sessions aren't sessions at all. This one was a picnic that ran an hour longer than it should have because nobody wanted to leave the light.",
      "Shot wide-open and moving fast, with zero direction — just the good chaos of people being themselves. Honest frames beat posed ones almost every time.",
      "Client deliveries work the same way: find the moment, don't build it.",
    ],
  },
  {
    slug: "aperture-notes-the-sidewalks",
    title: "Aperture Notes — The Sidewalks",
    category: "Notes",
    location: "Tempe, AZ",
    camera: "Sony a7 IV",
    cover: "/images/street/AG_02856.jpg",
    frames: [
      "/images/street/AG_02851.jpg",
      "/images/street/AG_02856-2.jpg",
      "/images/street/AG_02858.jpg",
      "/images/street/AG_02901.jpg",
    ],
    excerpt:
      "Notes from an afternoon on the sidewalks — pacing, framing, and the quiet geometry of Tempe.",
    body: [
      "These are the frames I make for the love of the frame, not the brief. I walk the same blocks until a line of glass, shadow, and a stranger's stride find each other.",
      "Most are one-frame-then-move-on. The discipline is saying no more often than yes — the archive is better for it.",
      "Street work is ninety percent waiting. The other ten percent is a shutter press you can't explain.",
    ],
  },
];

export function allJournalEntries(): JournalEntry[] {
  return [...JOURNAL_ENTRIES].sort((a, b) => {
    const da = a.date ?? "";
    const db = b.date ?? "";
    return db.localeCompare(da) || a.title.localeCompare(b.title);
  });
}

export function journalEntry(slug: string): JournalEntry | undefined {
  return JOURNAL_ENTRIES.find((e) => e.slug === slug);
}

export function journalNeighbors(slug: string): {
  prev: JournalEntry | null;
  next: JournalEntry | null;
} {
  const list = allJournalEntries();
  const idx = list.findIndex((e) => e.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : null,
  };
}