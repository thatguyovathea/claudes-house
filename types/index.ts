export type ExamTrack = 'RP' | 'CCP' | 'CCA'
export type CMMCLevel = 'L1' | 'L2' | 'L3'
export type CMMCDomain = 'AC' | 'AT' | 'AU' | 'CM' | 'IA' | 'IR' | 'MA' | 'MP' | 'PS' | 'PE' | 'RA' | 'CA' | 'SC' | 'SI'
export type PracticeId = string
export type StudyMode = 'quick10' | 'weakDomain' | 'domainDrill' | 'mockExam' | 'missedReview' | 'practiceReview'

export const DOMAIN_NAMES: Record<CMMCDomain, string> = {
  AC: 'Access Control',
  AT: 'Awareness & Training',
  AU: 'Audit & Accountability',
  CM: 'Configuration Management',
  IA: 'Identification & Authentication',
  IR: 'Incident Response',
  MA: 'Maintenance',
  MP: 'Media Protection',
  PS: 'Personnel Security',
  PE: 'Physical Protection',
  RA: 'Risk Assessment',
  CA: 'Security Assessment',
  SC: 'System & Comms Protection',
  SI: 'System & Info Integrity',
}

export const ALL_DOMAINS: CMMCDomain[] = ['AC', 'AT', 'AU', 'CM', 'IA', 'IR', 'MA', 'MP', 'PS', 'PE', 'RA', 'CA', 'SC', 'SI']

export const PASSING_THRESHOLDS: Record<ExamTrack, number> = {
  RP: 0.70,
  CCP: 0.70,
  CCA: 0.75,
}

export const TRACK_COLORS: Record<ExamTrack, string> = {
  RP: '#8B7FE8',
  CCP: '#4ECDC4',
  CCA: '#F4C842',
}

export const TRACK_LABELS: Record<ExamTrack, string> = {
  RP: 'Registered Practitioner',
  CCP: 'Certified CMMC Professional',
  CCA: 'Certified CMMC Assessor',
}

export const LEVEL_LABELS: Record<CMMCLevel, string> = {
  L1: 'Level 1 — Foundational',
  L2: 'Level 2 — Advanced',
  L3: 'Level 3 — Expert',
}

// Which levels each track covers
export const TRACK_LEVELS: Record<ExamTrack, CMMCLevel[]> = {
  RP: ['L1', 'L2'],
  CCP: ['L1', 'L2', 'L3'],
  CCA: ['L1', 'L2', 'L3'],
}

// Domain weights per track (higher = more exam weight)
export const DOMAIN_WEIGHTS: Record<ExamTrack, Record<CMMCDomain, number>> = {
  RP:  { AC: 1, AT: 2, AU: 1, CM: 1, IA: 1, IR: 1, MA: 1, MP: 1, PS: 1, PE: 1, RA: 1, CA: 1, SC: 1, SI: 1 },
  CCP: { AC: 2, AT: 1, AU: 2, CM: 2, IA: 2, IR: 2, MA: 1, MP: 2, PS: 1, PE: 1, RA: 2, CA: 2, SC: 2, SI: 2 },
  CCA: { AC: 2, AT: 1, AU: 2, CM: 2, IA: 2, IR: 2, MA: 1, MP: 2, PS: 1, PE: 1, RA: 2, CA: 3, SC: 2, SI: 2 },
}

export interface Question {
  id: string
  tracks: ExamTrack[]
  level: CMMCLevel
  practiceId: PracticeId
  domain: CMMCDomain
  difficulty: 1 | 2 | 3
  stem: string
  options: { letter: 'A' | 'B' | 'C' | 'D'; text: string; isCorrect: boolean }[]
  explanation: string
  mindsetNote: string
  sourceRef: string
}

export interface Flashcard {
  id: string
  track: ExamTrack
  domain: CMMCDomain
  front: string
  back: string
  cardType: 'term' | 'practice' | 'acronym'
  nextReview: string   // ISO date string
  interval: number
  easeFactor: number
}

export interface UserProgress {
  userId: string
  track: ExamTrack
  domain: CMMCDomain
  questionsAnswered: number
  correctCount: number
  lastStudied: string
  readinessScore: number
}

export interface StudySession {
  id: string
  userId: string
  track: ExamTrack
  startedAt: string
  endedAt: string
  questionsAnswered: number
  correctCount: number
  domain: CMMCDomain | 'mixed'
  mode: StudyMode
}

export interface DomainScore {
  answered: number
  correct: number
  scorePercent: number
  metTarget: boolean
}

export interface PracticeScore {
  answered: number
  correct: number
  mastered: boolean
}

export interface ExamResult {
  id: string
  userId: string
  track: ExamTrack
  level: CMMCLevel
  completedAt: string
  totalQuestions: number
  correctCount: number
  scorePercent: number
  passed: boolean
  timeTakenSeconds: number
  domainScores: Partial<Record<CMMCDomain, DomainScore>>
  practiceScores: Record<PracticeId, PracticeScore>
  missedQuestionIds: string[]
}

export interface ImprovementAction {
  priority: number
  type: StudyMode
  target: CMMCDomain | PracticeId | 'mixed'
  reason: string
  successCriteria: string
}

export interface ImprovementPhase {
  phaseNumber: number
  title: string
  goal: string
  targetReadinessPercent: number
  estimatedSessions: number
  actions: ImprovementAction[]
}

export interface DailySession {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  sessionMinutes: number
  focus: string
  mode: StudyMode
  target: CMMCDomain | PracticeId | 'mixed'
}

export interface ImprovementPlan {
  id: string
  userId: string
  track: ExamTrack
  level: CMMCLevel
  basedOnExamResultId: string
  generatedAt: string
  examTargetDate: string | null
  diagnosis: {
    readinessPercent: number
    gapToPass: number
    criticalPractices: PracticeId[]
    weakDomains: CMMCDomain[]
    strongDomains: CMMCDomain[]
    estimatedDaysToReady: number
  }
  phases: ImprovementPhase[]
  weeklySchedule: {
    week: number
    dailySessions: DailySession[]
    weeklyTarget: number
  }[]
}
