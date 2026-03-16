# CMMC Apex — Claude Code Context

## What this project is

A best-in-class CMMC exam prep mobile app for iOS and Android covering all three Cyber AB credentials:

- **RP** — Registered Practitioner
- **CCP** — Certified CMMC Professional
- **CCA** — Certified CMMC Assessor

One app, three exam tracks. Users select their target credential on onboarding and can switch tracks at any time. All study data is tracked per-exam-track independently.

The single biggest differentiator: **assessor/compliance mindset coaching baked into every question and explanation** — not just fact drilling. CMMC exams test whether you understand *why* a practice exists and how to apply it in a real DoD contractor environment, not just whether you can recall a control number. This app trains that mental model explicitly.

---

## Tech stack

- **React Native / Expo** — single codebase for iOS and Android
- **TypeScript** — strict mode
- **Supabase** — auth, cloud sync, progress storage
- **NativeWind** — Tailwind CSS for React Native
- **Expo Router** — file-based navigation
- **React Hook Form + Zod** — form validation
- **Victory Native** — analytics charts
- **Sonner Native** — toast notifications
- **expo-sqlite** — offline-first local storage

Offline-first: all study data persists locally via expo-sqlite, syncs to Supabase when online. Progress is never lost on app update.

---

## The three CMMC maturity levels

Questions are tagged to a specific CMMC level and practice ID. Sessions never mix levels — a user drilling L2 will only see L2 questions.

### Level 1 — Foundational (17 practices)
Source: FAR 52.204-21. Basic safeguarding of Federal Contract Information (FCI).
Practice IDs: AC.L1, IA.L1, MP.L1, PE.L1, SC.L1, SI.L1 families.

### Level 2 — Advanced (110 practices)
Source: NIST SP 800-171 Rev 2. Protection of Controlled Unclassified Information (CUI).
All 14 domains. Practice IDs follow the format: `DOMAIN.L2-3.x.x` (e.g., `AC.L2-3.1.2`).

### Level 3 — Expert (24 additional practices)
Source: NIST SP 800-172. Enhanced protections against APTs.
Practice IDs follow the format: `DOMAIN.L3-3.x.x` (e.g., `AC.L3-3.1.3e`).

---

## The three exam tracks

### RP — Registered Practitioner
Entry-level Cyber AB credential. Question coverage: L1 (all) + L2 awareness. Focuses on CMMC framework, CUI identification, scoping basics, and the Cyber AB ecosystem. Does NOT test L3.

### CCP — Certified CMMC Professional
Practitioner-level. Question coverage: L1 (all) + L2 (all) + L3 (awareness). Tests deep knowledge of all 110 NIST SP 800-171 practices, scoping, POA&M management, and assessment preparation.

### CCA — Certified CMMC Assessor
Assessor-level. Question coverage: L1 + L2 + L3 (all) + assessment methodology. Tests full practice knowledge plus evidence collection, interview techniques, lead assessor responsibilities, C3PAO operations, and CMMC adjudication process.

---

## The 14 CMMC/NIST SP 800-171 domains

Always use these exact names, abbreviations, and this order:

1. Access Control (AC)
2. Awareness and Training (AT)
3. Audit and Accountability (AU)
4. Configuration Management (CM)
5. Identification and Authentication (IA)
6. Incident Response (IR)
7. Maintenance (MA)
8. Media Protection (MP)
9. Personnel Security (PS)
10. Physical Protection (PE)
11. Risk Assessment (RA)
12. Security Assessment (CA)
13. System and Communications Protection (SC)
14. System and Information Integrity (SI)

---

## App structure — four core screens

### 1. Home (`/`)
- Exam track selector / current track badge (RP / CCP / CCA)
- Readiness ring (percentage + days-to-exam countdown)
- Domain heatmap — all 14 NIST domains with color-coded mastery bars
  - Green ≥ 75% | Yellow 55–74% | Red < 55%
- Stat pills: current streak, total questions answered, avg score
- Quick-start action grid: Quick 10, Due Cards, Weak Domains, Mock Exam
- Smart daily recommendation: surfaces weakest domain

### 2. Practice (`/practice`)
- Adaptive question engine — difficulty scales based on per-domain performance
- **Compliance tip** shown above every question: frames the "think like an assessor" lens
- On submit: reveals correct answer + deep explanation
- Explanation always ends with a **CMMC Mindset note** — explains the compliance/assessor reasoning
- Study modes:
  - Quick 10 (adaptive, ~10 min)
  - Weak Domain Focus (targets lowest-scoring domain)
  - Domain Drill (user selects one of 14 domains)
  - Timed Mock Exam (exam-length, timed, randomized)
  - Missed Questions Review

### 3. Flashcards (`/flashcards`)
- Spaced repetition using SM-2 algorithm (Anki-style)
- Rating buttons: Again / Hard / Good (next-review interval shown on each button)
- Card types: Term → Definition, Practice → Application, Acronym → Expansion
- Decks organized by domain
- User can create custom cards
- "Due today" count shown on Home and as tab bar badge

### 4. Progress (`/progress`)
- **Overview tab:**
  - Weekly activity bar chart (questions answered per day, last 7 days)
  - Readiness score trend line over recent sessions
  - Domain score bar chart — top domains by score, compact visual summary (hidden until first session)
  - Insight cards: strongest domain, weakest domain, overall score
  - Stat cards: total questions, sessions, domains hit
- **Domains tab:** Per-domain accuracy breakdown (all 14 domains) — shows score vs 70% passing target line
- **Study Plan tab:** Personalized phased plan generated from weak domains and exam date
- Per-track progress — switch between RP / CCP / CCA progress views
- Peer percentile comparison (anonymous, opt-in)
  - Personalized daily/weekly plan generated from weak domains and exam date
  - Plan updates automatically as performance changes
  - Each plan item links directly into the relevant study mode
  - Shows estimated sessions to reach passing readiness per domain

### 5. Exam Review (`/review`) — post-mock-exam screen
Triggered immediately after completing any Mock Exam session. Three tabs:

**Results tab**
- Score summary: total correct, percentage, pass/fail vs threshold, time taken
- Domain-by-domain bar chart: your score vs passing target per domain, color-coded
- Practice-level heatmap: every CMMC practice ID tested, green/yellow/red mastered state

**Question Review tab**
- Every question from the session: your answer, correct answer, full explanation + mindset note
- Grouped by domain, then sorted: missed first, then correct
- Each missed question shows the specific practice ID and source reference

**Your Path Forward tab** — this is not a checklist, it is a prescription
- Diagnostic summary: plain-English statement of where you stand and what the data shows
- Critical practices list: specific practice IDs you missed 2+ times — these are your first priority
- Phased improvement plan: ordered phases with clear goals, exit conditions, and estimated sessions
- This week's schedule: concrete day-by-day session plan with mode, target domain/practice, and time
- Each action item is tappable — launches directly into the correct study mode pre-configured
- Plan regenerates automatically as you complete sessions and performance changes

---

## Core data shapes

```typescript
type ExamTrack = 'RP' | 'CCP' | 'CCA'

type CMMCDomain =
  | 'AC' | 'AT' | 'AU' | 'CM' | 'IA' | 'IR'
  | 'MA' | 'MP' | 'PS' | 'PE' | 'RA' | 'CA' | 'SC' | 'SI'

type CMMCLevel = 'L1' | 'L2' | 'L3'

// Practice ID format examples: 'AC.L1-3.1.1', 'AC.L2-3.1.2', 'AC.L3-3.1.3e'
type PracticeId = string

type StudyMode =
  | 'quick10' | 'weakDomain' | 'domainDrill' | 'mockExam' | 'missedReview' | 'practiceReview'

// Passing thresholds per exam track (verify against Cyber AB official docs before publishing)
const PASSING_THRESHOLDS: Record<ExamTrack, number> = {
  RP: 0.70,   // 70% — foundational credential
  CCP: 0.70,  // 70% — practitioner level
  CCA: 0.75,  // 75% — assessor level, higher bar
}

// Domain weight per track — not all domains are weighted equally on each exam
// These weights inform readiness score calculation and study plan prioritization
const DOMAIN_WEIGHTS: Record<ExamTrack, Partial<Record<CMMCDomain, number>>> = {
  RP:  { AC: 1, AT: 2, AU: 1, CM: 1, IA: 1, IR: 1, MA: 1, MP: 1, PS: 1, PE: 1, RA: 1, CA: 1, SC: 1, SI: 1 },
  CCP: { AC: 2, AT: 1, AU: 2, CM: 2, IA: 2, IR: 2, MA: 1, MP: 2, PS: 1, PE: 1, RA: 2, CA: 2, SC: 2, SI: 2 },
  CCA: { AC: 2, AT: 1, AU: 2, CM: 2, IA: 2, IR: 2, MA: 1, MP: 2, PS: 1, PE: 1, RA: 2, CA: 3, SC: 2, SI: 2 },
  // CA (Security Assessment) weighted 3x for CCA — core of the assessor role
}

// Question
{
  id: string
  tracks: ExamTrack[]        // which credential exams this question appears in (can be multiple)
  level: CMMCLevel           // L1, L2, or L3 — NEVER mixed in a single session
  practiceId: PracticeId     // exact CMMC practice ID this question tests (e.g. 'AC.L2-3.1.2')
  domain: CMMCDomain
  difficulty: 1 | 2 | 3     // 1=easy, 2=medium, 3=hard
  stem: string
  options: { letter: 'A'|'B'|'C'|'D', text: string, isCorrect: boolean }[]
  explanation: string        // why correct + why others are wrong
  mindsetNote: string        // assessor/compliance reasoning — required on every question
  sourceRef: string          // reference to source doc (e.g. 'NIST SP 800-171 Rev 2 §3.1.2')
}

// Flashcard
{
  id: string
  track: ExamTrack
  domain: CMMCDomain
  front: string
  back: string
  cardType: 'term' | 'practice' | 'acronym'
  nextReview: Date
  interval: number           // days until next review (SM-2)
  easeFactor: number         // SM-2 ease factor, starts at 2.5
}

// UserProgress (per domain per track)
{
  userId: string
  track: ExamTrack
  domain: CMMCDomain
  questionsAnswered: number
  correctCount: number
  lastStudied: Date
  readinessScore: number     // 0–100, calculated transparently
}

// StudySession
{
  id: string
  userId: string
  track: ExamTrack
  startedAt: Date
  endedAt: Date
  questionsAnswered: number
  correctCount: number
  domain: CMMCDomain | 'mixed'
  mode: StudyMode
}

// ExamResult — stored after every Mock Exam session
{
  id: string
  userId: string
  track: ExamTrack
  level: CMMCLevel
  completedAt: Date
  totalQuestions: number
  correctCount: number
  scorePercent: number
  passed: boolean                               // scorePercent >= PASSING_THRESHOLDS[track]
  timeTakenSeconds: number
  domainScores: Record<CMMCDomain, {
    answered: number
    correct: number
    scorePercent: number
    metTarget: boolean
  }>
  practiceScores: Record<PracticeId, {          // granular — per CMMC practice ID
    answered: number
    correct: number
    mastered: boolean                           // true if correct ≥ 2 consecutive times
  }>
  missedQuestionIds: string[]
}

// ImprovementPlan — generated after each ExamResult, replaces simple checklist
// This is the core of the "path to improvement" feature
{
  id: string
  userId: string
  track: ExamTrack
  level: CMMCLevel
  basedOnExamResultId: string
  generatedAt: Date
  examTargetDate: Date | null

  // Diagnostic summary — what the data says about the user right now
  diagnosis: {
    readinessPercent: number
    gapToPass: number                           // points needed to reach passing threshold
    criticalPractices: PracticeId[]             // specific practices missed 2+ times — fix these first
    weakDomains: CMMCDomain[]                   // domains below 55% — ordered by severity
    strongDomains: CMMCDomain[]                 // domains above 75% — maintain, don't over-drill
    estimatedDaysToReady: number                // calculated from current trajectory
  }

  // Ordered phases — each phase has a clear goal and exits when target is hit
  phases: {
    phaseNumber: number
    title: string                               // e.g. "Close Critical Gaps", "Raise Weak Domains", "Full Readiness Polish"
    goal: string                                // plain-English description of what success looks like
    targetReadinessPercent: number              // exit condition for this phase
    estimatedSessions: number
    actions: {
      priority: number                          // 1 = do this first
      type: 'domainDrill' | 'practiceReview' | 'missedReview' | 'flashcards' | 'mockExam'
      target: CMMCDomain | PracticeId | 'mixed' // what to drill
      reason: string                            // plain-English: why this action was chosen
      successCriteria: string                   // plain-English: how user knows they're done with this action
    }[]
  }[]

  // Weekly schedule — concrete day-by-day plan
  weeklySchedule: {
    week: number
    dailySessions: {
      day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
      sessionMinutes: number
      focus: string                             // e.g. "AC domain drill (L2)", "Missed questions review"
      mode: StudyMode
      target: CMMCDomain | PracticeId | 'mixed'
    }[]
    weeklyTarget: number                        // readiness % to reach by end of week
  }[]
}
```

---

## Design tokens

- Background: `#0C0F14`
- Surface: `#151920`
- Surface2: `#1D2330`
- Primary accent: `#4ECDC4` (teal)
- Success/good: `#5CC89C`
- Warning: `#F4C842` (gold)
- Danger/weak: `#FF6B6B`
- Heading font: DM Serif Display
- Body font: DM Sans
- Compliance tip callout: gold-tinted box (`rgba(244,200,66,0.08)` bg) above every question

Track badge colors:
- RP: `#8B7FE8` (purple)
- CCP: `#4ECDC4` (teal/accent)
- CCA: `#F4C842` (gold)

---

## Business model

- Free tier: 30 questions per track, 3 study modes, basic analytics
- Premium: full question bank, all modes, full analytics
- Pricing: monthly subscription OR one-time lifetime purchase
- No ads. No dark patterns.

---

## Design reference

`cissp-apex-prototype.html` in this directory is a visual reference for layout, color, and UX patterns. The screen structure and component style carry over — only the content domain changes (CMMC vs CISSP).

---

## Current status

- [x] Competitive analysis complete
- [x] Feature architecture defined
- [x] Interactive HTML/CSS prototype (visual reference)
- [x] Expo project initialized
- [x] Dependencies installed (NativeWind, Supabase, Victory Native, expo-sqlite, etc.)
- [x] Expo Router navigation structure (4-tab layout + modal stack)
- [x] Onboarding / exam track selection (2-step: track → exam date)
- [x] Home screen (readiness ring, stat pills, domain heatmap, quick-start grid)
- [x] Question engine + adaptive difficulty logic (session engine, computeResult)
- [x] Flashcard SM-2 algorithm implementation (sm2.ts + flashcardStore.ts)
- [x] Exam Review screen (Results + Questions + Path Forward tabs)
- [x] Study Plan generation logic (phased plan computed from domainScores)
- [x] Offline-first storage layer (expo-sqlite — sessions + answers tables)
- [x] Analytics charts (Victory Native — WeeklyBarChart, DomainScoreChart, ReadinessTrendChart)
- [x] Question bank: 248 questions across L1/L2/L3 + ecosystem/CAP/scoping/POA&M/CoPC
- [x] Flashcard bank: 100+ SM-2 cards across all 14 domains + CMMC framework

### Remaining before launch
- [ ] xcode-select fix: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
- [ ] First simulator run + visual QA pass
- [ ] Supabase schema + migrations (tables: profiles, sessions, answers)
- [ ] .env file: EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
- [ ] RevenueCat integration (PremiumContext.tsx has placeholder)
- [ ] App icon (1024×1024 PNG required for App Store)
- [ ] EAS build + TestFlight distribution
- [ ] App Store + Play Store submission prep
