import { track } from './track'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './api'

// Optional account. `user` is null for guests; nothing on the site requires one.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, ready: false })
  const refresh = useCallback(() => api.me().then((r) => setState({ user: r.user, ready: true })).catch(() => setState({ user: null, ready: true })), [])
  useEffect(() => { refresh() }, [refresh])
  const login = async (body) => { const r = await api.login(body); setState({ user: r.user, ready: true }); return r }
  const register = async (body) => { const r = await api.register(body); track('register'); setState({ user: r.user, ready: true }); return r }
  const logout = async () => { await api.logout().catch(() => {}); await refresh() }
  const forget = () => setState({ user: null, ready: true })
  return <AuthContext.Provider value={{ ...state, login, register, logout, refresh, forget }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
