const PALETTE = ['#3d5a4c', '#5c4a3a', '#4a5568', '#6b3f4a', '#3f4f6b', '#5a4d3d']

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

export function RecordCover({ artist }: { artist: string }) {
  return (
    <div className="cover" style={{ background: coverColor(artist) }} aria-hidden="true">
      {artistInitials(artist)}
    </div>
  )
}
