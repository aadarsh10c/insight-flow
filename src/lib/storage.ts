type Envelope<T> = { version: number; data: T }

export type StorageAdapter<T> = {
  load: () => T | null
  save: (value: T) => void
  clear: () => void
}

export type MigrateFn<T> = (old: unknown, oldVersion: number) => T | null

export const createStorage = <T>(
  key: string,
  version: number,
  migrate?: MigrateFn<T>
): StorageAdapter<T> => {
  const save = (value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify({ version, data: value } satisfies Envelope<T>))
    } catch (err) {
      console.error(`[storage] failed to save ${key}:`, err)
    }
  }

  const load = (): T | null => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return null
      const parsed = JSON.parse(raw) as Envelope<T>
      if (parsed.version === version) return parsed.data
      if (migrate) {
        const migrated = migrate(parsed.data, parsed.version)
        if (migrated !== null) {
          save(migrated)
          return migrated
        }
      }
      localStorage.removeItem(key)
      return null
    } catch (err) {
      console.error(`[storage] failed to load ${key}:`, err)
      try {
        localStorage.removeItem(key)
      } catch {
        /* ignore */
      }
      return null
    }
  }

  const clear = (): void => {
    try {
      localStorage.removeItem(key)
    } catch (err) {
      console.error(`[storage] failed to clear ${key}:`, err)
    }
  }

  return { load, save, clear }
}
