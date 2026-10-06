import { describe, expect, it } from 'vitest'
import { createSeedState } from '../src/data/seed'
import {
  acceptTrade,
  canSendProposal,
  cancelTrade,
  declineTrade,
  incomingTrades,
  outgoingTrades,
  proposeTrade,
  TradeError,
  tradeHistory,
} from '../src/data/trades'
import type { AppState } from '../src/data/types'

// Seed: u1 Maya owns r1–r5, u3 Sam owns r11–r15, u4 Lena owns r16–r20.
function withProposal(): { state: AppState; tradeId: string } {
  const before = createSeedState()
  const state = proposeTrade(before, {
    proposerId: 'u3',
    recipientId: 'u4',
    offeredRecordIds: ['r11', 'r12'],
    requestedRecordIds: ['r16'],
  })
  const tradeId = state.trades[state.trades.length - 1].id
  return { state, tradeId }
}

function owner(state: AppState, recordId: string): string | undefined {
  return state.records.find((r) => r.id === recordId)?.ownerId
}

describe('AC-4.1 sending a proposal', () => {
  it("shows in the proposer's Outgoing and the recipient's Incoming", () => {
    const { state, tradeId } = withProposal()
    const trade = state.trades.find((t) => t.id === tradeId)!

    expect(trade.status).toBe('pending')
    expect(outgoingTrades(state, 'u3').map((t) => t.id)).toContain(tradeId)
    expect(incomingTrades(state, 'u4').map((t) => t.id)).toContain(tradeId)
  })

  it("does not show in the proposer's Incoming, the recipient's Outgoing, or anyone else's lists", () => {
    const { state, tradeId } = withProposal()

    expect(incomingTrades(state, 'u3').map((t) => t.id)).not.toContain(tradeId)
    expect(outgoingTrades(state, 'u4').map((t) => t.id)).not.toContain(tradeId)
    for (const list of [incomingTrades, outgoingTrades, tradeHistory]) {
      expect(list(state, 'u1').map((t) => t.id)).not.toContain(tradeId)
    }
  })

  it('does not change record owners', () => {
    const { state } = withProposal()
    expect(owner(state, 'r11')).toBe('u3')
    expect(owner(state, 'r16')).toBe('u4')
  })
})

describe('AC-4.2 Send needs at least one record on each side', () => {
  it('is only allowed when both sides have a pick', () => {
    expect(canSendProposal([], [])).toBe(false)
    expect(canSendProposal(['r11'], [])).toBe(false)
    expect(canSendProposal([], ['r16'])).toBe(false)
    expect(canSendProposal(['r11'], ['r16'])).toBe(true)
  })

  it('rejects a proposal with an empty side', () => {
    const state = createSeedState()
    const base = { proposerId: 'u3', recipientId: 'u4' }
    expect(() =>
      proposeTrade(state, { ...base, offeredRecordIds: [], requestedRecordIds: ['r16'] }),
    ).toThrow(TradeError)
    expect(() =>
      proposeTrade(state, { ...base, offeredRecordIds: ['r11'], requestedRecordIds: [] }),
    ).toThrow(TradeError)
  })
})

describe("AC-4.3 can't propose a trade on your own record", () => {
  it('rejects proposing to yourself', () => {
    expect(() =>
      proposeTrade(createSeedState(), {
        proposerId: 'u3',
        recipientId: 'u3',
        offeredRecordIds: ['r11'],
        requestedRecordIds: ['r12'],
      }),
    ).toThrow(TradeError)
  })

  it('rejects requesting a record you own, or offering one you do not', () => {
    const state = createSeedState()
    expect(() =>
      proposeTrade(state, {
        proposerId: 'u3',
        recipientId: 'u4',
        offeredRecordIds: ['r11'],
        requestedRecordIds: ['r12'],
      }),
    ).toThrow(TradeError)
    expect(() =>
      proposeTrade(state, {
        proposerId: 'u3',
        recipientId: 'u4',
        offeredRecordIds: ['r1'],
        requestedRecordIds: ['r16'],
      }),
    ).toThrow(TradeError)
  })
})

describe('AC-4.4 accepting swaps owners', () => {
  it('gives offered records to the recipient and requested records to the proposer', () => {
    const { state, tradeId } = withProposal()
    const after = acceptTrade(state, tradeId, 'u4')

    expect(owner(after, 'r11')).toBe('u4')
    expect(owner(after, 'r12')).toBe('u4')
    expect(owner(after, 'r16')).toBe('u3')
    expect(owner(after, 'r13')).toBe('u3')
    expect(owner(after, 'r17')).toBe('u4')
  })

  it('moves the trade to History for both users', () => {
    const { state, tradeId } = withProposal()
    const after = acceptTrade(state, tradeId, 'u4')

    expect(after.trades.find((t) => t.id === tradeId)?.status).toBe('accepted')
    for (const userId of ['u3', 'u4']) {
      expect(tradeHistory(after, userId).map((t) => t.id)).toContain(tradeId)
      expect(incomingTrades(after, userId).map((t) => t.id)).not.toContain(tradeId)
      expect(outgoingTrades(after, userId).map((t) => t.id)).not.toContain(tradeId)
    }
  })

  it('works on the seed trade from Jordan to Maya', () => {
    const after = acceptTrade(createSeedState(), 't1', 'u1')
    expect(owner(after, 'r6')).toBe('u1')
    expect(owner(after, 'r1')).toBe('u2')
  })

  it('refuses if a record changed owner after the proposal', () => {
    const { state, tradeId } = withProposal()
    const moved = {
      ...state,
      records: state.records.map((r) => (r.id === 'r16' ? { ...r, ownerId: 'u1' } : r)),
    }
    expect(() => acceptTrade(moved, tradeId, 'u4')).toThrow(TradeError)
  })
})

describe('AC-4.5 declining or cancelling', () => {
  it.each([
    ['declined', (s: AppState, id: string) => declineTrade(s, id, 'u4')],
    ['cancelled', (s: AppState, id: string) => cancelTrade(s, id, 'u3')],
  ] as const)('%s moves the trade to History with no ownership change', (status, act) => {
    const { state, tradeId } = withProposal()
    const after = act(state, tradeId)

    expect(after.trades.find((t) => t.id === tradeId)?.status).toBe(status)
    expect(after.records).toEqual(state.records)
    for (const userId of ['u3', 'u4']) {
      expect(tradeHistory(after, userId).map((t) => t.id)).toContain(tradeId)
      expect(incomingTrades(after, userId)).toHaveLength(0)
      expect(outgoingTrades(after, userId)).toHaveLength(0)
    }
  })
})

describe('AC-4.7 records in a pending trade cannot join another proposal', () => {
  // Seed trade t1 (pending) holds r6 (Jordan, u2) and r1 (Maya, u1).
  it('rejects requesting a record that is in a pending trade', () => {
    expect(() =>
      proposeTrade(createSeedState(), {
        proposerId: 'u3',
        recipientId: 'u1',
        offeredRecordIds: ['r11'],
        requestedRecordIds: ['r1'],
      }),
    ).toThrow(TradeError)
  })

  it('rejects offering a record that is in a pending trade', () => {
    expect(() =>
      proposeTrade(createSeedState(), {
        proposerId: 'u2',
        recipientId: 'u3',
        offeredRecordIds: ['r6'],
        requestedRecordIds: ['r11'],
      }),
    ).toThrow(TradeError)
  })

  it('allows the record again once that trade is no longer pending', () => {
    const declined = declineTrade(createSeedState(), 't1', 'u1')
    const after = proposeTrade(declined, {
      proposerId: 'u3',
      recipientId: 'u1',
      offeredRecordIds: ['r11'],
      requestedRecordIds: ['r1'],
    })
    expect(outgoingTrades(after, 'u3')).toHaveLength(1)
  })
})

describe('AC-4.6 who can act', () => {
  it('only the recipient can accept or decline', () => {
    const { state, tradeId } = withProposal()
    for (const actor of ['u3', 'u1']) {
      expect(() => acceptTrade(state, tradeId, actor)).toThrow(TradeError)
      expect(() => declineTrade(state, tradeId, actor)).toThrow(TradeError)
    }
  })

  it('only the proposer can cancel', () => {
    const { state, tradeId } = withProposal()
    for (const actor of ['u4', 'u1']) {
      expect(() => cancelTrade(state, tradeId, actor)).toThrow(TradeError)
    }
  })

  it('nobody can act on a trade that is no longer pending', () => {
    const { state, tradeId } = withProposal()
    const declined = declineTrade(state, tradeId, 'u4')
    expect(() => acceptTrade(declined, tradeId, 'u4')).toThrow(TradeError)
    expect(() => declineTrade(declined, tradeId, 'u4')).toThrow(TradeError)
    expect(() => cancelTrade(declined, tradeId, 'u3')).toThrow(TradeError)
  })
})
