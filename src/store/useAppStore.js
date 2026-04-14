import { create } from 'zustand'

const useAppStore = create((set) => ({
  user: null,
  role: null,
  loading: true,

  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),

  login: (user, role) => set({ user, role, loading: false }),
  logout: () => set({ user: null, role: null, loading: false }),
}))

export default useAppStore
