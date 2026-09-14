// Tiny global "audio focus" store.
// - Only one MusicPlayer instance plays at a time: claiming focus pauses the previous owner.
// - Only the focus owner (or the default instance when nobody owns focus) reacts to keyboard shortcuts.

type Pauser = () => void;

const pausers = new Map<string, Pauser>();
let owner: string | null = null;
export const DEFAULT_SHORTCUT_OWNER = "global-dock";

export const audioFocus = {
  register(id: string, pause: Pauser) {
    pausers.set(id, pause);
    return () => {
      pausers.delete(id);
      if (owner === id) owner = null;
    };
  },
  claim(id: string) {
    if (owner && owner !== id) pausers.get(owner)?.();
    owner = id;
  },
  ownsShortcuts(id: string) {
    if (owner && pausers.has(owner)) return owner === id;
    return id === DEFAULT_SHORTCUT_OWNER;
  },
};
