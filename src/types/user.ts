export type UserRole = 'admin' | 'host'
/** Matches API `host_status`. */
export type HostStatus = 'pending' | 'active' | 'disabled'

export interface User {
  id: string
  email: string
  role: UserRole
  displayName: string
  /** Present when `role === "host"`. */
  hostStatus?: HostStatus
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
