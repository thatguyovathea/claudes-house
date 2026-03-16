import type { ExamTrack, CMMCLevel, CMMCDomain, StudyMode, Question } from '@/types'
import { getQuestionsByFilter } from '@/lib/questions'
import { getWeakestDomain, getMissedQuestionIds } from '@/lib/db'

export interface SessionConfig {
  mode: StudyMode
  track: ExamTrack
  level: CMMCLevel
  domain?: CMMCDomain | 'mixed'
}

export interface SessionQuestion extends Question {
  sessionIndex: number
}

const MODE_LENGTHS: Record<StudyMode, number> = {
  quick10: 10,
  weakDomain: 15,
  domainDrill: 20,
  mockExam: 50,
  missedReview: 20,
  practiceReview: 10,
}

/** Synchronous build — used for modes that don't need DB lookups */
export function buildSession(config: SessionConfig): SessionQuestion[] {
  const { mode, track, level, domain } = config

  const questions = getQuestionsByFilter({
    tracks: [track],
    level,
    domain: domain ?? 'mixed',
    limit: MODE_LENGTHS[mode],
  })

  return questions.map((q, i) => ({ ...q, sessionIndex: i }))
}

/** Async build — resolves DB-dependent modes (weakDomain, missedReview) */
export async function buildSessionAsync(config: SessionConfig): Promise<SessionQuestion[]> {
  const { mode, track, level } = config

  if (mode === 'weakDomain') {
    const weakest = await getWeakestDomain(track)
    const domain = weakest ?? 'mixed'
    const questions = getQuestionsByFilter({
      tracks: [track],
      level,
      domain,
      limit: MODE_LENGTHS.weakDomain,
    })
    return questions.map((q, i) => ({ ...q, sessionIndex: i }))
  }

  if (mode === 'missedReview') {
    const missedIds = await getMissedQuestionIds(track)
    if (missedIds.length === 0) return []
    const questions = getQuestionsByFilter({
      tracks: [track],
      includeIds: missedIds,
      limit: MODE_LENGTHS.missedReview,
    })
    return questions.map((q, i) => ({ ...q, sessionIndex: i }))
  }

  return buildSession(config)
}

export interface SessionAnswer {
  questionId: string
  selectedLetter: 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean
  domain: CMMCDomain
  practiceId: string
  timeSpentSeconds: number
}

export interface SessionResult {
  config: SessionConfig
  answers: SessionAnswer[]
  totalQuestions: number
  correctCount: number
  scorePercent: number
  timeTakenSeconds: number
  missedQuestionIds: string[]
  domainScores: Record<string, { answered: number; correct: number; scorePercent: number; metTarget: boolean }>
  practiceScores: Record<string, { answered: number; correct: number; mastered: boolean }>
}

export function computeResult(
  config: SessionConfig,
  answers: SessionAnswer[],
  totalTimeSeconds: number,
): SessionResult {
  const correctCount = answers.filter(a => a.isCorrect).length
  const scorePercent = answers.length === 0 ? 0 : Math.round((correctCount / answers.length) * 100)
  const missedQuestionIds = answers.filter(a => !a.isCorrect).map(a => a.questionId)

  // Per-domain scores
  const domainMap: Record<string, { answered: number; correct: number }> = {}
  for (const a of answers) {
    if (!domainMap[a.domain]) domainMap[a.domain] = { answered: 0, correct: 0 }
    domainMap[a.domain].answered++
    if (a.isCorrect) domainMap[a.domain].correct++
  }
  const domainScores = Object.fromEntries(
    Object.entries(domainMap).map(([d, s]) => {
      const pct = Math.round((s.correct / s.answered) * 100)
      return [d, { ...s, scorePercent: pct, metTarget: pct >= 70 }]
    })
  )

  // Per-practice scores
  const practiceMap: Record<string, { answered: number; correct: number }> = {}
  for (const a of answers) {
    if (!practiceMap[a.practiceId]) practiceMap[a.practiceId] = { answered: 0, correct: 0 }
    practiceMap[a.practiceId].answered++
    if (a.isCorrect) practiceMap[a.practiceId].correct++
  }
  const practiceScores = Object.fromEntries(
    Object.entries(practiceMap).map(([p, s]) => [p, { ...s, mastered: s.correct >= 2 }])
  )

  return {
    config,
    answers,
    totalQuestions: answers.length,
    correctCount,
    scorePercent,
    timeTakenSeconds: totalTimeSeconds,
    missedQuestionIds,
    domainScores,
    practiceScores,
  }
}
