import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ExamTrack } from '@/types'
import { getActiveTrack, setActiveTrack as storeSetActiveTrack, getExamDate, setExamDate as storeSetExamDate } from '@/lib/storage'

interface TrackContextValue {
  activeTrack: ExamTrack
  setActiveTrack: (t: ExamTrack) => void
  examDate: string | null
  setExamDate: (d: string | null) => void
}

const TrackContext = createContext<TrackContextValue>({
  activeTrack: 'CCP',
  setActiveTrack: () => {},
  examDate: null,
  setExamDate: () => {},
})

export function TrackProvider({ children }: { children: ReactNode }) {
  const [activeTrack, setActiveTrackState] = useState<ExamTrack>('CCP')
  const [examDate, setExamDateState] = useState<string | null>(null)

  useEffect(() => {
    getActiveTrack().then(setActiveTrackState)
    getExamDate().then(setExamDateState)
  }, [])

  function setActiveTrack(track: ExamTrack) {
    setActiveTrackState(track)
    storeSetActiveTrack(track)
  }

  function setExamDate(date: string | null) {
    setExamDateState(date)
    storeSetExamDate(date)
  }

  return (
    <TrackContext.Provider value={{ activeTrack, setActiveTrack, examDate, setExamDate }}>
      {children}
    </TrackContext.Provider>
  )
}

export function useTrack() {
  return useContext(TrackContext)
}
