import { useEffect, useState } from 'react'
import { cachedCover, lookUpCover } from '../data/covers'

const PALETTE = ['#24477a', '#8f2c3b', '#1d6656', '#9a6a12', '#553a87', '#2b2d2f']

export function artistInitials(artist: string): string {
  const words = artist.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function coverColor(artist: string): string {
  let hash = 0
  for (const char of artist) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

function useCoverUrl(artist: string, title: string): string | null {
  const [found, setFound] = useState<{ key: string; url: string | null }>()
  const key = `${artist}|${title}`

  useEffect(() => {
    if (cachedCover(artist, title) !== undefined) return
    let current = true
    lookUpCover(artist, title)
      .then((url) => current && setFound({ key, url }))
      .catch(() => {
        // Request failed: keep showing the placeholder.
      })
    return () => {
      current = false
    }
  }, [artist, title, key])

  const cached = cachedCover(artist, title)
  if (cached !== undefined) return cached
  return found?.key === key ? found.url : null
}

// The colored square with initials is always rendered; a real cover, when
// one is found, fades in on top of it once the image has finished loading.
export function RecordCover({ artist, title }: { artist: string; title: string }) {
  const url = useCoverUrl(artist, title)
  const [loaded, setLoaded] = useState<string | null>(null)
  const [failed, setFailed] = useState<string | null>(null)

  return (
    <div className="cover" style={{ background: coverColor(artist) }} aria-hidden="true">
      {artistInitials(artist)}
      {url && failed !== url ? (
        <img
          className={loaded === url ? 'cover-img cover-img-loaded' : 'cover-img'}
          src={url}
          alt=""
          onLoad={() => setLoaded(url)}
          onError={() => setFailed(url)}
        />
      ) : null}
    </div>
  )
}
