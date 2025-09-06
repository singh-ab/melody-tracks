// Define Song interface locally to avoid Module Federation type import issues
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  year?: number;
  durationSec?: number;
}

export const seedSongs: Song[] = [
  {
    id: "1",
    title: "Everlong",
    artist: "Foo Fighters",
    album: "The Colour and the Shape",
    year: 1997,
    durationSec: 250,
  },
  {
    id: "2",
    title: "Yellow",
    artist: "Coldplay",
    album: "Parachutes",
    year: 2000,
    durationSec: 269,
  },
  {
    id: "3",
    title: "Fix You",
    artist: "Coldplay",
    album: "X&Y",
    year: 2005,
    durationSec: 294,
  },
  {
    id: "4",
    title: "Hysteria",
    artist: "Muse",
    album: "Absolution",
    year: 2003,
    durationSec: 227,
  },
  {
    id: "5",
    title: "Starlight",
    artist: "Muse",
    album: "Black Holes and Revelations",
    year: 2006,
    durationSec: 240,
  },
  {
    id: "6",
    title: "Blackbird",
    artist: "Alter Bridge",
    album: "Blackbird",
    year: 2007,
    durationSec: 448,
  },
  {
    id: "7",
    title: "The Pretender",
    artist: "Foo Fighters",
    album: "Echoes, Silence, Patience & Grace",
    year: 2007,
    durationSec: 269,
  },
  {
    id: "8",
    title: "Times Like These",
    artist: "Foo Fighters",
    album: "One by One",
    year: 2002,
    durationSec: 255,
  },
  {
    id: "9",
    title: "In The End",
    artist: "Linkin Park",
    album: "Hybrid Theory",
    year: 2000,
    durationSec: 216,
  },
  {
    id: "10",
    title: "Numb",
    artist: "Linkin Park",
    album: "Meteora",
    year: 2003,
    durationSec: 187,
  },
];

const STORAGE_KEY = "music_library_songs_v1";

export function loadSongs(): Song[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedSongs));
      return seedSongs;
    }
    return JSON.parse(raw) as Song[];
  } catch {
    return seedSongs;
  }
}

export function saveSongs(songs: Song[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  } catch {
    // ignore
  }
}
