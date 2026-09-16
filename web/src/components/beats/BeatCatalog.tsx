"use client";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { BeatCard, BeatRow } from "./BeatRow";
import { GridIcon, ListIcon, PlayIcon } from "@/components/ui/Icons";
import { usePlayer } from "@/components/player/GlobalPlayer";
import { beats, GENRES, KEYS, MOODS, toPlayerTrack, type Genre, type Mood } from "@/data/beats";
import { licenseDeals } from "@/data/licenses";

const BPM_BANDS = [
  { id: "all", label: "Any BPM", min: 0, max: 999 },
  { id: "slow", label: "< 95", min: 0, max: 94 },
  { id: "mid", label: "95–125", min: 95, max: 125 },
  { id: "fast", label: "126–145", min: 126, max: 145 },
  { id: "faster", label: "> 145", min: 146, max: 999 },
];

export function BeatCatalog() {
  const [q, setQ] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [key, setKey] = useState("all");
  const [bpm, setBpm] = useState("all");
  const [sort, setSort] = useState("new");
  const [view, setView] = useState<"list" | "grid">("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const player = usePlayer();

  const results = useMemo(() => {
    const band = BPM_BANDS.find((b) => b.id === bpm)!;
    const query = q.trim().toLowerCase();
    const list = beats.filter(
      (b) =>
        (genres.length === 0 || genres.includes(b.genre)) &&
        (moods.length === 0 || b.moods.some((m) => moods.includes(m))) &&
        (key === "all" || b.key === key) &&
        b.bpm >= band.min &&
        b.bpm <= band.max &&
        (!query || `${b.title} ${b.genre} ${b.tags.join(" ")} ${b.moods.join(" ")}`.toLowerCase().includes(query))
    );
    if (sort === "bpm-asc") list.sort((a, b) => a.bpm - b.bpm);
    if (sort === "bpm-desc") list.sort((a, b) => b.bpm - a.bpm);
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [q, genres, moods, key, bpm, sort]);

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const activeFilters = genres.length + moods.length + (key !== "all" ? 1 : 0) + (bpm !== "all" ? 1 : 0) + (q ? 1 : 0);

  return (
    <div className="container-sg">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="inline-flex h-8 items-center rounded-full bg-gold px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
          {licenseDeals.bundle}
        </span>
        <span className="tag">{licenseDeals.upgrade}</span>
      </div>

      {/* filters */}
      <div className="panel mb-8 space-y-4 p-3 sm:p-5 md:sticky md:top-24 md:z-30" role="search" aria-label="Filter beats">
        <div className="flex gap-2 md:hidden">
          <label htmlFor="beat-search-m" className="sr-only">
            Search beats
          </label>
          <input
            id="beat-search-m"
            type="search"
            placeholder="Search beats…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input !h-12 flex-1"
          />
          <button
            type="button"
            className="btn btn-ghost !h-12 shrink-0 !px-4"
            aria-expanded={filtersOpen}
            aria-controls="beat-filters"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            Filters{activeFilters - (q ? 1 : 0) > 0 ? ` (${activeFilters - (q ? 1 : 0)})` : ""}
          </button>
        </div>
        <div id="beat-filters" className={`${filtersOpen ? "block" : "hidden"} space-y-4 md:block`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label htmlFor="beat-search" className="sr-only">
            Search beats
          </label>
          <input
            id="beat-search"
            type="search"
            placeholder="Search title, vibe, tag…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input !h-11 hidden md:block md:max-w-xs"
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="f-bpm">
              BPM
            </label>
            <select id="f-bpm" className="select" value={bpm} onChange={(e) => setBpm(e.target.value)}>
              {BPM_BANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                  {b.id !== "all" ? " BPM" : ""}
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
          </div>
          <div className="flex items-center gap-2 md:ml-auto">
            <button
              type="button"
              className="btn btn-sm btn-ghost !h-10"
              onClick={() => results.length && player.playQueue(results.map(toPlayerTrack), 0)}
              disabled={!results.length}
            >
              <PlayIcon size={12} /> Play all
            </button>
            <div role="group" aria-label="View" className="flex rounded-full border border-line p-1">
              {(["list", "grid"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  aria-label={`${v} view`}
                  onClick={() => setView(v)}
                  className={`grid h-8 w-8 place-items-center rounded-full transition ${view === v ? "bg-bone text-ink" : "text-mute hover:text-bone"}`}
                >
                  {v === "list" ? <ListIcon size={15} /> : <GridIcon size={15} />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="-mx-1 flex flex-wrap gap-2 px-1 md:no-scrollbar md:flex-nowrap md:overflow-x-auto md:[scrollbar-width:none]" role="group" aria-label="Genre and mood">
          {GENRES.map((g) => (
            <button key={g} type="button" className="chip shrink-0" aria-pressed={genres.includes(g)} onClick={() => setGenres((a) => toggle(a, g))}>
              {g}
            </button>
          ))}
          <span className="mx-1 hidden w-px shrink-0 bg-line md:block" aria-hidden />
          {MOODS.map((m) => (
            <button key={m} type="button" className="chip shrink-0" aria-pressed={moods.includes(m)} onClick={() => setMoods((a) => toggle(a, m))}>
              {m}
            </button>
          ))}
        </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between font-mono text-xs text-mute">
        <p aria-live="polite">
          {results.length} beat{results.length === 1 ? "" : "s"}
        </p>
        {activeFilters > 0 && (
          <button
            type="button"
            className="underline underline-offset-2 hover:text-bone"
            onClick={() => {
              setQ("");
              setGenres([]);
              setMoods([]);
              setKey("all");
              setBpm("all");
            }}
          >
            Clear filters ({activeFilters})
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {results.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="panel p-12 text-center">
            <p className="display text-4xl">No beats match</p>
            <p className="mt-2 text-mute">Try fewer filters — or ask for a custom beat.</p>
          </motion.div>
        ) : view === "list" ? (
          <motion.ul key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1">
            {results.map((b, i) => (
              <BeatRow key={b.id} beat={b} queue={results} index={i} />
            ))}
          </motion.ul>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
