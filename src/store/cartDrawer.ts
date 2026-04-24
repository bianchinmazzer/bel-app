'use client'

import { create } from 'zustand'

interface CartDrawerStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useCartDrawer = create<CartDrawerStore>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
