import { useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { DOMAIN_NAMES, ALL_DOMAINS, PASSING_THRESHOLDS, type CMMCDomain, type ExamTrack } from '@/types'
import type { SessionResult } from '@/lib/sessionEngine'
import { SEED_QUESTIONS } from '@/lib/questions'
import { useTrack } from '@/lib/TrackContext'

// ─── Fallback mock for when accessed directly (not from a session) ────────────

const MOCK_RESULT: SessionResult = {
  config: { mode: 'mockExam', track: 'CCP', level: 'L2', domain: 'mixed' },
  answers: [],
  totalQuestions: 50,
  correctCount: 31,
  scorePercent: 63,
  timeTakenSeconds: 3240,
  missedQuestionIds: ['l2-ca-001', 'l2-mp-001', 'l2-ra-001'],
  domainScores: {
    AC: { answered: 6, correct: 5, scorePercent: 83, metTarget: true },
    AT: { answered: 3, correct: 2, scorePercent: 67, metTarget: false },
    AU: { answered: 4, correct: 3, scorePercent: 75, metTarget: true },
    CM: { answered: 4, correct: 2, scorePercent: 50, metTarget: false },
    IA: { answered: 5, correct: 5, scorePercent: 100, metTarget: true },
    IR: { answered: 4, correct: 2, scorePercent: 50, metTarget: false },
    CA: { answered: 5, correct: 1, scorePercent: 20, metTarget: false },
    MP: { answered: 4, correct: 2, scorePercent: 50, metTarget: false },
    SC: { answered: 5, correct: 4, scorePercent: 80, metTarget: true },
    SI: { answered: 4, correct: 3, scorePercent: 75, metTarget: true },
    RA: { answered: 3, correct: 1, scorePercent: 33, metTarget: false },
    PE: { answered: 3, correct: 3, scorePercent: 100, metTarget: true },
  },
  practiceScores: {},
}

type Tab = 'results' | 'review' | 'path'

// ─── Results tab ──────────────────────────────────────────────────────────────

function ScoreSummary({ result, threshold }: { result: SessionResult; threshold: number }) {
  const { scorePercent, correctCount, totalQuestions, timeTakenSeconds } = result
  const passed = scorePercent >= Math.round(threshold * 100)
  const mins = Math.floor(timeTakenSeconds / 60)
  const gap = Math.round(threshold * 100) - scorePercent

  return (
    <View style={[styles.scoreCard, { borderColor: passed ? '#5CC89C' : '#FF6B6B' }]}>
      <View style={styles.scoreMain}>
        <Text style={[styles.scorePercent, { color: passed ? '#5CC89C' : '#FF6B6B' }]}>{scorePercent}%</Text>
        <View style={[styles.passBadge, { backgroundColor: passed ? 'rgba(92,200,156,0.15)' : 'rgba(255,107,107,0.15)' }]}>
          <Text style={[styles.passBadgeText, { color: passed ? '#5CC89C' : '#FF6B6B' }]}>
            {passed ? '✓ PASS' : '✗ NOT YET'}
          </Text>
        </View>
      </View>
      <View style={styles.scoreMeta}>
        <View style={styles.scoreMetaItem}>
          <Text style={styles.scoreMetaVal}>{correctCount}/{totalQuestions}</Text>
          <Text style={styles.scoreMetaLabel}>Correct</Text>
        </View>
        <View style={styles.scoreMetaItem}>
          <Text style={styles.scoreMetaVal}>{Math.round(threshold * 100)}%</Text>
          <Text style={styles.scoreMetaLabel}>Passing</Text>
        </View>
        <View style={styles.scoreMetaItem}>
          <Text style={styles.scoreMetaVal}>{mins}m</Text>
          <Text style={styles.scoreMetaLabel}>Time</Text>
        </View>
        <View style={styles.scoreMetaItem}>
          <Text style={[styles.scoreMetaVal, { color: gap > 0 ? '#FF6B6B' : '#5CC89C' }]}>
            {gap > 0 ? `-${gap}pts` : '+' + Math.abs(gap) + 'pts'}
          </Text>
          <Text style={styles.scoreMetaLabel}>{gap > 0 ? 'Gap' : 'Above'}</Text>
        </View>
      </View>
    </View>
  )
}

function DomainResults({ result }: { result: SessionResult }) {
  const scoredDomains = ALL_DOMAINS.filter(d => result.domainScores[d])
  return (
    <View>
      {scoredDomains.map((d) => {
        const s = result.domainScores[d]!
        const color = s.scorePercent >= 75 ? '#5CC89C' : s.scorePercent >= 55 ? '#F4C842' : '#FF6B6B'
        return (
          <View key={d} style={styles.domainResultRow}>
            <Text style={styles.domainResultCode}>{d}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.domainResultName}>{DOMAIN_NAMES[d]}</Text>
              <View style={styles.domainResultBarTrack}>
                <View style={[styles.domainResultBar, { width: `${s.scorePercent}%`, backgroundColor: color }]} />
                <View style={styles.domainResultTarget} />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.domainResultPct, { color }]}>{s.scorePercent}%</Text>
              <Text style={styles.domainResultFrac}>{s.correct}/{s.answered}</Text>
            </View>
            {s.metTarget
              ? <Text style={styles.domainCheck}>✓</Text>
              : <Text style={styles.domainX}>✗</Text>}
          </View>
        )
      })}
      <Text style={styles.targetNote}>White marker = 70% passing target</Text>
    </View>
  )
}

// ─── Question review tab ──────────────────────────────────────────────────────

function QuestionReview({ result }: { result: SessionResult }) {
  const missedQuestions = SEED_QUESTIONS.filter(q => result.missedQuestionIds.includes(q.id))
  const [expanded, setExpanded] = useState<string | null>(null)

  if (missedQuestions.length === 0) {
    return (
      <View style={styles.perfectScore}>
        <Text style={styles.perfectScoreIcon}>🎯</Text>
        <Text style={styles.perfectScoreTitle}>Perfect score!</Text>
        <Text style={styles.perfectScoreText}>You answered every question correctly.</Text>
      </View>
    )
  }

  return (
    <View>
      <Text style={styles.reviewNote}>{missedQuestions.length} missed · tap to expand</Text>
      {missedQuestions.map((q) => {
        const answer = result.answers.find(a => a.questionId === q.id)
        const isExpanded = expanded === q.id
        return (
          <TouchableOpacity
            key={q.id}
            style={styles.missedCard}
            onPress={() => setExpanded(isExpanded ? null : q.id)}
            activeOpacity={0.85}
          >
            <View style={styles.missedHeader}>
              <Text style={styles.missedDomain}>{q.domain}</Text>
              <Text style={styles.missedPractice}>{q.practiceId}</Text>
              <Text style={styles.missedChevron}>{isExpanded ? '▲' : '▼'}</Text>
            </View>
            <Text style={styles.missedStem} numberOfLines={isExpanded ? undefined : 2}>{q.stem}</Text>

            {isExpanded && (
              <>
                <View style={styles.answerRow}>
                  <View style={styles.answerBadge}>
                    <Text style={styles.answerBadgeLabel}>Your answer</Text>
                    <Text style={[styles.answerBadgeVal, { color: '#FF6B6B' }]}>{answer?.selectedLetter ?? '—'}</Text>
                  </View>
                  <View style={styles.answerBadge}>
                    <Text style={styles.answerBadgeLabel}>Correct</Text>
                    <Text style={[styles.answerBadgeVal, { color: '#5CC89C' }]}>
                      {q.options.find(o => o.isCorrect)?.letter ?? '—'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.missedExplanation}>{q.explanation}</Text>
                <View style={styles.mindsetBox}>
                  <Text style={styles.mindsetLabel}>CMMC Mindset</Text>
                  <Text style={styles.mindsetText}>{q.mindsetNote}</Text>
                </View>
                <Text style={styles.sourceRef}>{q.sourceRef}</Text>
              </>
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// ─── Path forward tab ─────────────────────────────────────────────────────────

function PathForward({ result, threshold }: { result: SessionResult; threshold: number }) {
  const router = useRouter()
  const gap = Math.round(threshold * 100) - result.scorePercent
  const passed = result.scorePercent >= Math.round(threshold * 100)

  // Derive critical practices — missed 2+ times or in domainScores < 55%
  const weakDomains = Object.entries(result.domainScores)
    .filter(([, s]) => s.scorePercent < 55)
    .sort((a, b) => a[1].scorePercent - b[1].scorePercent)
    .map(([d]) => d as CMMCDomain)

  const criticalPractices = Object.entries(result.practiceScores)
    .filter(([, s]) => s.answered >= 1 && s.correct === 0)
    .map(([p]) => p)

  if (passed) {
    return (
      <View style={styles.passedPathCard}>
        <Text style={styles.passedPathIcon}>🏆</Text>
        <Text style={styles.passedPathTitle}>You passed!</Text>
        <Text style={styles.passedPathText}>
          You scored {result.scorePercent}%, above the {Math.round(threshold * 100)}% passing threshold.
          Review any weak domains to ensure your knowledge is solid before your real exam.
        </Text>
      </View>
    )
  }

  return (
    <View>
      {/* Diagnosis */}
      <View style={styles.diagnosisCard}>
        <Text style={styles.diagnosisTitle}>Where You Stand</Text>
        <Text style={styles.diagnosisText}>
          You scored {result.scorePercent}% — {gap} point{gap !== 1 ? 's' : ''} below the passing threshold of {Math.round(threshold * 100)}%.
          {weakDomains.length > 0
            ? ` Your data shows critical gaps in ${weakDomains.slice(0, 3).join(', ')}. These domains are dragging your score below passing. Fix them first — everything else is secondary.`
            : ' Your scores are relatively even. Focus on bringing your lowest domains above 70% to push your overall score over the threshold.'
          }
        </Text>
      </View>

      {/* Critical practices */}
      {criticalPractices.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Fix These First</Text>
          <Text style={styles.sectionSub}>Practices you missed — highest priority</Text>
          {criticalPractices.slice(0, 6).map(p => (
            <View key={p} style={styles.practiceItem}>
              <Text style={styles.practiceItemId}>{p}</Text>
              <TouchableOpacity style={styles.drillBtn} onPress={() => router.push('/(tabs)/practice')}>
                <Text style={styles.drillBtnText}>Drill</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {/* Phase 1 */}
      <Text style={styles.sectionLabel}>Phase 1 — Close Critical Gaps</Text>
      <View style={styles.phaseCard}>
        <Text style={styles.phaseTitle}>
          {weakDomains.length > 0
            ? `Bring ${weakDomains.slice(0, 3).join(', ')} above 55%`
            : 'Raise your lowest domains'}
        </Text>
        <Text style={styles.phaseGoal}>
          Until these domains move, your overall readiness score cannot meaningfully improve.
          Don't spend time on domains where you're already passing — that time is better spent here.
        </Text>
        <Text style={styles.phaseExit}>Exit condition: All critical domains ≥ 55%</Text>
        <Text style={styles.phaseEst}>Estimated: 3–4 focused sessions</Text>
        <View style={styles.phaseActions}>
          {weakDomains.slice(0, 2).map(d => (
            <TouchableOpacity
              key={d}
              style={styles.phaseActionBtn}
              onPress={() => router.push({
                pathname: '/session',
                params: { mode: 'domainDrill', level: result.config.level, domain: d }
              })}
            >
              <Text style={styles.phaseActionBtnText}>
                → {d} Domain Drill ({result.config.level})
              </Text>
            </TouchableOpacity>
          ))}
          {result.missedQuestionIds.length > 0 && (
            <TouchableOpacity
              style={styles.phaseActionBtn}
              onPress={() => router.push({
                pathname: '/session',
                params: { mode: 'missedReview', level: result.config.level }
              })}
            >
              <Text style={styles.phaseActionBtnText}>→ Review Missed Questions</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Phase 2 */}
      <Text style={styles.sectionLabel}>Phase 2 — Raise Weak Domains</Text>
      <View style={[styles.phaseCard, styles.phaseCardDimmed]}>
        <Text style={styles.phaseTitle}>Push fair domains above 70%</Text>
        <Text style={styles.phaseGoal}>
          After Phase 1, focus on domains scoring 55–69%. These are close to passing and will move
          your overall readiness the most efficiently per session.
        </Text>
        <Text style={styles.phaseExit}>Exit condition: Overall readiness ≥ {Math.round(threshold * 100) - 2}%</Text>
        <Text style={styles.phaseEst}>Estimated: 2–3 sessions</Text>
      </View>

      {/* Phase 3 */}
      <Text style={styles.sectionLabel}>Phase 3 — Final Polish + Mock Exam</Text>
      <View style={[styles.phaseCard, styles.phaseCardDimmed]}>
        <Text style={styles.phaseTitle}>Confirm readiness before your real exam</Text>
        <Text style={styles.phaseGoal}>
          Shore up remaining weak spots and take a full mock exam. If you score {Math.round(threshold * 100) + 3}%+
          on the mock, you are ready.
        </Text>
        <Text style={styles.phaseExit}>Exit condition: Mock exam ≥ {Math.round(threshold * 100) + 3}%</Text>
        <Text style={styles.phaseEst}>Estimated: 1–2 sessions + 1 full mock</Text>
      </View>

      <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.homeBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── Root screen ─────────────────────────────────────────────────────────────

export default function ReviewScreen() {
  const router = useRouter()
  const { activeTrack } = useTrack()
  const params = useLocalSearchParams<{ result?: string }>()
  const [tab, setTab] = useState<Tab>('results')

  const result: SessionResult = params.result ? JSON.parse(params.result) : MOCK_RESULT
  const track: ExamTrack = result.config.track ?? activeTrack
  const threshold = PASSING_THRESHOLDS[track]

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backBtn}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exam Review · {track}</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['results', 'review', 'path'] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'results' ? 'Results' : t === 'review' ? 'Questions' : 'Your Path'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'results' && (
          <>
            <ScoreSummary result={result} threshold={threshold} />
            <Text style={styles.sectionLabel}>Domain Breakdown</Text>
            <DomainResults result={result} />
          </>
        )}
        {tab === 'review' && <QuestionReview result={result} />}
        {tab === 'path' && <PathForward result={result} threshold={threshold} />}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0F14' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 20 },
  backBtn: { fontSize: 14, fontFamily: 'DMSans_500Medium', color: '#4ECDC4' },
  headerTitle: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)', paddingHorizontal: 16 },
  tab: { flex: 1, paddingBottom: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#4ECDC4' },
  tabText: { fontSize: 13, fontFamily: 'DMSans_500Medium', color: '#8A909E' },
  tabTextActive: { color: '#4ECDC4' },
  content: { padding: 16, paddingBottom: 48 },
  sectionLabel: { fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#8A909E', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  sectionSub: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginBottom: 10, marginTop: -4 },
  // Score summary
  scoreCard: { borderRadius: 14, borderWidth: 2, backgroundColor: '#151920', padding: 16, marginBottom: 8 },
  scoreMain: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  scorePercent: { fontSize: 52, fontFamily: 'DMSerifDisplay_400Regular' },
  passBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  passBadgeText: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', letterSpacing: 0.5 },
  scoreMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  scoreMetaItem: { alignItems: 'center' },
  scoreMetaVal: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0' },
  scoreMetaLabel: { fontSize: 10, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginTop: 2 },
  // Domain results
  domainResultRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#151920', borderRadius: 10, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  domainResultCode: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4', width: 24 },
  domainResultName: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginBottom: 4 },
  domainResultBarTrack: { height: 5, backgroundColor: '#1D2330', borderRadius: 3, position: 'relative' },
  domainResultBar: { height: '100%', borderRadius: 3 },
  domainResultTarget: { position: 'absolute', top: 0, bottom: 0, left: '70%', width: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  domainResultPct: { fontSize: 12, fontFamily: 'DMSans_600SemiBold' },
  domainResultFrac: { fontSize: 10, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  domainCheck: { fontSize: 14, color: '#5CC89C', width: 18 },
  domainX: { fontSize: 14, color: '#FF6B6B', width: 18 },
  targetNote: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginTop: 6, fontStyle: 'italic' },
  // Question review
  reviewNote: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginBottom: 12 },
  missedCard: { backgroundColor: '#151920', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,107,107,0.2)' },
  missedHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  missedDomain: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: '#FF6B6B' },
  missedPractice: { fontSize: 12, fontFamily: 'DMSans_500Medium', color: '#8A909E', flex: 1 },
  missedChevron: { fontSize: 10, color: '#8A909E' },
  missedStem: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', lineHeight: 19, marginBottom: 6 },
  answerRow: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  answerBadge: { flex: 1, backgroundColor: '#1D2330', borderRadius: 8, padding: 8, alignItems: 'center' },
  answerBadgeLabel: { fontSize: 10, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginBottom: 2 },
  answerBadgeVal: { fontSize: 18, fontFamily: 'DMSans_600SemiBold' },
  missedExplanation: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E', lineHeight: 18, marginBottom: 10 },
  mindsetBox: { backgroundColor: 'rgba(244,200,66,0.06)', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(244,200,66,0.15)', marginBottom: 8 },
  mindsetLabel: { fontSize: 10, fontFamily: 'DMSans_600SemiBold', color: '#F4C842', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  mindsetText: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', lineHeight: 18 },
  sourceRef: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#8A909E', fontStyle: 'italic' },
  perfectScore: { alignItems: 'center', paddingVertical: 48 },
  perfectScoreIcon: { fontSize: 48, marginBottom: 12 },
  perfectScoreTitle: { fontSize: 22, fontFamily: 'DMSerifDisplay_400Regular', color: '#E8EAF0', marginBottom: 8 },
  perfectScoreText: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  // Path forward
  diagnosisCard: { backgroundColor: 'rgba(244,200,66,0.06)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(244,200,66,0.2)', marginBottom: 4 },
  diagnosisTitle: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#F4C842', marginBottom: 8 },
  diagnosisText: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', lineHeight: 20 },
  practiceItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#151920', borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(255,107,107,0.25)' },
  practiceItemId: { fontSize: 14, fontFamily: 'DMSans_500Medium', color: '#FF6B6B' },
  drillBtn: { backgroundColor: 'rgba(255,107,107,0.12)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  drillBtnText: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: '#FF6B6B' },
  phaseCard: { backgroundColor: '#151920', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(78,205,196,0.3)' },
  phaseCardDimmed: { borderColor: 'rgba(255,255,255,0.07)', opacity: 0.7 },
  phaseTitle: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0', marginBottom: 6 },
  phaseGoal: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', lineHeight: 19, marginBottom: 8 },
  phaseExit: { fontSize: 12, fontFamily: 'DMSans_500Medium', color: '#4ECDC4', marginBottom: 2 },
  phaseEst: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginBottom: 12 },
  phaseActions: { gap: 6 },
  phaseActionBtn: { backgroundColor: 'rgba(78,205,196,0.1)', borderRadius: 8, padding: 10 },
  phaseActionBtnText: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4' },
  homeBtn: { backgroundColor: '#151920', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  homeBtnText: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0' },
  passedPathCard: { backgroundColor: 'rgba(92,200,156,0.08)', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: 'rgba(92,200,156,0.25)', alignItems: 'center' },
  passedPathIcon: { fontSize: 40, marginBottom: 12 },
  passedPathTitle: { fontSize: 22, fontFamily: 'DMSerifDisplay_400Regular', color: '#5CC89C', marginBottom: 8 },
  passedPathText: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', textAlign: 'center', lineHeight: 20 },
})
