import { createSeedState } from './seed'
import type { AppState } from './types'

const STORAGE_KEY = 'easy-exchange'

export function loadState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seeded = createSeedState()
    saveState(seeded)
    return seeded
  }

  const parsed = JSON.parse(raw) as AppState
  const known = parsed.users?.some((user) => user.id === parsed.activeUserId)
  if (!known) {
    parsed.activeUserId = 'u1'
    saveState(parsed)
  }
  return parsed
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
