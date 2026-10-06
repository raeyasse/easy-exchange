// Album cover lookup via the iTunes Search API, cached in localStorage.
// The cache stores a URL for found covers and null for "no cover found";
// failed requests are not cached, so they are retried on a later visit.

const CACHE_KEY = 'easy-exchange-covers'
const SEARCH_URL = 'https://itunes.apple.com/search'
const IMAGE_SIZE = 600
const MAX_CONCURRENT = 3

type CoverCache = { [key: string]: string | null }

type SearchResult = {
  artistName?: string
  collectionName?: string
  artworkUrl100?: string
}

export function normalize(text: string, dropBrackets = true): string {
  let result = text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/&/g, ' and ')
  if (dropBrackets) result = result.replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
  return result
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/^the /, '')
}

function artistMatches(found: string, wanted: string): boolean {
  const a = normalize(found)
  const b = normalize(wanted)
  return a === b || a.startsWith(`${b} `) || b.startsWith(`${a} `)
}

// Picks the result for this artist + album: an exact title match first,
// then one that only differs by a bracketed edition note like "(Remastered)".
export function pickCover(results: SearchResult[], artist: string, title: string): string | null {
  const candidates = results.filter(
    (r) => r.artworkUrl100 && r.artistName && r.collectionName && artistMatches(r.artistName, artist),
  )
  const exact = candidates.find(
    (r) => normalize(r.collectionName!, false) === normalize(title, false),
  )
  const edition = candidates.find((r) => normalize(r.collectionName!) === normalize(title))
  const match = exact ?? edition
  return match ? match.artworkUrl100!.replace(/\/100x100bb\./, `/${IMAGE_SIZE}x${IMAGE_SIZE}bb.`) : null
}

function cacheKey(artist: string, title: string): string {
  return `${normalize(artist, false)}|${normalize(title, false)}`
}

function readCache(): CoverCache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as CoverCache
  } catch {
    return {}
  }
}

function writeCache(key: string, value: string | null): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...readCache(), [key]: value }))
  } catch {
    // Storage full or unavailable: the cover still shows, it just isn't cached.
  }
}

// Returns the cached result, or undefined if this album hasn't been looked up yet.
export function cachedCover(artist: string, title: string): string | null | undefined {
  const cache = readCache()
  const key = cacheKey(artist, title)
  return key in cache ? cache[key] : undefined
}

const inFlight = new Map<string, Promise<string | null>>()
const waiting: Array<() => void> = []
let active = 0

async function withSlot<T>(task: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) await new Promise<void>((resolve) => waiting.push(resolve))
  active++
  try {
    return await task()
  } finally {
    active--
    waiting.shift()?.()
  }
}

async function fetchCover(artist: string, title: string): Promise<string | null> {
  const params = new URLSearchParams({ term: `${artist} ${title}`, entity: 'album', limit: '10' })
  const response = await fetch(`${SEARCH_URL}?${params}`)
  if (!response.ok) throw new Error(`iTunes search failed: ${response.status}`)
  const data = (await response.json()) as { results?: SearchResult[] }
  return pickCover(data.results ?? [], artist, title)
}

// Resolves to a cover URL or null (no cover). Rejects if the request fails.
export function lookUpCover(artist: string, title: string): Promise<string | null> {
  const cached = cachedCover(artist, title)
  if (cached !== undefined) return Promise.resolve(cached)

  const key = cacheKey(artist, title)
  let pending = inFlight.get(key)
  if (!pending) {
    pending = withSlot(() => fetchCover(artist, title))
      .then((url) => {
        writeCache(key, url)
        return url
      })
      .finally(() => inFlight.delete(key))
    inFlight.set(key, pending)
  }
  return pending
}
