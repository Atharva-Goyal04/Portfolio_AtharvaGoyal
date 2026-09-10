export interface JournalFigure {
  src: string;
  caption: string;
}

export interface JournalEntry {
  slug: string;
  title: string;
  category: string;
  date?: string;
  location?: string;
  camera?: string;
  cover: string;
  frames: string[];
  figures?: JournalFigure[];
  figuresLabel?: string;
  figuresTitle?: string;
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
    cover: "/images/portraits/the-quiet-hour/portrait-thequiethour-1.jpg",
    frames: [
      "/images/portraits/the-quiet-hour/portrait-thequiethour-2.jpg",
      "/images/portraits/the-quiet-hour/portrait-thequiethour-3.jpg",
      "/images/portraits/the-quiet-hour/portrait-thequiethour-4.jpg",
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
    cover: "/images/side-projects/summer-picnic/miscellaneous-summerpicnic-1.jpg",
    frames: [
      "/images/side-projects/summer-picnic/miscellaneous-summerpicnic-2.jpg",
      "/images/side-projects/summer-picnic/miscellaneous-summerpicnic-3.jpg",
      "/images/side-projects/summer-picnic/miscellaneous-summerpicnic-4.jpg",
      "/images/side-projects/summer-picnic/miscellaneous-summerpicnic-5.jpg",
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
    slug: "two-homes-one-light",
    title: "Two Homes, One Light",
    category: "Notes",
    date: "2026-09",
    location: "Udaipur · Tempe",
    camera: "Sony a7 IV",
    cover: "/maps/udaipur.webp",
    frames: [],
    figures: [
      {
        src: "/maps/udaipur.webp",
        caption: "Udaipur, Rajasthan — where I first picked up the camera",
      },
      {
        src: "/maps/tempe.webp",
        caption: "Tempe, Arizona — where I live and shoot now",
      },
    ],
    figuresLabel: "Two homes",
    figuresTitle: "The same light, two addresses",
    excerpt:
      "From the lakeside mornings of Udaipur to the desert afternoons of Tempe — the same light, a long way from home.",
    body: [
      "I started with a camera in Udaipur, though calling it a start almost undersells it. The city refuses to be ignored — pale havelis stacked around the water, saffron against grey stone at dawn, heat that sits on the lake like silk. Who could resist trying to hold on to a little of that? I didn't want to document it. I wanted to keep it.",
      "So I kept it the only way I knew how — a frame at a time. Udaipur taught me what I was looking for long before I had a word for it: light that carries a mood, a color, a temperature. Everything since has been a variation on that first morning.",
      "Tempe is a different kind of beautiful. Where Udaipur asks you to look, Arizona makes you work for it — the light here is dry, honest, and ruthless at noon. At Arizona State I've been turning instinct into craft: client sessions, private galleries, deliveries built to outlast a season. The lakes traded for canals, the havelis for glass, but the reasons I shoot haven't moved.",
      "Two homes, one light — and a camera in the middle of it.",
    ],
  },
  {
    slug: "aperture-notes-the-sidewalks",
    title: "Aperture Notes — The Sidewalks",
    category: "Notes",
    location: "Tempe, AZ",
    camera: "Sony a7 IV",
    cover: "/images/street/color-hunt-green/street-colorhunt_green-1.jpg",
    frames: [
      "/images/street/color-hunt-green/street-colorhunt_green-2.jpg",
      "/images/street/color-hunt-green/street-colorhunt_green-3.jpg",
      "/images/street/color-hunt-green/street-colorhunt_green-4.jpg",
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