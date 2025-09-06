import React, { useMemo, useReducer, useState } from "react";
import { loadSongs, saveSongs } from "../data/songs";
import type { Song } from "../data/songs";

interface Props {
  role: "admin" | "user";
}

type SortKey = "title" | "artist" | "album" | "year";
type State = { songs: Song[] };
type Action =
  | { type: "add"; payload: Omit<Song, "id"> }
  | { type: "delete"; payload: { id: string } }
  | { type: "reset" };

function songsReducer(state: State, action: Action): State {
  switch (action.type) {
    case "add": {
      const newSong: Song = { id: crypto.randomUUID(), ...action.payload };
      const songs = [...state.songs, newSong];
      saveSongs(songs);
      return { songs };
    }
    case "delete": {
      const songs = state.songs.filter((s) => s.id !== action.payload.id);
      saveSongs(songs);
      return { songs };
    }
    case "reset":
      saveSongs(loadSongs());
      return { songs: loadSongs() };
    default:
      return state;
  }
}

const MusicLibrary: React.FC<Props> = ({ role }) => {
  // debug: indicate when the remote mounts
  // eslint-disable-next-line no-console
  console.log("[music_library] MusicLibrary mounted, role=", role);
  const [state, dispatch] = useReducer(songsReducer, { songs: loadSongs() });
  const [filters, setFilters] = useState({ q: "", artist: "", album: "" });
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [groupBy, setGroupBy] = useState<"" | "album" | "artist">("");
  const [showAdd, setShowAdd] = useState(false);
  const [newSong, setNewSong] = useState({
    title: "",
    artist: "",
    album: "",
    year: "",
  });

  const filtered = useMemo(() => {
    return state.songs
      .filter((s) =>
        filters.q
          ? (s.title + s.artist + s.album)
              .toLowerCase()
              .includes(filters.q.toLowerCase())
          : true
      )
      .filter((s) =>
        filters.artist
          ? s.artist.toLowerCase().includes(filters.artist.toLowerCase())
          : true
      )
      .filter((s) =>
        filters.album
          ? s.album.toLowerCase().includes(filters.album.toLowerCase())
          : true
      )
      .sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        return av > bv ? sortDir : av < bv ? -sortDir : 0;
      });
  }, [state.songs, filters, sortKey, sortDir]);

  const grouped = useMemo(() => {
    if (!groupBy) return null;
    // Using reduce for grouping requirement
    return filtered.reduce<Record<string, Song[]>>((acc, song) => {
      const key = (song as any)[groupBy] as string;
      acc[key] = acc[key] || [];
      acc[key].push(song);
      return acc;
    }, {});
  }, [filtered, groupBy]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newSong.title || !newSong.artist || !newSong.album) return;
    dispatch({
      type: "add",
      payload: {
        title: newSong.title,
        artist: newSong.artist,
        album: newSong.album,
        year: newSong.year ? Number(newSong.year) : undefined,
      },
    });
    setNewSong({ title: "", artist: "", album: "", year: "" });
    setShowAdd(false);
  }

  const libraryBody =
    groupBy && grouped ? (
      Object.entries(grouped).map(([group, songs]) => (
        <div key={group} style={{ marginBottom: "1rem" }}>
          <h3 style={{ margin: "0.5rem 0" }}>
            {group} ({songs.length})
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {songs.map((song) => (
              <li key={song.id} style={rowStyle}>
                <span>{song.title}</span>
                <span>{song.artist}</span>
                <span>{song.album}</span>
                <span>{song.year ?? "-"}</span>
                {role === "admin" && (
                  <button
                    onClick={() =>
                      dispatch({ type: "delete", payload: { id: song.id } })
                    }
                    style={delBtn}
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))
    ) : (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {filtered.map((song) => (
          <li key={song.id} style={rowStyle}>
            <span>{song.title}</span>
            <span>{song.artist}</span>
            <span>{song.album}</span>
            <span>{song.year ?? "-"}</span>
            {role === "admin" && (
              <button
                onClick={() =>
                  dispatch({ type: "delete", payload: { id: song.id } })
                }
                style={delBtn}
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
    );

  return (
    <div style={{ border: "1px solid #444", padding: "1rem", borderRadius: 8 }}>
      <h2>Music Library</h2>
      <div style={filtersBar}>
        <input
          placeholder="Search all"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
        <input
          placeholder="Artist"
          value={filters.artist}
          onChange={(e) =>
            setFilters((f) => ({ ...f, artist: e.target.value }))
          }
        />
        <input
          placeholder="Album"
          value={filters.album}
          onChange={(e) => setFilters((f) => ({ ...f, album: e.target.value }))}
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
        >
          <option value="title">Title</option>
          <option value="artist">Artist</option>
          <option value="album">Album</option>
          <option value="year">Year</option>
        </select>
        <button onClick={() => setSortDir((d) => (d === 1 ? -1 : 1))}>
          {sortDir === 1 ? "Asc" : "Desc"}
        </button>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as any)}
        >
          <option value="">No Group</option>
          <option value="album">Group: Album</option>
          <option value="artist">Group: Artist</option>
        </select>
        {role === "admin" && (
          <>
            <button onClick={() => setShowAdd((s) => !s)}>
              {showAdd ? "Cancel" : "Add Song"}
            </button>
            <button onClick={() => dispatch({ type: "reset" })}>
              Reset Seed
            </button>
          </>
        )}
      </div>

      {showAdd && role === "admin" && (
        <form onSubmit={handleAdd} style={addForm}>
          <input
            required
            placeholder="Title"
            value={newSong.title}
            onChange={(e) =>
              setNewSong((s) => ({ ...s, title: e.target.value }))
            }
          />
          <input
            required
            placeholder="Artist"
            value={newSong.artist}
            onChange={(e) =>
              setNewSong((s) => ({ ...s, artist: e.target.value }))
            }
          />
          <input
            required
            placeholder="Album"
            value={newSong.album}
            onChange={(e) =>
              setNewSong((s) => ({ ...s, album: e.target.value }))
            }
          />
          <input
            placeholder="Year"
            type="number"
            value={newSong.year}
            onChange={(e) =>
              setNewSong((s) => ({ ...s, year: e.target.value }))
            }
            style={{ width: 90 }}
          />
          <button type="submit">Save</button>
        </form>
      )}

      <div style={headerRow}>
        <strong>Title</strong>
        <strong>Artist</strong>
        <strong>Album</strong>
        <strong>Year</strong>
        {role === "admin" && <span />}
      </div>
      <div style={{ maxHeight: 400, overflowY: "auto" }}>{libraryBody}</div>
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
        Using map/filter/reduce (grouping) with client-side state.
      </p>
    </div>
  );
};

const filtersBar: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  marginBottom: "0.75rem",
};

const headerRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr 1fr 70px 40px",
  gap: "0.5rem",
  padding: "0.4rem 0.5rem",
  background: "#333",
  borderRadius: 4,
  fontSize: 14,
};

const rowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr 1fr 70px 40px",
  gap: "0.5rem",
  alignItems: "center",
  padding: "0.35rem 0.5rem",
  borderBottom: "1px solid #222",
  fontSize: 14,
};

const addForm: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  marginBottom: "0.5rem",
};

const delBtn: React.CSSProperties = {
  background: "#552222",
  color: "white",
  border: "1px solid #773333",
  cursor: "pointer",
  padding: "0.3rem",
  borderRadius: 4,
};

export default MusicLibrary;
