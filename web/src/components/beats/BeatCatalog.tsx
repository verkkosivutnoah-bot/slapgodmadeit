"use client";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BeatCard, BeatRow, TrackListHeader } from "./BeatRow";
import { GridIcon, ListIcon, PlayIcon, SearchIcon } from "@/components/ui/Icons";
import { PillTabs } from "@/components/ui/PillTabs";
import { EASE } from "@/components/ui/motion";
import { usePlayer } from "@/components/player/GlobalPlayer";
import { beats, GENRES, KEYS, MOODS, toPlayerTrack, type Genre, type Mood } from "@/data/beats";
import { licenseDeals } from "@/data/licenses";

const BPM_BANDS = [
  { id: "all", label: "Any BPM", min: 0, max: 999 },
  { id: "slow", label: "< 95 BPM", min: 0, max: 94 },
  { id: "mid", label: "95–125 BPM", min: 95, max: 125 },
  { id: "fast", label: "126–145 BPM", min: 126, max: 145 },
  { id: "faster", label: "> 145 BPM", min: 146, max: 999 },
];
const GENRE_TABS = ["All", ...GENRES] as const;

export function BeatCatalog() {
  const params = useSearchParams();
  const [q, setQ] = useState(() => params.get("q") ?? "");
  const [genre, setGenre] = useState<"All" | Genre>("All");
  const [moods, setMoods] = useState<Mood[]>([]);
  const [key, setKey] = useState("all");
  const [bpm, setBpm] = useState("all");
  const [sort, setSort] = useState("new");
  const [view, setView] = useState<"list" | "grid">("list");
  const [moreOpen, setMoreOpen] = useState(false);
  const player = usePlayer();

  const results = useMemo(() => {
    const band = BPM_BANDS.find((b) => b.id === bpm)!;
    const query = q.trim().toLowerCase();
    const list = beats.filter(
      (b) =>
        (genre === "All" || b.genre === genre) &&
        (moods.length === 0 || b.moods.some((m) => moods.includes(m))) &&
        (key === "all" || b.key === key) &&
        b.bpm >= band.min &&
        b.bpm <= band.max &&
        (!query || `${b.title} ${b.genre} ${b.bpm} bpm ${b.key} ${b.tags.join(" ")} ${b.moods.join(" ")}`.toLowerCase().includes(query))
    );
    if (sort === "bpm-asc") list.sort((a, b) => a.bpm - b.bpm);
    if (sort === "bpm-desc") list.sort((a, b) => b.bpm - a.bpm);
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [q, genre, moods, key, bpm, sort]);

  const extraFilters = moods.length + (key !== "all" ? 1 : 0) + (bpm !== "all" ? 1 : 0);
  const activeFilters = extraFilters + (genre !== "All" ? 1 : 0) + (q ? 1 : 0);
  const clear = () => {
    setQ("");
    setGenre("All");
    setMoods([]);
    setKey("all");
    setBpm("all");
  };

  return (
    <div className="container-sg">
      <p className="mb-10 text-center text-[13px] text-mute">
        {licenseDeals.bundle} · {licenseDeals.upgrade}
      </p>

      {/* toolbar */}
      <div role="search" aria-label="Filter beats" className="space-y-4">
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-sm">
            <label htmlFor="beat-search" className="sr-only">
              Search beats
            </label>
            <SearchIcon size={16} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              id="beat-search"
              type="search"
              placeholder="Search title, mood, BPM, key"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="input !h-12 !pl-12"
            />
          </div>
          <div className="flex items-center gap-2 md:ml-auto">
            <button type="button" className="btn btn-ghost btn-sm" aria-expanded={moreOpen} aria-controls="beat-more-filters" onClick={() => setMoreOpen((o) => !o)}>
              Filters{extraFilters ? ` · ${extraFilters}` : ""}
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => results.length && player.playQueue(results.map(toPlayerTrack), 0)} disabled={!results.length}>
              <PlayIcon size={12} /> Play all
            </button>
            <div role="group" aria-label="View" className="ml-auto flex rounded-full bg-stone-300/[0.07] p-1 md:ml-0">
              {(["list", "grid"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  aria-label={`${v} view`}
                  onClick={() => setView(v)}
                  className={`grid h-9 w-9 place-items-center rounded-full transition-colors duration-300 ${view === v ? "bg-white text-deep" : "text-mute hover:text-bone"}`}
                >
                  {v === "list" ? <ListIcon size={15} /> : <GridIcon size={15} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <PillTabs options={GENRE_TABS} value={genre} onChange={setGenre} label="Genre" />

        <AnimatePresence initial={false}>
          {moreOpen && (
            <motion.div
              id="beat-more-filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <label className="sr-only" htmlFor="f-bpm">
                  BPM
                </label>
                <select id="f-bpm" className="select" value={bpm} onChange={(e) => setBpm(e.target.value)}>
                  {BPM_BANDS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
                <label className="sr-only" htmlFor="f-key">
                  Key
                </label>
                <select id="f-key" className="select" value={key} onChange={(e) => setKey(e.target.value)}>
                  <option value="all">Any key</option>
                  {KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                <label className="sr-only" htmlFor="f-sort">
                  Sort
                </label>
                <select id="f-sort" className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="new">Newest</option>
                  <option value="bpm-asc">BPM ↑</option>
                  <option value="bpm-desc">BPM ↓</option>
                  <option value="az">A–Z</option>
                </select>
                <span className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden />
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className="chip"
                    aria-pressed={moods.includes(m)}
                    onClick={() => setMoods((a) => (a.includes(m) ? a.filter((x) => x !== m) : [...a, m]))}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-3 mt-10 flex items-center justify-between text-[13px] text-mute">
        <p aria-live="polite">
          {results.length} beat{results.length === 1 ? "" : "s"}
        </p>
        {activeFilters > 0 && (
          <button type="button" className="link-u hover:text-bone" onClick={clear}>
            Clear all
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {results.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-[24px] border border-line p-12 text-center">
            <p className="display text-[32px]">No beats match</p>
            <p className="mt-2 text-mute">Try fewer filters — or ask for a custom beat.</p>
          </motion.div>
        ) : view === "list" ? (
          <motion.div key={`list-${genre}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
            <TrackListHeader />
            <ul className="mt-2 space-y-0.5">
              {results.map((b, i) => (
                <BeatRow key={b.id} beat={b} queue={results} index={i} />
              ))}
            </ul>
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${genre}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="grid grid-cols-1 gap-x-5 gap-y-10 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {results.map((b) => (
              <BeatCard key={b.id} beat={b} queue={results} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
