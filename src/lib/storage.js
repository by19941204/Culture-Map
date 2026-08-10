// localStorage can throw (private browsing, sandboxed iframes, disabled
// storage) — degrade to in-memory persistence instead of crashing.
const memory = new Map()

export function loadPref(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return memory.get(key) ?? null
  }
}

export function savePref(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    memory.set(key, value)
  }
}
