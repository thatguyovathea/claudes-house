import { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DOMAIN_NAMES, ALL_DOMAINS, type CMMCDomain } from '@/types'
import { getDueCards, getDueCountByDomain, getTotalCountByDomain, rateCard } from '@/lib/flashcardStore'
import { previewInterval } from '@/lib/sm2'
import type { Flashcard } from '@/lib/flashcardData'
import type { CardSchedule, Rating } from '@/lib/sm2'

type StudyCard = Flashcard & { schedule: CardSchedule }
type CardState = 'front' | 'revealed'

function FlashcardView({
  card,
  index,
  total,
  onRate,
}: {
  card: StudyCard
  index: number
  total: number
  onRate: (r: Rating) => void
}) {
  const [state, setState] = useState<CardState>('front')

  // Reset to front when card changes
  useEffect(() => { setState('front') }, [card.id])

  const domainLabel = card.domain === 'CMMC'
    ? 'CMMC Framework'
    : `${card.domain} · ${DOMAIN_NAMES[card.domain as CMMCDomain]}`

  return (
    <View style={styles.cardArea}>
      <View style={styles.cardMeta}>
        <Text style={styles.cardDomain}>{domainLabel}</Text>
        <Text style={styles.cardType}>{card.cardType.toUpperCase()}</Text>
      </View>

      <TouchableOpacity
        style={styles.flashcard}
        onPress={() => state === 'front' && setState('revealed')}
        activeOpacity={0.9}
      >
        {state === 'front' ? (
          <>
            <Text style={styles.cardFront}>{card.front}</Text>
            {card.level && (
              <View style={styles.levelPill}>
                <Text style={styles.levelPillText}>{card.level}</Text>
              </View>
            )}
            <Text style={styles.cardHint}>Tap to reveal</Text>
          </>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.cardBack}>{card.back}</Text>
          </ScrollView>
        )}
      </TouchableOpacity>

      {state === 'revealed' && (
        <View style={styles.ratingRow}>
          {(['again', 'hard', 'good'] as Rating[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.ratingBtn, styles[`rating_${r}` as keyof typeof styles] as object]}
              onPress={() => onRate(r)}
            >
              <Text style={styles.ratingBtnText}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
              <Text style={styles.ratingInterval}>{previewInterval(card.schedule, r)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.cardCounter}>{index + 1} / {total}</Text>
    </View>
  )
}

function DoneScreen({ total, onBack }: { total: number; onBack: () => void }) {
  return (
    <View style={styles.doneContainer}>
      <Text style={styles.doneIcon}>✓</Text>
      <Text style={styles.doneTitle}>Session complete</Text>
      <Text style={styles.doneSubtitle}>
        {total} card{total !== 1 ? 's' : ''} reviewed. SM-2 has scheduled your next reviews automatically.
      </Text>
      <TouchableOpacity style={styles.doneBtn} onPress={onBack}>
        <Text style={styles.doneBtnText}>Back to Decks</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function FlashcardsScreen() {
  const [loading, setLoading] = useState(true)
  const [studyMode, setStudyMode] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [queue, setQueue] = useState<StudyCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dueByDomain, setDueByDomain] = useState<Record<string, number>>({})
  const totalByDomain = getTotalCountByDomain()

  const loadDue = useCallback(async () => {
    setLoading(true)
    try {
      const [due, counts] = await Promise.all([getDueCards(), getDueCountByDomain()])
      setQueue(due)
      setDueByDomain(counts)
    } finally {
      setLoading(false)
    }
  }, [])

  // Reload deck counts without showing the full-screen spinner (used after study session)
  const refreshCounts = useCallback(async () => {
    const [due, counts] = await Promise.all([getDueCards(), getDueCountByDomain()])
    setQueue(due)
    setDueByDomain(counts)
  }, [])

  useEffect(() => { loadDue() }, [loadDue])

  const totalDue = queue.length

  async function handleRate(rating: Rating) {
    const card = queue[currentIndex]
    try {
      await rateCard(card.id, rating)
    } catch {
      // storage failure is non-fatal — still advance the card
    }
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex(i => i + 1)
    } else {
      // Session finished — show done screen first, then refresh counts in background
      setSessionDone(true)
      void refreshCounts()
    }
  }

  function startStudy() {
    setCurrentIndex(0)
    setSessionCount(queue.length)
    setSessionDone(false)
    setStudyMode(true)
  }

  function exitStudy() {
    setStudyMode(false)
    setSessionDone(false)
    setCurrentIndex(0)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#4ECDC4" />
        </View>
      </SafeAreaView>
    )
  }

  if (studyMode) {
    if (sessionDone) {
      return (
        <SafeAreaView style={styles.safe}>
          <DoneScreen total={sessionCount} onBack={exitStudy} />
        </SafeAreaView>
      )
    }
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.studyHeader}>
          <TouchableOpacity onPress={exitStudy}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.studyProgress}>{currentIndex} / {queue.length} done</Text>
        </View>
        <FlashcardView
          card={queue[currentIndex]}
          index={currentIndex}
          total={queue.length}
          onRate={handleRate}
        />
      </SafeAreaView>
    )
  }

  // Deck list view
  const domainsWithCards = ALL_DOMAINS.filter(d => (totalByDomain[d] ?? 0) > 0)

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.heading}>Flashcards</Text>

        {totalDue > 0 ? (
          <TouchableOpacity style={styles.dueCard} onPress={startStudy}>
            <View>
              <Text style={styles.dueCount}>{totalDue} card{totalDue !== 1 ? 's' : ''} due today</Text>
              <Text style={styles.dueSubtext}>Spaced repetition · SM-2 algorithm</Text>
            </View>
            <Text style={styles.dueArrow}>→</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.allDoneCard}>
            <Text style={styles.allDoneText}>All caught up — no cards due right now.</Text>
            <Text style={styles.allDoneSubtext}>SM-2 will surface the next batch when they're ready.</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Decks by Domain</Text>
        {domainsWithCards.map((domain) => {
          const due = dueByDomain[domain] ?? 0
          const total = totalByDomain[domain] ?? 0
          return (
            <View key={domain} style={styles.deckRow}>
              <View style={styles.deckLeft}>
                <Text style={styles.deckCode}>{domain}</Text>
                <View>
                  <Text style={styles.deckName}>{DOMAIN_NAMES[domain]}</Text>
                  <Text style={styles.deckCount}>{total} card{total !== 1 ? 's' : ''}</Text>
                </View>
              </View>
              {due > 0 ? (
                <View style={styles.dueBadge}>
                  <Text style={styles.dueBadgeText}>{due} due</Text>
                </View>
              ) : (
                <Text style={styles.upToDate}>✓</Text>
              )}
            </View>
          )
        })}

        {/* CMMC general cards */}
        {(totalByDomain['CMMC'] ?? 0) > 0 && (
          <View style={styles.deckRow}>
            <View style={styles.deckLeft}>
              <Text style={styles.deckCode}>—</Text>
              <View>
                <Text style={styles.deckName}>CMMC Framework</Text>
                <Text style={styles.deckCount}>{totalByDomain['CMMC']} cards</Text>
              </View>
            </View>
            {(dueByDomain['CMMC'] ?? 0) > 0 ? (
              <View style={styles.dueBadge}>
                <Text style={styles.dueBadgeText}>{dueByDomain['CMMC']} due</Text>
              </View>
            ) : (
              <Text style={styles.upToDate}>✓</Text>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0F14' },
  content: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 26, fontFamily: 'DMSerifDisplay_400Regular', color: '#E8EAF0', paddingTop: 20, marginBottom: 16 },
  dueCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(78,205,196,0.1)', borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1.5, borderColor: '#4ECDC4' },
  dueCount: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4', marginBottom: 2 },
  dueSubtext: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  dueArrow: { fontSize: 20, color: '#4ECDC4' },
  allDoneCard: { backgroundColor: 'rgba(92,200,156,0.08)', borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(92,200,156,0.3)' },
  allDoneText: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#5CC89C', marginBottom: 4 },
  allDoneSubtext: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  sectionLabel: { fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#8A909E', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  deckRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#151920', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  deckLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deckCode: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4', width: 28 },
  deckName: { fontSize: 14, fontFamily: 'DMSans_500Medium', color: '#E8EAF0', marginBottom: 2 },
  deckCount: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  dueBadge: { backgroundColor: 'rgba(78,205,196,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  dueBadgeText: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4' },
  upToDate: { fontSize: 14, color: '#5CC89C' },
  // Study mode
  studyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 20 },
  backBtn: { fontSize: 14, fontFamily: 'DMSans_500Medium', color: '#4ECDC4' },
  studyProgress: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  cardArea: { flex: 1, padding: 16 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardDomain: { fontSize: 12, fontFamily: 'DMSans_500Medium', color: '#8A909E' },
  cardType: { fontSize: 10, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4', letterSpacing: 1 },
  flashcard: { flex: 1, backgroundColor: '#151920', borderRadius: 16, padding: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  cardFront: { fontSize: 28, fontFamily: 'DMSerifDisplay_400Regular', color: '#4ECDC4', textAlign: 'center', marginBottom: 12 },
  levelPill: { backgroundColor: 'rgba(78,205,196,0.1)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 12 },
  levelPillText: { fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4' },
  cardHint: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  cardBack: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', lineHeight: 22 },
  ratingRow: { flexDirection: 'row', gap: 8, paddingVertical: 16 },
  ratingBtn: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  rating_again: { backgroundColor: 'rgba(255,107,107,0.15)', borderWidth: 1, borderColor: '#FF6B6B' },
  rating_hard: { backgroundColor: 'rgba(244,200,66,0.1)', borderWidth: 1, borderColor: '#F4C842' },
  rating_good: { backgroundColor: 'rgba(92,200,156,0.1)', borderWidth: 1, borderColor: '#5CC89C' },
  ratingBtnText: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0' },
  ratingInterval: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginTop: 2 },
  cardCounter: { textAlign: 'center', fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E', paddingBottom: 8 },
  // Done screen
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneIcon: { fontSize: 48, color: '#5CC89C', marginBottom: 16 },
  doneTitle: { fontSize: 22, fontFamily: 'DMSerifDisplay_400Regular', color: '#E8EAF0', marginBottom: 8 },
  doneSubtitle: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#8A909E', textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  doneBtn: { backgroundColor: '#4ECDC4', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  doneBtnText: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: '#0C0F14' },
})
