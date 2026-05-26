import { useCallback, useEffect, useState } from 'react'
import type { User, LoginInput, RegisterInput } from '@/types/user'
import * as api from '@/lib/api'

const TOKEN_KEY = 'tabitayo_token'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const current = await api.getCurrentUser()
      setUser(current)
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = async (input: LoginInput) => {
    const { token, user: loggedIn } = await api.login(input)
    localStorage.setItem(TOKEN_KEY, token)
    setUser(loggedIn)
    return loggedIn
  }

  const register = async (input: RegisterInput) => {
    const { token, user: registered } = await api.register(input)
    localStorage.setItem(TOKEN_KEY, token)
    setUser(registered)
    return registered
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return { user, loading, login, register, logout, refresh }
}
