import { Link, useNavigate, useParams } from 'react-router-dom'
import { recordById, useAppData } from '../AppDataProvider'
import { RecordForm } from '../components/RecordForm'
import { NotFoundPage } from './NotFoundPage'

export function EditRecordPage() {
  const { id = '' } = useParams()
  const { state, activeUser, saveRecord, recordLocked } = useAppData()
  const navigate = useNavigate()
  const record = recordById(state.records, id)

  if (!record) return <NotFoundPage message="This record does not exist." />

  const blocked =
    record.ownerId !== activeUser.id
      ? 'Only the owner can edit this record.'
      : recordLocked(record.id)
        ? 'This record is in a pending trade and cannot be edited.'
        : null

  if (blocked) {
    return (
      <main className="page">
        <h1>Edit record</h1>
        <p>{blocked}</p>
        <p className="page-actions">
          <Link to={`/records/${record.id}`}>Back to record</Link>
        </p>
      </main>
    )
  }

  return (
    <main className="page">
      <h1>Edit record</h1>
      <RecordForm
        key={record.id}
        initial={{
          artist: record.artist,
          title: record.title,
          year: record.year?.toString() ?? '',
          condition: record.condition,
          genre: record.genre,
          notes: record.notes ?? '',
        }}
        submitLabel="Save changes"
        onSubmit={(fields) => {
          saveRecord(record.id, fields)
          navigate(`/records/${record.id}`)
        }}
      />
    </main>
  )
}
