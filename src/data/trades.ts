import { isInPendingTrade } from './records'
import type { AppState, Trade } from './types'

export class TradeError extends Error {}

export type TradeProposal = {
  proposerId: string
  recipientId: string
  offeredRecordIds: string[]
  requestedRecordIds: string[]
}

export function canSendProposal(
  offeredRecordIds: string[],
  requestedRecordIds: string[],
): boolean {
  return offeredRecordIds.length > 0 && requestedRecordIds.length > 0
}

function ownsAll(state: AppState, userId: string, recordIds: string[]): boolean {
  return recordIds.every((id) =>
    state.records.some((record) => record.id === id && record.ownerId === userId),
  )
}

export function proposeTrade(state: AppState, proposal: TradeProposal): AppState {
  const { proposerId, recipientId, offeredRecordIds, requestedRecordIds } = proposal

  if (proposerId === recipientId) {
    throw new TradeError("You can't propose a trade on your own record.")
  }
  if (!canSendProposal(offeredRecordIds, requestedRecordIds)) {
    throw new TradeError('Pick at least one record on each side.')
  }
  if (!ownsAll(state, proposerId, offeredRecordIds)) {
    throw new TradeError('You can only offer your own records.')
  }
  if (!ownsAll(state, recipientId, requestedRecordIds)) {
    throw new TradeError('Requested records must belong to the other collector.')
  }
  if ([...offeredRecordIds, ...requestedRecordIds].some((id) => isInPendingTrade(state, id))) {
    throw new TradeError('A record in a pending trade cannot be added to another trade.')
  }

  const trade: Trade = {
    id: `t-${crypto.randomUUID()}`,
    proposerId,
    recipientId,
    offeredRecordIds: [...offeredRecordIds],
    requestedRecordIds: [...requestedRecordIds],
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  return { ...state, trades: [...state.trades, trade] }
}

function pendingTrade(state: AppState, tradeId: string): Trade {
  const trade = state.trades.find((t) => t.id === tradeId)
  if (!trade) throw new TradeError('Trade not found.')
  if (trade.status !== 'pending') throw new TradeError('This trade is no longer pending.')
  return trade
}

function withStatus(state: AppState, tradeId: string, status: Trade['status']): AppState {
  return {
    ...state,
    trades: state.trades.map((t) => (t.id === tradeId ? { ...t, status } : t)),
  }
}

export function acceptTrade(state: AppState, tradeId: string, actorId: string): AppState {
  const trade = pendingTrade(state, tradeId)
  if (actorId !== trade.recipientId) {
    throw new TradeError('Only the recipient can accept this trade.')
  }
  if (
    !ownsAll(state, trade.proposerId, trade.offeredRecordIds) ||
    !ownsAll(state, trade.recipientId, trade.requestedRecordIds)
  ) {
    throw new TradeError('Some of these records have changed owners since the trade was proposed.')
  }

  const offered = new Set(trade.offeredRecordIds)
  const requested = new Set(trade.requestedRecordIds)
  const next = withStatus(state, tradeId, 'accepted')
  return {
    ...next,
    records: next.records.map((record) => {
      if (offered.has(record.id)) return { ...record, ownerId: trade.recipientId }
      if (requested.has(record.id)) return { ...record, ownerId: trade.proposerId }
      return record
    }),
  }
}

export function declineTrade(state: AppState, tradeId: string, actorId: string): AppState {
  const trade = pendingTrade(state, tradeId)
  if (actorId !== trade.recipientId) {
    throw new TradeError('Only the recipient can decline this trade.')
  }
  return withStatus(state, tradeId, 'declined')
}

export function cancelTrade(state: AppState, tradeId: string, actorId: string): AppState {
  const trade = pendingTrade(state, tradeId)
  if (actorId !== trade.proposerId) {
    throw new TradeError('Only the proposer can cancel this trade.')
  }
  return withStatus(state, tradeId, 'cancelled')
}

function newestFirst(trades: Trade[]): Trade[] {
  return [...trades].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function incomingTrades(state: AppState, userId: string): Trade[] {
  return newestFirst(
    state.trades.filter((t) => t.status === 'pending' && t.recipientId === userId),
  )
}

export function outgoingTrades(state: AppState, userId: string): Trade[] {
  return newestFirst(
    state.trades.filter((t) => t.status === 'pending' && t.proposerId === userId),
  )
}

export function tradeHistory(state: AppState, userId: string): Trade[] {
  return newestFirst(
    state.trades.filter(
      (t) => t.status !== 'pending' && (t.proposerId === userId || t.recipientId === userId),
    ),
  )
}
