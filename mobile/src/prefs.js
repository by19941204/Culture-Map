import { useCallback, useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const KEYS = ['cm-lang', 'cm-theme', 'cm-me', 'cm-them', 'cm-context', 'cm-recent']

// Reads all persisted preferences once at startup. Returns null until loaded
// (the splash screen covers this — it resolves in a few ms).
export function useLoadedPrefs() {
  const [prefs, setPrefs] = useState(null)
  useEffect(() => {
    let alive = true
    AsyncStorage.multiGet(KEYS)
      .then((pairs) => {
        if (alive) setPrefs(Object.fromEntries(pairs))
      })
      .catch(() => {
        if (alive) setPrefs({})
      })
    return () => {
      alive = false
    }
  }, [])
  return prefs
}

export function savePref(key, value) {
  AsyncStorage.setItem(key, value).catch(() => {})
}

// State that starts from a loaded pref and writes back on change.
export function usePersistedState(key, initialValue, validate) {
  const [value, setValue] = useState(initialValue)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    savePref(key, String(value))
  }, [key, value])
  const set = useCallback(
    (v) => setValue((prev) => {
      const next = typeof v === 'function' ? v(prev) : v
      return validate && !validate(next) ? prev : next
    }),
    [validate],
  )
  return [value, set]
}
