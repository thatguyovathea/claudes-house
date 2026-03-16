import { useState, useCallback } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { TRACK_COLORS, DOMAIN_NAMES, ALL_DOMAINS, type CMMCDomain, type ExamTrack } from '@/types'
import { useTrack } from '@/lib/TrackContext'
import { getDomainScores, getOverallStats } from '@/lib/db'

function domainColor(score: number, hasData: boolean) {
  if (!hasData) return '#2A3040'
  if (score >= 75) return '#5CC89C'
  if (score >= 55) return '#F4C842'
  return '#FF6B6B'
}

function ReadinessRing({ percent, daysToExam }: { percent: number; daysToExam: number | null }) {
  const ringColor = percent >= 70 ? '#5CC89C' : percent >= 50 ? '#F4C842' : '#4ECDC4'
  return (
    <View style={styles.ringContainer}>
      <View style={[styles.ring, { borderColor: ringColor }]}>
        <Text style={[styles.ringPercent, { color: ringColor }]}>{percent}%</Text>
        <Text style={styles.ringLabel}>Readiness</Text>
      </View>
      <View style={styles.ringMeta}>
        <Text style={styles.ringMetaLabel}>Days to exam</Text>
        <Text style={styles.ringMetaValue}>{daysToExam ?? '—'}</Text>
      </View>
    </View>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillValue}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  )
}

function QuickAction({ label, icon, color, onPress }: { label: string; icon: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <Text style={[styles.quickActionIcon, { color }]}>{icon}</Text>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const router = useRouter()
  const { activeTrack, examDate } = useTrack()
  const trackColor = TRACK_COLORS[activeTrack]

  const [domainScores, setDomainScores] = useState<Record<string, { answered: number; correct: number; scorePercent: number }>>({})
  const [stats, setStats] = useState({ totalAnswered: 0, totalCorrect: 0, scorePercent: 0, totalSessions: 0 })

  const load = useCallback(async () => {
    const [scores, st] = await Promise.all([
      getDomainScores(activeTrack),
      getOverallStats(activeTrack),
    ])
    setDomainScores(scores)
    setStats(st)
  }, [activeTrack])

  useFocusEffect(useCallback(() => { void load() }, [load]))

  const daysToExam = examDate
    ? Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  // Derive weakest domain for the recommendation
  const domainsWithData = ALL_DOMAINS.filter(d => (domainScores[d]?.answered ?? 0) >= 3)
  const weakestDomain = [...domainsWithData].sort(
    (a, b) => (domainScores[a]?.scorePercent ?? 100) - (domainScores[b]?.scorePercent ?? 100)
  )[0] as CMMCDomain | undefined

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>CMMC APEX</Text>
            <Text style={styles.greeting}>Ready to study?</Text>
          </View>
          <TouchableOpacity
            style={[styles.trackBadge, { borderColor: trackColor }]}
            onPress={() => router.push('/settings')}
          >
            <Text style={[styles.trackBadgeText, { color: trackColor }]}>{activeTrack}</Text>
          </TouchableOpacity>
        </View>

        {/* Readiness ring */}
        <View style={styles.card}>
          <ReadinessRing percent={stats.scorePercent} daysToExam={daysToExam} />
          <View style={styles.pillRow}>
            <StatPill label="Questions" value={stats.totalAnswered > 0 ? `${stats.totalAnswered}` : '—'} />
            <StatPill label="Sessions" value={stats.totalSessions > 0 ? `${stats.totalSessions}` : '—'} />
            <StatPill label="Avg Score" value={stats.totalAnswered > 0 ? `${stats.scorePercent}%` : '—'} />
          </View>
        </View>

        {/* Smart recommendation */}
        {weakestDomain ? (
          <View style={styles.recommendation}>
            <Text style={styles.recommendationIcon}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.recommendationTitle}>
                Focus today: {DOMAIN_NAMES[weakestDomain]} ({weakestDomain})
              </Text>
              <Text style={styles.recommendationBody}>
                Your {weakestDomain} score is {domainScores[weakestDomain]?.scorePercent ?? 0}% — your lowest domain. 15 minutes here moves your readiness the most.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.recommendation}>
            <Text style={styles.recommendationIcon}>🎯</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.recommendationTitle}>Start with a Quick 10</Text>
              <Text style={styles.recommendationBody}>
                Complete your first session to unlock personalized recommendations based on your performance.
              </Text>
            </View>
          </View>
        )}

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.quickGrid}>
          <QuickAction label="Quick 10" icon="⚡" color="#4ECDC4" onPress={() => router.push({ pathname: '/session', params: { mode: 'quick10', level: 'L2' } })} />
          <QuickAction label="Due Cards" icon="◈" color="#8B7FE8" onPress={() => router.push('/(tabs)/flashcards')} />
          <QuickAction label="Weak Domain" icon="⬆" color="#FF6B6B" onPress={() => router.push({ pathname: '/session', params: { mode: 'weakDomain', level: 'L2' } })} />
          <QuickAction label="Mock Exam" icon="◎" color="#F4C842" onPress={() => router.push({ pathname: '/session', params: { mode: 'mockExam', level: 'L2' } })} />
        </View>

        {/* Domain heatmap */}
        <Text style={styles.sectionTitle}>Domain Heatmap</Text>
        <View style={styles.card}>
          {ALL_DOMAINS.map((domain) => {
            const entry = domainScores[domain]
            const hasData = (entry?.answered ?? 0) > 0
            const score = entry?.scorePercent ?? 0
            const color = domainColor(score, hasData)
            return (
              <View key={domain} style={styles.domainRow}>
                <Text style={styles.domainCode}>{domain}</Text>
                <Text style={styles.domainName} numberOfLines={1}>{DOMAIN_NAMES[domain]}</Text>
                <View style={styles.domainBarTrack}>
                  {hasData && <View style={[styles.domainBar, { width: `${score}%`, backgroundColor: color }]} />}
                </View>
                <Text style={[styles.domainScore, { color: hasData ? color : '#8A909E' }]}>
                  {hasData ? `${score}%` : '—'}
                </Text>
              </View>
            )
          })}
          <View style={styles.heatmapLegend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#5CC89C' }]} /><Text style={styles.legendText}>≥75%</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#F4C842' }]} /><Text style={styles.legendText}>55–74%</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} /><Text style={styles.legendText}>&lt;55%</Text></View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0F14' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  eyebrow: { fontSize: 11, fontFamily: 'DMSans_500Medium', color: '#8A909E', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 },
  greeting: { fontSize: 22, fontFamily: 'DMSerifDisplay_400Regular', color: '#E8EAF0' },
  trackBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  trackBadgeText: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', letterSpacing: 0.5 },
  card: { backgroundColor: '#151920', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  ringContainer: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 16 },
  ring: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  ringPercent: { fontSize: 18, fontFamily: 'DMSans_600SemiBold' },
  ringLabel: { fontSize: 10, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  ringMeta: { gap: 2 },
  ringMetaLabel: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  ringMetaValue: { fontSize: 28, fontFamily: 'DMSerifDisplay_400Regular', color: '#E8EAF0' },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: { flex: 1, backgroundColor: '#1D2330', borderRadius: 10, padding: 10, alignItems: 'center' },
  pillValue: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0' },
  pillLabel: { fontSize: 10, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginTop: 2 },
  recommendation: { flexDirection: 'row', gap: 12, backgroundColor: 'rgba(244,200,66,0.08)', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(244,200,66,0.2)' },
  recommendationIcon: { fontSize: 20 },
  recommendationTitle: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: '#F4C842', marginBottom: 4 },
  recommendationBody: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#8A909E', lineHeight: 18 },
  sectionTitle: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: '#8A909E', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  quickAction: { width: '47.5%', backgroundColor: '#151920', borderRadius: 12, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  quickActionIcon: { fontSize: 24 },
  quickActionLabel: { fontSize: 13, fontFamily: 'DMSans_500Medium', color: '#E8EAF0' },
  domainRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  domainCode: { width: 28, fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#8A909E' },
  domainName: { flex: 1, fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#E8EAF0' },
  domainBarTrack: { width: 80, height: 6, backgroundColor: '#1D2330', borderRadius: 3, overflow: 'hidden' },
  domainBar: { height: '100%', borderRadius: 3 },
  domainScore: { width: 32, fontSize: 11, fontFamily: 'DMSans_600SemiBold', textAlign: 'right' },
  heatmapLegend: { flexDirection: 'row', gap: 12, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
})
