import { useState } from 'react'
import { useAppData } from '../AppDataProvider'
import { RecordGrid } from '../components/RecordGrid'
import { recordsNewestFirst, searchRecords } from '../data'

export function HomePage() {
  const { state } = useAppData()
  const [query, setQuery] = useState('')
  const records = searchRecords(recordsNewestFirst(state.records), query)

  return (
    <main className="page page-wide">
      <h1>All records</h1>
      <label className="search">
        <span className="sr-only">Search by artist or album</span>
        <input
          type="search"
          placeholder="Search by artist or album"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {records.length > 0 ? (
        <RecordGrid records={records} />
      ) : (
        <p className="empty">No records found.</p>
      )}
    </main>
  )
}
