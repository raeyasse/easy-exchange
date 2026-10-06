export interface User {
  id: string
  name: string
  city: string
}

export interface Record {
  id: string
  ownerId: string
  artist: string
  title: string
  year?: number
  condition: 'Mint' | 'Near Mint' | 'Very Good' | 'Good' | 'Poor'
  genre: string
  notes?: string
  createdAt: string
}

export interface Trade {
  id: string
  proposerId: string
  recipientId: string
  offeredRecordIds: string[]
  requestedRecordIds: string[]
  status: 'pending' | 'accepted' | 'declined' | 'cancelled'
  createdAt: string
}

export interface AppState {
  users: User[]
  records: Record[]
  trades: Trade[]
  activeUserId: string
}
