export type UserRole = 'admin' | 'host'
export type HostStatus = 'pending' | 'approved' | 'suspended'

export interface User {
  id: string
  email: string
  role: UserRole
  displayName: string
}

export interface HostAccount extends User {
  role: 'host'
  status: HostStatus
  eventCount: number
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  displayName: string
}
