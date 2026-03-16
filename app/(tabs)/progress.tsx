import { useState, useCallback } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { TRACK_COLORS, DOMAIN_NAMES, ALL_DOMAINS, PASSING_THRESHOLDS, type ExamTrack, type CMMCDomain } from '@/types'
import { useTrack } from '@/lib/TrackContext'
import { usePremium } from '@/lib/PremiumContext'
import { getDomainScores, getDailyActivity, getOverallStats, getSessionScores } from '@/lib/db'
import { WeeklyBarChart, DomainScoreChart, ReadinessTrendChart } from '@/components/charts'

const TRACKS: ExamTrack[] = ['RP', 'CCP', 'CCA']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Tab = 'overview' | 'domains' | 'plan'

interface DomainScore { answered: number; correct: number; scorePercent: number }
interface DayActivity { date: string; count: number; correct: number }
interface OverallStats { totalAnswered: number; totalCorrect: number; scorePercent: number; totalSessions: number }

// ─── Domain breakdown ─────────────────────────────────────────────────────────

function DomainBreakdown({ scores }: { scores: Record<string, DomainScore> }) {
  return (
    <View>
      {ALL_DOMAINS.map((d) => {
        const entry = scores[d]
        const score = entry?.scorePercent ?? 0
        const hasData = (entry?.answered ?? 0) > 0
        const color = !hasData ? '#8A909E' : score >= 75 ? '#5CC89C' : score >= 55 ? '#F4C842' : '#FF6B6B'
        const gap = Math.max(0, 70 - score)
        return (
          <View key={d} style={styles.domainCard}>
            <View style={styles.domainCardHeader}>
              <Text style={styles.domainCardCode}>{d}</Text>
              <Text style={styles.domainCardName}>{DOMAIN_NAMES[d]}</Text>
              <Text style={[styles.domainCardScore, { color }]}>
                {hasData ? `${score}%` : '—'}
              </Text>
            </View>
            <View style={styles.domainBarTrack}>
              {hasData && <View style={[styles.domainBar, { width: `${score}%`, backgroundColor: color }]} />}
              <View style={[styles.domainTarget, { left: '70%' }]} />
            </View>
            {hasData && gap > 0 && (
              <Text style={styles.domainGap}>+{gap}pts to passing target</Text>
            )}
            {!hasData && (
              <Text style={styles.domainNoData}>No questions answered yet</Text>
            )}
          </View>
        )
      })}
    </View>
  )
}

// ─── Study plan ───────────────────────────────────────────────────────────────

function StudyPlan({
  scores,
  stats,
  track,
}: {
  scores: Record<string, DomainScore>
  stats: OverallStats
  track: ExamTrack
}) {
  const router = useRouter()
  const threshold = Math.round(PASSING_THRESHOLDS[track] * 100)
  const readiness = stats.scorePercent
  const gap = Math.max(0, threshold - readiness)

  const weakDomains = ALL_DOMAINS
    .filter(d => (scores[d]?.answered ?? 0) >= 3)
    .sort((a, b) => (scores[a]?.scorePercent ?? 100) - (scores[b]?.scorePercent ?? 100))
    .slice(0, 3)

  const hasEnoughData = stats.totalAnswered >= 10

  if (!hasEnoughData) {
    return (
      <View style={styles.planDiagnosis}>
        <Text style={styles.planDiagnosisTitle}>Not enough data yet</Text>
        <Text style={styles.planDiagnosisText}>
          Complete at least 10 questions to generate a personalized study plan. Your plan will update automatically as you practice.
        </Text>
        <TouchableOpacity
          style={styles.phaseAction}
          onPress={() => router.push('/(tabs)/practice')}
        >
          <Text style={styles.phaseActionText}>Start a session →</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const diagnosisText = gap === 0
    ? `You're at ${readiness}% — above the ${threshold}% passing threshold for ${track}. Focus on maintaining and polishing weak spots.`
    : `You're at ${readiness}% — ${gap} points below the ${threshold}% passing threshold for ${track}. ${weakDomains.length > 0 ? `${weakDomains.slice(0, 2).join(' and ')} are your biggest gaps.` : 'Keep drilling to identify your weak domains.'}`

  const phases = [
    {
      num: 1,
      title: 'Close Critical Gaps',
      goal: 'Get every domain above 55%',
      target: Math.min(threshold - 5, readiness + 10),
      focus: weakDomains.length > 0 ? `${weakDomains.join(', ')} — targeted drilling` : 'Mixed practice to build baseline',
    },
    {
      num: 2,
      title: 'Raise Weak Domains',
      goal: 'Get every domain above 65%',
      target: Math.min(threshold, readiness + 15),
      focus: 'Domain Drill on remaining gaps + Missed Questions',
    },
    {
      num: 3,
      title: 'Full Readiness Polish',
      goal: `Hit ${threshold}%+ overall`,
      target: threshold + 5,
      focus: 'Mock Exam + review wrong answers',
    },
  ]

  return (
    <View>
      <View style={styles.planDiagnosis}>
        <Text style={styles.planDiagnosisTitle}>Your Diagnosis</Text>
        <Text style={styles.planDiagnosisText}>{diagnosisText}</Text>
        {weakDomains.length > 0 && (
          <View style={styles.criticalList}>
            <Text style={styles.criticalTitle}>Weakest Domains</Text>
            {weakDomains.map(d => (
              <View key={d} style={styles.criticalItem}>
                <Text style={styles.criticalDot}>●</Text>
                <Text style={styles.criticalId}>{d} — {DOMAIN_NAMES[d]} ({scores[d]?.scorePercent ?? 0}%)</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <Text style={styles.sectionLabel}>Phased Plan</Text>
      {phases.map((phase, i) => {
        const isCurrent = i === 0
        return (
          <View key={phase.num} style={[styles.phaseCard, isCurrent && styles.phaseCardActive]}>
            <View style={styles.phaseHeader}>
              <Text style={[styles.phaseWeek, isCurrent && { color: '#4ECDC4' }]}>Phase {phase.num}</Text>
              {isCurrent && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>NOW</Text></View>}
              <Text style={styles.phaseTarget}>Target: {phase.target}%</Text>
            </View>
            <Text style={styles.phaseFocus}>{phase.focus}</Text>
            {isCurrent && weakDomains.length > 0 && (
              <TouchableOpacity
                style={styles.phaseAction}
                onPress={() => router.push('/(tabs)/practice')}
              >
                <Text style={styles.phaseActionText}>Start weak domain drill →</Text>
              </TouchableOpacity>
            )}
          </View>
        )
      })}
    </View>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const { activeTrack, setActiveTrack } = useTrack()
  const { isPremium } = usePremium()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [domainScores, setDomainScores] = useState<Record<string, DomainScore>>({})
  const [activity, setActivity] = useState<DayActivity[]>([])
  const [stats, setStats] = useState<OverallStats>({ totalAnswered: 0, totalCorrect: 0, scorePercent: 0, totalSessions: 0 })
  const [sessionScores, setSessionScores] = useState<Array<{ session: number; score: number }>>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [scores, act, st, ss] = await Promise.all([
        getDomainScores(activeTrack),
        getDailyActivity(activeTrack, 7),
        getOverallStats(activeTrack),
        getSessionScores(activeTrack),
      ])
      setDomainScores(scores)
      setActivity(act)
      setStats(st)
      setSessionScores(ss)
    } finally {
      setLoading(false)
    }
  }, [activeTrack])

  useFocusEffect(useCallback(() => { void load() }, [load]))

  // Derived insights — use spread to avoid mutating the filtered array
  const domainsWithData = ALL_DOMAINS.filter(d => (domainScores[d]?.answered ?? 0) > 0)
  const strongest = [...domainsWithData].sort((a, b) => (domainScores[b]?.scorePercent ?? 0) - (domainScores[a]?.scorePercent ?? 0))[0]
  const weakest = [...domainsWithData].sort((a, b) => (domainScores[a]?.scorePercent ?? 0) - (domainScores[b]?.scorePercent ?? 0))[0]

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.heading}>Progress</Text>

        {/* Track switcher */}
        <View style={styles.trackRow}>
          {TRACKS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.trackChip, activeTrack === t && { borderColor: TRACK_COLORS[t], backgroundColor: `${TRACK_COLORS[t]}18` }]}
              onPress={() => setActiveTrack(t)}
            >
              <Text style={[styles.trackChipText, activeTrack === t && { color: TRACK_COLORS[t] }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab bar */}
        <View style={styles.tabs}>
          {(['overview', 'domains', 'plan'] as Tab[]).map((t) => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'overview' ? 'Overview' : t === 'domains' ? 'Domains' : 'Study Plan'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color="#4ECDC4" style={{ marginTop: 40 }} />
        ) : (
          <>
            {tab === 'overview' && (() => {
              const weeklyData = Array.from({ length: 7 }, (_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (6 - i))
                const dateStr = d.toISOString().slice(0, 10)
                const dayIdx = d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1
                const entry = activity.find(a => a.date === dateStr)
                return { day: DAYS[dayIdx], count: entry?.count ?? 0 }
              })
              return (
              <>
                <WeeklyBarChart data={weeklyData} />
                <ReadinessTrendChart data={sessionScores} />
                {(() => {
                  const domainChartData = ALL_DOMAINS
                    .filter(d => (domainScores[d]?.answered ?? 0) > 0)
                    .sort((a, b) => (domainScores[b]?.scorePercent ?? 0) - (domainScores[a]?.scorePercent ?? 0))
                    .map(d => ({ domain: d, score: domainScores[d]?.scorePercent ?? 0 }))
                  return domainChartData.length > 0 ? <DomainScoreChart data={domainChartData} /> : null
                })()}
                <View style={styles.insightRow}>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Strongest</Text>
                    <Text style={styles.insightValue}>
                      {strongest ? `${strongest} · ${domainScores[strongest]?.scorePercent ?? 0}%` : '—'}
                    </Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Weakest</Text>
                    <Text style={[styles.insightValue, { color: weakest ? '#FF6B6B' : '#8A909E' }]}>
                      {weakest ? `${weakest} · ${domainScores[weakest]?.scorePercent ?? 0}%` : '—'}
                    </Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Overall</Text>
                    <Text style={[styles.insightValue, { color: stats.totalAnswered === 0 ? '#8A909E' : stats.scorePercent >= 70 ? '#5CC89C' : '#F4C842' }]}>
                      {stats.totalAnswered === 0 ? '—' : `${stats.scorePercent}%`}
                    </Text>
                  </View>
                </View>
                <View style={styles.statRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.totalAnswered}</Text>
                    <Text style={styles.statLabel}>Questions</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.totalSessions}</Text>
                    <Text style={styles.statLabel}>Sessions</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{domainsWithData.length}/14</Text>
                    <Text style={styles.statLabel}>Domains Hit</Text>
                  </View>
                </View>
              </>
              )
            })()}

            {tab === 'domains' && <DomainBreakdown scores={domainScores} />}
            {tab === 'plan' && (
              isPremium
                ? <StudyPlan scores={domainScores} stats={stats} track={activeTrack} />
                : (
                  <View style={styles.planGate}>
                    <Text style={styles.planGateIcon}>◎</Text>
                    <Text style={styles.planGateTitle}>Personalized Study Plan</Text>
                    <Text style={styles.planGateDesc}>
                      Your study plan analyzes weak domains and builds a phased roadmap to passing. Available with Premium.
                    </Text>
                    <TouchableOpacity style={styles.planGateBtn} onPress={() => router.push('/paywall')}>
                      <Text style={styles.planGateBtnText}>Unlock Premium →</Text>
                    </TouchableOpacity>
                  </View>
                )
            )}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0F14' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 26, fontFamily: 'DMSerifDisplay_400Regular', color: '#E8EAF0', paddingTop: 20, marginBottom: 16 },
  trackRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  trackChip: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  trackChipText: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: '#8A909E' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)', marginBottom: 20 },
  tab: { flex: 1, paddingBottom: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#4ECDC4' },
  tabText: { fontSize: 13, fontFamily: 'DMSans_500Medium', color: '#8A909E' },
  tabTextActive: { color: '#4ECDC4' },
  insightRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  insightCard: { flex: 1, backgroundColor: '#151920', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  insightLabel: { fontSize: 10, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginBottom: 4 },
  insightValue: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0' },
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  statCard: { flex: 1, backgroundColor: '#151920', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  statValue: { fontSize: 20, fontFamily: 'DMSerifDisplay_400Regular', color: '#4ECDC4', marginBottom: 2 },
  statLabel: { fontSize: 10, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  // Domain breakdown
  domainCard: { backgroundColor: '#151920', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  domainCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  domainCardCode: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4', width: 28 },
  domainCardName: { flex: 1, fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#E8EAF0' },
  domainCardScore: { fontSize: 13, fontFamily: 'DMSans_600SemiBold' },
  domainBarTrack: { height: 6, backgroundColor: '#1D2330', borderRadius: 3, overflow: 'hidden', position: 'relative' },
  domainBar: { height: '100%', borderRadius: 3 },
  domainTarget: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  domainGap: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#FF6B6B', marginTop: 5 },
  domainNoData: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginTop: 4 },
  sectionLabel: { fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#8A909E', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 20 },
  // Study plan
  planDiagnosis: { backgroundColor: 'rgba(244,200,66,0.06)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(244,200,66,0.2)', marginBottom: 4 },
  planDiagnosisTitle: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#F4C842', marginBottom: 8 },
  planDiagnosisText: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', lineHeight: 20, marginBottom: 12 },
  criticalList: { borderTopWidth: 1, borderTopColor: 'rgba(244,200,66,0.15)', paddingTop: 12 },
  criticalTitle: { fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#8A909E', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  criticalItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  criticalDot: { fontSize: 8, color: '#FF6B6B' },
  criticalId: { fontSize: 13, fontFamily: 'DMSans_500Medium', color: '#FF6B6B' },
  phaseCard: { backgroundColor: '#151920', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  phaseCardActive: { borderColor: '#4ECDC4', backgroundColor: 'rgba(78,205,196,0.06)' },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  phaseWeek: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#8A909E' },
  currentBadge: { backgroundColor: 'rgba(78,205,196,0.15)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  currentBadgeText: { fontSize: 10, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4', letterSpacing: 0.8 },
  phaseTarget: { marginLeft: 'auto', fontSize: 12, fontFamily: 'DMSans_500Medium', color: '#8A909E' },
  phaseFocus: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#E8EAF0' },
  phaseAction: { marginTop: 10 },
  phaseActionText: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4' },
  planGate: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  planGateIcon: { fontSize: 40, marginBottom: 16 },
  planGateTitle: { fontSize: 18, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0', marginBottom: 10, textAlign: 'center' },
  planGateDesc: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#8A909E', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  planGateBtn: { backgroundColor: 'rgba(244,200,66,0.1)', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28, borderWidth: 1, borderColor: 'rgba(244,200,66,0.3)' },
  planGateBtnText: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#F4C842' },
})
