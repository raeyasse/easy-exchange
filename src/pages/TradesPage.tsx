import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { recordById, useAppData, userById } from '../AppDataProvider'
import { incomingTrades, outgoingTrades, TradeError, tradeHistory } from '../data'
import type { Trade } from '../data'

const TABS = [
  { id: 'incoming', label: 'Incoming' },
  { id: 'outgoing', label: 'Outgoing' },
  { id: 'history', label: 'History' },
] as const

type TabId = (typeof TABS)[number]['id']

const EMPTY: Record<TabId, string> = {
  incoming: 'No trade proposals waiting for you.',
  outgoing: "You haven't sent any proposals that are still pending.",
  history: 'No finished trades yet.',
}

const STATUS_LABEL: Record<Trade['status'], string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  cancelled: 'Cancelled',
}

export function TradesPage() {
  const [params, setParams] = useSearchParams()
  const { state, activeUser } = useAppData()
  const tab: TabId = TABS.some((t) => t.id === params.get('tab'))
    ? (params.get('tab') as TabId)
    : 'incoming'

  const lists: Record<TabId, Trade[]> = {
    incoming: incomingTrades(state, activeUser.id),
    outgoing: outgoingTrades(state, activeUser.id),
    history: tradeHistory(state, activeUser.id),
  }
  const trades = lists[tab]

  return (
    <main className="page">
      <h1>Trades</h1>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'tab tab-active' : 'tab'}
            onClick={() => setParams({ tab: t.id })}
          >
            {t.label} ({lists[t.id].length})
          </button>
        ))}
      </div>
      {trades.length === 0 ? (
        <p className="empty">{EMPTY[tab]}</p>
      ) : (
        <ul className="trade-list">
          {trades.map((trade) => (
            <li key={trade.id}>
              <TradeItem trade={trade} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

function TradeItem({ trade }: { trade: Trade }) {
  const { state, activeUser, acceptTrade, declineTrade, cancelTrade } = useAppData()
  const [error, setError] = useState<string | null>(null)
  const isProposer = trade.proposerId === activeUser.id
  const other = userById(state.users, isProposer ? trade.recipientId : trade.proposerId)
  const youGive = isProposer ? trade.offeredRecordIds : trade.requestedRecordIds
  const youGet = isProposer ? trade.requestedRecordIds : trade.offeredRecordIds

  function run(action: (id: string) => void) {
    try {
      action(trade.id)
    } catch (err) {
      if (err instanceof TradeError) setError(err.message)
      else throw err
    }
  }

  return (
    <article className="trade">
      <header className="trade-head">
        <h2>
          {isProposer ? 'To ' : 'From '}
          {other ? <Link to={`/users/${other.id}`}>{other.name}</Link> : 'Unknown collector'}
        </h2>
        <span className={`status status-${trade.status}`}>{STATUS_LABEL[trade.status]}</span>
      </header>
      <div className="trade-sides">
        <RecordList title="You give" ids={youGive} />
        <RecordList title="You get" ids={youGet} />
      </div>
      {error ? <p className="error">{error}</p> : null}
      {trade.status === 'pending' ? (
        <div className="button-row">
          {isProposer ? (
            <button type="button" className="button button-danger" onClick={() => run(cancelTrade)}>
              Cancel
            </button>
          ) : (
            <>
              <button type="button" className="button" onClick={() => run(acceptTrade)}>
                Accept
              </button>
              <button
                type="button"
                className="button button-danger"
                onClick={() => run(declineTrade)}
              >
                Decline
              </button>
            </>
          )}
        </div>
      ) : null}
    </article>
  )
}

function RecordList({ title, ids }: { title: string; ids: string[] }) {
  const { state } = useAppData()
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {ids.map((id) => {
          const record = recordById(state.records, id)
          return (
            <li key={id}>
              {record ? (
                <Link to={`/records/${id}`}>
                  {record.title}, {record.artist}
                </Link>
              ) : (
                'Removed record'
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
