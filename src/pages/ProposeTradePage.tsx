import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { recordById, useAppData, userById } from '../AppDataProvider'
import { RecordCover } from '../components/RecordCover'
import { canSendProposal, recordsForUser, recordsNewestFirst } from '../data'
import type { Record as VinylRecord } from '../data/types'
import { NotFoundPage } from './NotFoundPage'

export function ProposeTradePage() {
  const [params] = useSearchParams()
  const { state, activeUser, sendTrade, recordLocked } = useAppData()
  const navigate = useNavigate()
  const startRecord = recordById(state.records, params.get('record') ?? '')
  const [requested, setRequested] = useState<string[]>(
    startRecord && !recordLocked(startRecord.id) ? [startRecord.id] : [],
  )
  const [offered, setOffered] = useState<string[]>([])

  if (!startRecord) {
    return <NotFoundPage message="Pick a record from another collector to propose a trade." />
  }

  if (startRecord.ownerId === activeUser.id) {
    return (
      <main className="page">
        <h1>Propose trade</h1>
        <p>You can't propose a trade on your own record.</p>
        <p className="page-actions">
          <Link to={`/records/${startRecord.id}`}>Back to record</Link>
        </p>
      </main>
    )
  }

  const recipient = userById(state.users, startRecord.ownerId)
  const theirs = recordsNewestFirst(recordsForUser(state.records, startRecord.ownerId))
  const mine = recordsNewestFirst(recordsForUser(state.records, activeUser.id))
  // Drop picks that no longer belong to each side (e.g. after switching users)
  // or that are now in a pending trade.
  const pickable = (records: VinylRecord[], id: string) =>
    records.some((r) => r.id === id) && !recordLocked(id)
  const pickedOffered = offered.filter((id) => pickable(mine, id))
  const pickedRequested = requested.filter((id) => pickable(theirs, id))
  const ready = canSendProposal(pickedOffered, pickedRequested)

  function send() {
    sendTrade({
      recipientId: startRecord!.ownerId,
      offeredRecordIds: pickedOffered,
      requestedRecordIds: pickedRequested,
    })
    navigate('/trades?tab=outgoing')
  }

  return (
    <main className="page">
      <h1>Propose trade with {recipient?.name ?? 'collector'}</h1>
      <RecordPicker
        legend={`Records you want from ${recipient?.name ?? 'them'}`}
        records={theirs}
        selected={pickedRequested}
        onChange={setRequested}
        isLocked={recordLocked}
      />
      <RecordPicker
        legend="Records you offer"
        records={mine}
        selected={pickedOffered}
        onChange={setOffered}
        isLocked={recordLocked}
        emptyText="You have no records to offer yet."
      />
      <div className="page-actions">
        {!ready ? <p className="notice">Pick at least one record on each side.</p> : null}
        <button type="button" className="button" disabled={!ready} onClick={send}>
          Send proposal
        </button>
      </div>
    </main>
  )
}

function RecordPicker({
  legend,
  records,
  selected,
  onChange,
  isLocked,
  emptyText = 'No records.',
}: {
  legend: string
  records: VinylRecord[]
  selected: string[]
  onChange: (ids: string[]) => void
  isLocked: (id: string) => boolean
  emptyText?: string
}) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  return (
    <fieldset className="picker">
      <legend>
        {legend} ({selected.length} picked)
      </legend>
      {records.length === 0 ? <p>{emptyText}</p> : null}
      {records.map((record) => {
        const locked = isLocked(record.id)
        return (
          <label key={record.id} className={locked ? 'picker-row picker-row-locked' : 'picker-row'}>
            <input
              type="checkbox"
              checked={selected.includes(record.id)}
              disabled={locked}
              onChange={() => toggle(record.id)}
            />
            <RecordCover artist={record.artist} />
            <span>
              <strong>{record.title}</strong>
              <br />
              {record.artist}
              {locked ? (
                <>
                  <br />
                  <em>In a pending trade</em>
                </>
              ) : null}
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
