import { Link, useNavigate, useParams } from 'react-router-dom'
import { recordById, useAppData, userById } from '../AppDataProvider'
import { RecordCover } from '../components/RecordCover'
import { NotFoundPage } from './NotFoundPage'

export function RecordDetailPage() {
  const { id = '' } = useParams()
  const { state, activeUser, removeRecord, recordLocked } = useAppData()
  const navigate = useNavigate()
  const record = recordById(state.records, id)

  if (!record) return <NotFoundPage message="This record does not exist." />

  const owner = userById(state.users, record.ownerId)
  const mine = record.ownerId === activeUser.id
  const locked = recordLocked(record.id)

  return (
    <main className="page">
      <div className="detail">
        <RecordCover artist={record.artist} />
        <div>
          <h1>{record.title}</h1>
          <p className="detail-artist">{record.artist}</p>
          {mine ? <p className="badge">Yours</p> : null}
        </div>
      </div>

      <dl className="facts">
        <dt>Year</dt>
        <dd>{record.year ?? 'Unknown'}</dd>
        <dt>Condition</dt>
        <dd>{record.condition}</dd>
        <dt>Genre</dt>
        <dd>{record.genre}</dd>
        <dt>Owner</dt>
        <dd>{owner ? <Link to={`/users/${owner.id}`}>{owner.name}</Link> : 'Unknown'}</dd>
        {record.notes ? (
          <>
            <dt>Notes</dt>
            <dd>{record.notes}</dd>
          </>
        ) : null}
      </dl>

      {mine ? (
        <div className="page-actions">
          {locked ? (
            <p className="notice">
              This record is in a pending trade, so it can't be edited or deleted.
            </p>
          ) : null}
          <div className="button-row">
            <button
              type="button"
              className="button"
              disabled={locked}
              onClick={() => navigate(`/records/${record.id}/edit`)}
            >
              Edit
            </button>
            <button
              type="button"
              className="button button-danger"
              disabled={locked}
              onClick={() => {
                removeRecord(record.id)
                navigate('/')
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="page-actions">
          <button
            type="button"
            className="button"
            onClick={() => navigate(`/trades/new?record=${record.id}`)}
          >
            Propose trade
          </button>
        </div>
      )}
    </main>
  )
}
