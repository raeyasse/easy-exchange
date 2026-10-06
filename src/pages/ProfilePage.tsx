import { useParams } from 'react-router-dom'
import { useAppData, userById } from '../AppDataProvider'
import { RecordGrid } from '../components/RecordGrid'
import { recordsForUser, recordsNewestFirst } from '../data'
import { NotFoundPage } from './NotFoundPage'

export function ProfilePage() {
  const { id = '' } = useParams()
  const { state } = useAppData()
  const user = userById(state.users, id)

  if (!user) return <NotFoundPage message="This collector does not exist." />

  const records = recordsNewestFirst(recordsForUser(state.records, user.id))

  return (
    <main className="page page-wide">
      <h1>{user.name}</h1>
      <p>{user.city}</p>
      <h2 className="section-title">Records ({records.length})</h2>
      {records.length > 0 ? (
        <RecordGrid records={records} />
      ) : (
        <p className="empty">No records listed yet.</p>
      )}
    </main>
  )
}
