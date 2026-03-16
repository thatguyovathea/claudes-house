export type Rating = 'again' | 'hard' | 'good'

export interface CardSchedule {
  interval: number      // days until next review
  easeFactor: number    // SM-2 ease factor (min 1.3)
  repetitions: number   // consecutive successful reviews
  nextReview: string    // ISO date string
  lastRated: string     // ISO date string
}

const QUALITY: Record<Rating, number> = {
  again: 0,
  hard: 3,
  good: 4,
}

export function initialSchedule(): CardSchedule {
  return {
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: new Date().toISOString(),
    lastRated: '',
  }
}

export function applyRating(schedule: CardSchedule, rating: Rating): CardSchedule {
  const q = QUALITY[rating]
  let { interval, easeFactor, repetitions } = schedule

  if (q < 3) {
    // Failed — reset streak, review again soon
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions++
    // SM-2 ease factor update formula
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = Math.max(1.3, easeFactor)
  }

  const nextReview = new Date()
  if (rating === 'again') {
    // Due again in ~10 minutes for same-session re-review (stored as fractional day = next launch)
    nextReview.setMinutes(nextReview.getMinutes() + 10)
  } else {
    nextReview.setDate(nextReview.getDate() + interval)
  }

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview: nextReview.toISOString(),
    lastRated: new Date().toISOString(),
  }
}

/** Returns the display string shown on the rating button before tapping */
export function previewInterval(schedule: CardSchedule, rating: Rating): string {
  if (rating === 'again') return '<1m'

  const q = QUALITY[rating]
  let { interval, easeFactor, repetitions } = schedule

  let nextInterval: number
  if (q < 3) {
    nextInterval = 1
  } else if (repetitions === 0) {
    nextInterval = 1
  } else if (repetitions === 1) {
    nextInterval = 6
  } else {
    nextInterval = Math.round(interval * easeFactor)
  }

  if (nextInterval <= 1) return '1d'
  if (nextInterval < 30) return `${nextInterval}d`
  const weeks = Math.round(nextInterval / 7)
  if (weeks < 8) return `${weeks}w`
  return `${Math.round(nextInterval / 30)}mo`
}

/** True if a card is due for review right now */
export function isDue(schedule: CardSchedule): boolean {
  return new Date(schedule.nextReview) <= new Date()
}
