import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  acceptTrade,
  addRecord,
  cancelTrade,
  declineTrade,
  deleteRecord,
  isInPendingTrade,
  lastAddedRecordId,
  loadState,
  proposeTrade,
  saveState,
  setActiveUser,
  updateRecord,
} from './data'
import type { AppState, RecordFields, TradeProposal, User } from './data'
import type { Record as VinylRecord } from './data/types'

type AppDataValue = {
  state: AppState
  activeUser: User
  switchUser: (userId: string) => void
  createRecord: (fields: RecordFields) => string
  saveRecord: (recordId: string, fields: RecordFields) => void
  removeRecord: (recordId: string) => void
  recordLocked: (recordId: string) => boolean
  sendTrade: (proposal: Omit<TradeProposal, 'proposerId'>) => void
  acceptTrade: (tradeId: string) => void
  declineTrade: (tradeId: string) => void
  cancelTrade: (tradeId: string) => void
}

const AppDataContext = createContext<AppDataValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())

  const value = useMemo<AppDataValue>(() => {
    const activeUser =
      state.users.find((user) => user.id === state.activeUserId) ?? state.users[0]

    function commit(next: AppState) {
      saveState(next)
      setState(next)
    }

    return {
      state,
      activeUser,
      switchUser(userId: string) {
        commit(setActiveUser(state, userId))
      },
      createRecord(fields: RecordFields) {
        const next = addRecord(state, fields)
        commit(next)
        return lastAddedRecordId(state, next)
      },
      saveRecord(recordId: string, fields: RecordFields) {
        commit(updateRecord(state, recordId, fields))
      },
      removeRecord(recordId: string) {
        commit(deleteRecord(state, recordId))
      },
      recordLocked(recordId: string) {
        return isInPendingTrade(state, recordId)
      },
      sendTrade(proposal) {
        commit(proposeTrade(state, { ...proposal, proposerId: activeUser.id }))
      },
      acceptTrade(tradeId: string) {
        commit(acceptTrade(state, tradeId, activeUser.id))
      },
      declineTrade(tradeId: string) {
        commit(declineTrade(state, tradeId, activeUser.id))
      },
      cancelTrade(tradeId: string) {
        commit(cancelTrade(state, tradeId, activeUser.id))
      },
    }
  }, [state])

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  )
}

export function useAppData(): AppDataValue {
  const value = useContext(AppDataContext)
  if (!value) throw new Error('useAppData must be used within AppDataProvider')
  return value
}

export function userById(users: User[], id: string): User | undefined {
  return users.find((user) => user.id === id)
}

export function recordById(
  records: VinylRecord[],
  id: string,
): VinylRecord | undefined {
  return records.find((record) => record.id === id)
}
