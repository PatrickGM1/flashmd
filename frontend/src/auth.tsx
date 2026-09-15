import { createContext, useContext } from 'react'
import { Me } from './types'

export type AuthNav = 'password' | 'admin' | 'home'

/** Who is signed in, and the two things the shell can do about it. */
export const AuthCtx = createContext<{
  me: Me | null
  signOut: () => void
  navigate: (to: AuthNav) => void
}>({ me: null, signOut: () => {}, navigate: () => {} })

export const useAuth = () => useContext(AuthCtx)
