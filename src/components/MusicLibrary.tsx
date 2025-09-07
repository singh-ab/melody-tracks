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
      // Type-safe property access for known groupBy values
      const key =
        groupBy === "album"
          ? song.album
          : groupBy === "artist"
          ? song.artist
          : "";
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
        <div key={group} style={groupContainer}>
          <h3 style={groupHeader}>
            <span style={groupIcon}>🎵</span>
            {group}
            <span style={groupCount}>({songs.length})</span>
          </h3>
          <div style={songsGrid}>
            {songs.map((song) => (
              <div key={song.id} style={songCard}>
                <div style={songArtwork}>
                  <div style={songArtworkIcon}>♪</div>
                </div>
                <div style={songInfo}>
                  <div style={songTitle}>{song.title}</div>
                  <div style={songArtist}>{song.artist}</div>
                  <div style={songAlbum}>{song.album}</div>
                  <div style={songMeta}>
                    <span>{song.year ?? "—"}</span>
                  </div>
                </div>
                {role === "admin" && (
                  <button
                    onClick={() =>
                      dispatch({ type: "delete", payload: { id: song.id } })
                    }
                    style={deleteButton}
                    title="Delete track"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))
    ) : (
      <div style={songsGrid}>
        {filtered.map((song) => (
          <div key={song.id} style={songCard}>
            <div style={songArtwork}>
              <div style={songArtworkIcon}>♪</div>
            </div>
            <div style={songInfo}>
              <div style={songTitle}>{song.title}</div>
              <div style={songArtist}>{song.artist}</div>
              <div style={songAlbum}>{song.album}</div>
              <div style={songMeta}>
                <span>{song.year ?? "—"}</span>
              </div>
            </div>
            {role === "admin" && (
              <button
                onClick={() =>
                  dispatch({ type: "delete", payload: { id: song.id } })
                }
                style={deleteButton}
                title="Delete track"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    );

  return (
    <div style={containerStyle} className="animate-fadeIn">
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          <span style={titleIcon}>🎧</span>
          Music Library
        </h2>
        <div style={statsStyle}>
          {filtered.length} tracks • {state.songs.length} total
        </div>
      </div>

      <div style={filtersContainer}>
        <div style={filtersBar}>
          <input
            placeholder="Search all tracks..."
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            style={searchInput}
          />
          <input
            placeholder="Artist"
            value={filters.artist}
            onChange={(e) =>
              setFilters((f) => ({ ...f, artist: e.target.value }))
            }
            style={filterInput}
          />
          <input
            placeholder="Album"
            value={filters.album}
            onChange={(e) =>
              setFilters((f) => ({ ...f, album: e.target.value }))
            }
            style={filterInput}
          />
        </div>

        <div style={controlsBar}>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            style={selectStyle}
          >
            <option value="title">Sort by Title</option>
            <option value="artist">Sort by Artist</option>
            <option value="album">Sort by Album</option>
            <option value="year">Sort by Year</option>
          </select>
          <button
            onClick={() => setSortDir((d) => (d === 1 ? -1 : 1))}
            style={sortButton}
            title={`Sort ${sortDir === 1 ? "Ascending" : "Descending"}`}
          >
            {sortDir === 1 ? "↑" : "↓"}
          </button>
          <select
            value={groupBy}
            onChange={(e) =>
              setGroupBy(e.target.value as "" | "album" | "artist")
            }
            style={selectStyle}
          >
            <option value="">No Grouping</option>
            <option value="album">Group by Album</option>
            <option value="artist">Group by Artist</option>
          </select>

          {role === "admin" && (
            <>
              <button
                onClick={() => setShowAdd((s) => !s)}
                style={showAdd ? cancelButton : addButton}
              >
                {showAdd ? "Cancel" : "+ Add Song"}
              </button>
              <button
                onClick={() => dispatch({ type: "reset" })}
                style={resetButton}
                title="Reset to original songs"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {showAdd && role === "admin" && (
        <div style={addFormContainer}>
          <h3 style={addFormTitle}>Add New Track</h3>
          <form onSubmit={handleAdd} style={addForm}>
            <input
              required
              placeholder="Song Title"
              value={newSong.title}
              onChange={(e) =>
                setNewSong((s) => ({ ...s, title: e.target.value }))
              }
              style={formInput}
            />
            <input
              required
              placeholder="Artist Name"
              value={newSong.artist}
              onChange={(e) =>
                setNewSong((s) => ({ ...s, artist: e.target.value }))
              }
              style={formInput}
            />
            <input
              required
              placeholder="Album Title"
              value={newSong.album}
              onChange={(e) =>
                setNewSong((s) => ({ ...s, album: e.target.value }))
              }
              style={formInput}
            />
            <input
              placeholder="Year"
              type="number"
              value={newSong.year}
              onChange={(e) =>
                setNewSong((s) => ({ ...s, year: e.target.value }))
              }
              style={{ ...formInput, width: 120 }}
            />
            <button type="submit" style={saveButton}>
              Save Track
            </button>
          </form>
        </div>
      )}

      <div style={libraryContainer}>
        {filtered.length === 0 ? (
          <div style={emptyState}>
            <div style={emptyIcon}>🎵</div>
            <div style={emptyTitle}>No tracks found</div>
            <div style={emptyMessage}>
              {Object.values(filters).some((f) => f)
                ? "Try adjusting your search filters"
                : "Add some music to get started"}
            </div>
          </div>
        ) : (
          libraryBody
        )}
      </div>

      <div style={footerStyle}>
        Using map/filter/reduce with client-side state • Built with React &
        TypeScript
      </div>
    </div>
  );
};

// Enhanced Modern Styles for Music App
const containerStyle: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 50%, rgba(15, 15, 30, 0.95) 100%)",
  border: "1px solid rgba(100, 108, 255, 0.2)",
  borderRadius: "16px",
  padding: "2rem",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  fontFamily: "Poppins, system-ui, sans-serif",
  color: "#ffffff",
  position: "relative",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "2rem",
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  fontSize: "2.5rem",
  fontWeight: "700",
  background: "linear-gradient(135deg, #646cff 0%, #7c3aed 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  marginBottom: "0.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
};

const titleIcon: React.CSSProperties = {
  fontSize: "2rem",
  filter: "drop-shadow(0 0 10px rgba(100, 108, 255, 0.5))",
};

const statsStyle: React.CSSProperties = {
  color: "#b8c5d1",
  fontSize: "1rem",
  fontWeight: "400",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
};

const filtersContainer: React.CSSProperties = {
  marginBottom: "2rem",
  background: "rgba(22, 33, 62, 0.6)",
  padding: "1.5rem",
  borderRadius: "16px",
  border: "1px solid rgba(100, 108, 255, 0.1)",
  backdropFilter: "blur(10px)",
};

const filtersBar: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
  marginBottom: "1rem",
};

const controlsBar: React.CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "flex-start",
};

const searchInput: React.CSSProperties = {
  flex: "2",
  minWidth: "250px",
  padding: "0.8rem 1rem",
  fontSize: "1rem",
  border: "2px solid rgba(100, 108, 255, 0.2)",
  borderRadius: "12px",
  background: "rgba(15, 15, 30, 0.8)",
  color: "#ffffff",
  fontWeight: "400",
};

const filterInput: React.CSSProperties = {
  flex: "1",
  minWidth: "120px",
  padding: "0.8rem 1rem",
  fontSize: "0.9rem",
  border: "1px solid rgba(100, 108, 255, 0.2)",
  borderRadius: "10px",
  background: "rgba(15, 15, 30, 0.6)",
  color: "#ffffff",
};

const selectStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.9rem",
  border: "1px solid rgba(100, 108, 255, 0.2)",
  borderRadius: "10px",
  background: "rgba(15, 15, 30, 0.8)",
  color: "#ffffff",
  fontWeight: "500",
};

const sortButton: React.CSSProperties = {
  width: "40px",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.2rem",
  fontWeight: "bold",
  background: "rgba(100, 108, 255, 0.2)",
  border: "1px solid rgba(100, 108, 255, 0.3)",
  borderRadius: "10px",
  color: "#646cff",
};

const addButton: React.CSSProperties = {
  background: "rgba(100, 108, 255, 0.2)",
  border: "1px solid rgba(100, 108, 255, 0.3)",
  color: "#646cff",
  fontWeight: "600",
  padding: "0.75rem 1.25rem",
  borderRadius: "12px",
  fontSize: "0.9rem",
};

const cancelButton: React.CSSProperties = {
  background: "rgba(100, 108, 255, 0.1)",
  border: "1px solid rgba(100, 108, 255, 0.2)",
  color: "#8892b0",
  fontWeight: "600",
  padding: "0.75rem 1.25rem",
  borderRadius: "12px",
  fontSize: "0.9rem",
};

const resetButton: React.CSSProperties = {
  background: "rgba(100, 108, 255, 0.1)",
  border: "1px solid rgba(100, 108, 255, 0.2)",
  color: "#8892b0",
  fontWeight: "500",
  padding: "0.75rem 1rem",
  borderRadius: "12px",
  fontSize: "0.9rem",
};

const addFormContainer: React.CSSProperties = {
  background: "rgba(22, 33, 62, 0.8)",
  padding: "2rem",
  borderRadius: "16px",
  border: "1px solid rgba(100, 108, 255, 0.2)",
  marginBottom: "2rem",
  backdropFilter: "blur(15px)",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
};

const addFormTitle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "1.5rem",
  fontWeight: "600",
  marginBottom: "1.5rem",
  textAlign: "center",
};

const addForm: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
  alignItems: "flex-end",
};

const formInput: React.CSSProperties = {
  flex: "1",
  minWidth: "180px",
  padding: "0.8rem 1rem",
  fontSize: "0.9rem",
  border: "1px solid rgba(100, 108, 255, 0.2)",
  borderRadius: "10px",
  background: "rgba(15, 15, 30, 0.8)",
  color: "#ffffff",
};

const saveButton: React.CSSProperties = {
  background: "linear-gradient(135deg, #646cff 0%, #7c3aed 100%)",
  border: "none",
  color: "#ffffff",
  fontWeight: "600",
  padding: "0.8rem 1.5rem",
  borderRadius: "12px",
  fontSize: "0.9rem",
  boxShadow: "0 4px 15px rgba(100, 108, 255, 0.3)",
};

const libraryContainer: React.CSSProperties = {
  minHeight: "400px",
  marginBottom: "1.5rem",
};

const songsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "1.5rem",
  padding: "1rem 0",
};

const songCard: React.CSSProperties = {
  background: "rgba(22, 33, 62, 0.6)",
  border: "1px solid rgba(100, 108, 255, 0.15)",
  borderRadius: "16px",
  padding: "1.5rem",
  position: "relative",
  backdropFilter: "blur(10px)",
  overflow: "hidden",
};

const songArtwork: React.CSSProperties = {
  width: "60px",
  height: "60px",
  background: "linear-gradient(135deg, #646cff 0%, #7c3aed 100%)",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "1rem",
  boxShadow: "0 8px 25px rgba(100, 108, 255, 0.3)",
  float: "left",
  marginRight: "1rem",
};

const songArtworkIcon: React.CSSProperties = {
  fontSize: "1.5rem",
  color: "#ffffff",
  fontWeight: "bold",
};

const songInfo: React.CSSProperties = {
  overflow: "hidden",
};

const songTitle: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "#ffffff",
  marginBottom: "0.3rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const songArtist: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "#b8c5d1",
  fontWeight: "500",
  marginBottom: "0.2rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const songAlbum: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "#8892b0",
  marginBottom: "0.5rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const songMeta: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "0.75rem",
  color: "#8892b0",
  marginTop: "0.5rem",
  clear: "both",
};

const deleteButton: React.CSSProperties = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  width: "28px",
  height: "28px",
  background: "rgba(239, 68, 68, 0.2)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: "8px",
  color: "#ef4444",
  fontSize: "0.8rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: "0.7",
  padding: 0,
};

const groupContainer: React.CSSProperties = {
  marginBottom: "2.5rem",
};

const groupHeader: React.CSSProperties = {
  fontSize: "1.4rem",
  fontWeight: "600",
  color: "#ffffff",
  marginBottom: "1rem",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  background: "rgba(100, 108, 255, 0.1)",
  borderRadius: "12px",
  border: "1px solid rgba(100, 108, 255, 0.2)",
};

const groupIcon: React.CSSProperties = {
  fontSize: "1.2rem",
  color: "#646cff",
};

const groupCount: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "#8892b0",
  fontWeight: "400",
  marginLeft: "auto",
};

const emptyState: React.CSSProperties = {
  textAlign: "center",
  padding: "4rem 2rem",
  color: "#8892b0",
};

const emptyIcon: React.CSSProperties = {
  fontSize: "4rem",
  marginBottom: "1rem",
  opacity: 0.5,
};

const emptyTitle: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: "600",
  color: "#b8c5d1",
  marginBottom: "0.5rem",
};

const emptyMessage: React.CSSProperties = {
  fontSize: "1rem",
  color: "#8892b0",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "0.8rem",
  color: "#8892b0",
  fontWeight: "400",
  padding: "1rem 0",
  borderTop: "1px solid rgba(100, 108, 255, 0.1)",
  marginTop: "1rem",
};

export default MusicLibrary;
