/**
 * Local persistence layer.
 *
 * The original component was built for Claude.ai's artifact sandbox, which
 * exposes a `window.storage` API for saving data across sessions. That API
 * only exists inside Claude.ai, so for a standalone app we provide a
 * drop-in replacement with the same shape, backed by the browser's
 * localStorage. Swap this out for a real backend/database when you're
 * ready to move past local-only persistence.
 */

const PREFIX = "cola-factory-app::";

function fullKey(key) {
  return `${PREFIX}${key}`;
}

export const storage = {
  async get(key) {
    try {
      const raw = window.localStorage.getItem(fullKey(key));
      if (raw === null) return null;
      return { key, value: raw };
    } catch (e) {
      console.error("storage.get error", e);
      return null;
    }
  },

  async set(key, value) {
    try {
      window.localStorage.setItem(fullKey(key), value);
      return { key, value };
    } catch (e) {
      console.error("storage.set error", e);
      return null;
    }
  },

  async delete(key) {
    try {
      window.localStorage.removeItem(fullKey(key));
      return { key, deleted: true };
    } catch (e) {
      console.error("storage.delete error", e);
      return null;
    }
  },

  async list(prefix = "") {
    try {
      const keys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(fullKey(prefix))) {
          keys.push(k.slice(PREFIX.length));
        }
      }
      return { keys };
    } catch (e) {
      console.error("storage.list error", e);
      return null;
    }
  },
};
