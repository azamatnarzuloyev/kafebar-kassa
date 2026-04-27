import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Staff, Branch } from '@/types/api'

interface SessionStore {
  token: string | null
  user: Staff | null
  branch: Branch | null

  // Settings
  soundEnabled: boolean
  vibrationEnabled: boolean
  notificationsEnabled: boolean

  setAuth: (token: string, user: Staff) => void
  setBranch: (branch: Branch | null) => void
  setSoundEnabled: (v: boolean) => void
  setVibrationEnabled: (v: boolean) => void
  setNotificationsEnabled: (v: boolean) => void
  clear: () => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      branch: null,

      soundEnabled: true,
      vibrationEnabled: true,
      notificationsEnabled: true,

      setAuth: (token, user) => set({ token, user }),
      setBranch: (branch) => set({ branch }),
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setVibrationEnabled: (v) => set({ vibrationEnabled: v }),
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      clear: () => set({ token: null, user: null, branch: null }),
    }),
    { name: 'kafebar-kassa-session' }
  )
)
