import type { Record as VinylRecord } from '../data/types'
import { RecordCard } from './RecordCard'

export function RecordGrid({ records }: { records: VinylRecord[] }) {
  return (
    <ul className="grid">
      {records.map((record) => (
        <li key={record.id}>
          <RecordCard record={record} />
        </li>
      ))}
    </ul>
  )
}
