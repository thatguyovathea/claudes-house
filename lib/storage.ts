import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ExamTrack } from '@/types'

const KEYS = {
  ONBOARDING_COMPLETE: 'onboarding_complete',
  ACTIVE_TRACK: 'active_track',
  EXAM_DATE: 'exam_date',
} as const

export async function isOnboardingComplete(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE)
  return val === 'true'
}

export async function completeOnboarding(track: ExamTrack, examDate: string | null): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true')
  await AsyncStorage.setItem(KEYS.ACTIVE_TRACK, track)
  if (examDate) await AsyncStorage.setItem(KEYS.EXAM_DATE, examDate)
}

export async function getActiveTrack(): Promise<ExamTrack> {
  const val = await AsyncStorage.getItem(KEYS.ACTIVE_TRACK)
  return (val as ExamTrack) ?? 'CCP'
}

export async function setActiveTrack(track: ExamTrack): Promise<void> {
  await AsyncStorage.setItem(KEYS.ACTIVE_TRACK, track)
}

export async function getExamDate(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.EXAM_DATE)
}

export async function setExamDate(date: string | null): Promise<void> {
  if (date) {
    await AsyncStorage.setItem(KEYS.EXAM_DATE, date)
  } else {
    await AsyncStorage.removeItem(KEYS.EXAM_DATE)
  }
}

export async function clearAll(): Promise<void> {
  await Promise.all(Object.values(KEYS).map(k => AsyncStorage.removeItem(k)))
}
