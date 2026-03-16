import { createContext, useContext, type ReactNode } from 'react'
import type { StudyMode } from '@/types'

export const FREE_QUESTION_LIMIT = 30

/** Modes available on the free tier */
export const FREE_MODES: StudyMode[] = ['quick10', 'domainDrill', 'mockExam']

interface PremiumContextValue {
  isPremium: boolean
  isModeAllowed: (mode: StudyMode) => boolean
}

const PremiumContext = createContext<PremiumContextValue>({
  isPremium: false,
  isModeAllowed: (mode) => FREE_MODES.includes(mode),
})

export function PremiumProvider({ children }: { children: ReactNode }) {
  // TODO: replace with real entitlement check (RevenueCat / StoreKit) when payment is integrated
  const isPremium = false

  function isModeAllowed(mode: StudyMode): boolean {
    return isPremium || FREE_MODES.includes(mode)
  }

  return (
    <PremiumContext.Provider value={{ isPremium, isModeAllowed }}>
      {children}
    </PremiumContext.Provider>
  )
}

export function usePremium() {
  return useContext(PremiumContext)
}
