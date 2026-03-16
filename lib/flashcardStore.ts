import AsyncStorage from '@react-native-async-storage/async-storage'
import { initialSchedule, applyRating, isDue, type CardSchedule, type Rating } from './sm2'
import { SEED_FLASHCARDS, type Flashcard } from './flashcardData'

const STORE_KEY = 'flashcard_schedules_v1'

type ScheduleMap = Record<string, CardSchedule>

async function loadSchedules(): Promise<ScheduleMap> {
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY)
    return raw ? (JSON.parse(raw) as ScheduleMap) : {}
  } catch {
    return {}
  }
}

async function saveSchedules(map: ScheduleMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(map))
  } catch {
    // storage failure is non-fatal — progress just won't persist this session
  }
}

/** Returns every card that is due right now, merged with its schedule */
export async function getDueCards(): Promise<Array<Flashcard & { schedule: CardSchedule }>> {
  const schedules = await loadSchedules()
  return SEED_FLASHCARDS
    .map(card => ({
      ...card,
      schedule: schedules[card.id] ?? initialSchedule(),
    }))
    .filter(card => isDue(card.schedule))
}

/** Returns due count per domain (for deck list UI) */
export async function getDueCountByDomain(): Promise<Record<string, number>> {
  const schedules = await loadSchedules()
  const counts: Record<string, number> = {}
  for (const card of SEED_FLASHCARDS) {
    const schedule = schedules[card.id] ?? initialSchedule()
    if (isDue(schedule)) {
      counts[card.domain] = (counts[card.domain] ?? 0) + 1
    }
  }
  return counts
}

/** Returns total card count per domain */
export function getTotalCountByDomain(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const card of SEED_FLASHCARDS) {
    counts[card.domain] = (counts[card.domain] ?? 0) + 1
  }
  return counts
}

/** Applies a rating to a card and persists the updated schedule */
export async function rateCard(cardId: string, rating: Rating): Promise<CardSchedule> {
  const schedules = await loadSchedules()
  const current = schedules[cardId] ?? initialSchedule()
  const updated = applyRating(current, rating)
  schedules[cardId] = updated
  await saveSchedules(schedules)
  return updated
}

/** Returns the schedule for a single card */
export async function getSchedule(cardId: string): Promise<CardSchedule> {
  const schedules = await loadSchedules()
  return schedules[cardId] ?? initialSchedule()
}
