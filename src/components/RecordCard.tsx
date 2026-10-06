import { Link } from 'react-router-dom'
import { useAppData } from '../AppDataProvider'
import type { Record as VinylRecord } from '../data/types'
import { RecordCover } from './RecordCover'

export function RecordCard({ record }: { record: VinylRecord }) {
  const { activeUser, state } = useAppData()
  const owner = state.users.find((user) => user.id === record.ownerId)
  const mine = record.ownerId === activeUser.id

  return (
    <article className="card">
      <Link to={`/records/${record.id}`} className="card-main">
        <RecordCover artist={record.artist} />
        <div>
          <h2>{record.title}</h2>
          <p>{record.artist}{record.year ? ` · ${record.year}` : ''}</p>
          {mine ? <p className="badge">Yours</p> : null}
        </div>
      </Link>
      {owner ? (
        <Link to={`/users/${owner.id}`} className="card-owner">
          {owner.name}
        </Link>
      ) : null}
    </article>
  )
}
