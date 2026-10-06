import type { AppState, Record as VinylRecord } from './types'

export const CONDITIONS = [
  'Mint',
  'Near Mint',
  'Very Good',
  'Good',
  'Poor',
] as const

export const GENRES = [
  'Rock',
  'Jazz',
  'Hip-Hop',
  'Soul/R&B',
  'Electronic',
  'Pop',
  'Other',
] as const

export type Condition = (typeof CONDITIONS)[number]
export type Genre = (typeof GENRES)[number]

export type RecordFields = {
  artist: string
  title: string
  year: string
  condition: string
  genre: string
  notes: string
}

export type FieldErrors = {
  artist?: string
  title?: string
  year?: string
  condition?: string
  genre?: string
  notes?: string
}

export function validateRecordFields(fields: RecordFields): FieldErrors {
  const errors: FieldErrors = {}
  const currentYear = new Date().getFullYear()

  if (!fields.artist.trim()) errors.artist = 'Artist is required.'
  if (!fields.title.trim()) errors.title = 'Album title is required.'

  const yearText = fields.year.trim()
  if (yearText) {
    const year = Number(yearText)
    if (!Number.isInteger(year) || year < 1900 || year > currentYear) {
      errors.year = `Year must be between 1900 and ${currentYear}.`
    }
  }

  if (!CONDITIONS.includes(fields.condition as Condition)) {
    errors.condition = 'Condition is required.'
  }
  if (!GENRES.includes(fields.genre as Genre)) {
    errors.genre = 'Genre is required.'
  }
  if (fields.notes.length > 300) {
    errors.notes = 'Notes must be 300 characters or fewer.'
  }

  return errors
}

export function recordsNewestFirst(records: VinylRecord[]): VinylRecord[] {
  return [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function searchRecords(
  records: VinylRecord[],
  query: string,
): VinylRecord[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return records
  return records.filter(
    (record) =>
      record.artist.toLowerCase().includes(needle) ||
      record.title.toLowerCase().includes(needle),
  )
}

export function recordsForUser(
  records: VinylRecord[],
  userId: string,
): VinylRecord[] {
  return records.filter((record) => record.ownerId === userId)
}

export function isInPendingTrade(state: AppState, recordId: string): boolean {
  return state.trades.some(
    (trade) =>
      trade.status === 'pending' &&
      (trade.offeredRecordIds.includes(recordId) ||
        trade.requestedRecordIds.includes(recordId)),
  )
}

function toVinylRecord(
  id: string,
  ownerId: string,
  createdAt: string,
  fields: RecordFields,
): VinylRecord {
  const record: VinylRecord = {
    id,
    ownerId,
    artist: fields.artist.trim(),
    title: fields.title.trim(),
    condition: fields.condition as Condition,
    genre: fields.genre,
    createdAt,
  }
  const yearText = fields.year.trim()
  if (yearText) record.year = Number(yearText)
  const notes = fields.notes.trim()
  if (notes) record.notes = notes
  return record
}

export function addRecord(state: AppState, fields: RecordFields): AppState {
  const record = toVinylRecord(
    `r-${crypto.randomUUID()}`,
    state.activeUserId,
    new Date().toISOString(),
    fields,
  )
  return { ...state, records: [...state.records, record] }
}

export function updateRecord(
  state: AppState,
  recordId: string,
  fields: RecordFields,
): AppState {
  return {
    ...state,
    records: state.records.map((record) =>
      record.id === recordId
        ? toVinylRecord(record.id, record.ownerId, record.createdAt, fields)
        : record,
    ),
  }
}

export function deleteRecord(state: AppState, recordId: string): AppState {
  return {
    ...state,
    records: state.records.filter((record) => record.id !== recordId),
  }
}

export function setActiveUser(state: AppState, userId: string): AppState {
  return { ...state, activeUserId: userId }
}

export function lastAddedRecordId(before: AppState, after: AppState): string {
  const beforeIds = new Set(before.records.map((record) => record.id))
  const added = after.records.find((record) => !beforeIds.has(record.id))
  if (!added) throw new Error('Record was not created.')
  return added.id
}
