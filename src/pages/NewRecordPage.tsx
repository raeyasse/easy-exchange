import { useNavigate } from 'react-router-dom'
import { useAppData } from '../AppDataProvider'
import { EMPTY_FIELDS, RecordForm } from '../components/RecordForm'

export function NewRecordPage() {
  const { createRecord } = useAppData()
  const navigate = useNavigate()

  return (
    <main className="page">
      <h1>List a record</h1>
      <RecordForm
        initial={EMPTY_FIELDS}
        submitLabel="List record"
        onSubmit={(fields) => navigate(`/records/${createRecord(fields)}`)}
      />
    </main>
  )
}
