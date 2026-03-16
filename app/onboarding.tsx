import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { TRACK_COLORS, TRACK_LABELS, PASSING_THRESHOLDS, type ExamTrack } from '@/types'
import { completeOnboarding } from '@/lib/storage'
import { useTrack } from '@/lib/TrackContext'

const TRACK_DESCRIPTIONS: Record<ExamTrack, string> = {
  RP: 'Entry-level CMMC credential. Covers the framework, CUI basics, and the Cyber AB ecosystem. Best if you\'re new to CMMC.',
  CCP: 'Practitioner-level. Tests all 110 NIST SP 800-171 practices across all 14 domains. Best if you support CMMC compliance work.',
  CCA: 'Assessor-level. Tests full assessment methodology, evidence collection, C3PAO operations, and adjudication. Highest bar at 75% passing.',
}

const LEVEL_COVERAGE: Record<ExamTrack, string> = {
  RP: 'L1 + L2 awareness',
  CCP: 'L1 + L2 full + L3 awareness',
  CCA: 'L1 + L2 + L3 full',
}

type Step = 'track' | 'date'

export default function OnboardingScreen() {
  const router = useRouter()
  const { setActiveTrack, setExamDate: setContextExamDate } = useTrack()
  const [step, setStep] = useState<Step>('track')
  const [selectedTrack, setSelectedTrack] = useState<ExamTrack | null>(null)
  const [examDate, setExamDate] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleFinish() {
    if (!selectedTrack || loading) return
    setLoading(true)
    try {
      const parsedDate = examDate.trim() ? examDate.trim() : null
      await completeOnboarding(selectedTrack, parsedDate)
      // Sync into context so all screens reflect the choice immediately
      setActiveTrack(selectedTrack)
      setContextExamDate(parsedDate)
      router.replace('/(tabs)')
    } catch {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress dots */}
      <View style={styles.progressRow}>
        <View style={[styles.dot, step === 'track' && styles.dotActive]} />
        <View style={[styles.dot, step === 'date' && styles.dotActive]} />
      </View>

      {step === 'track' ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>CMMC APEX</Text>
          <Text style={styles.heading}>Which exam are{'\n'}you preparing for?</Text>
          <Text style={styles.subheading}>You can switch tracks at any time. Progress is tracked separately per credential.</Text>

          {(['RP', 'CCP', 'CCA'] as ExamTrack[]).map((track) => {
            const color = TRACK_COLORS[track]
            const selected = selectedTrack === track
            return (
              <TouchableOpacity
                key={track}
                style={[styles.trackCard, selected && { borderColor: color, backgroundColor: `${color}10` }]}
                onPress={() => setSelectedTrack(track)}
                activeOpacity={0.85}
              >
                <View style={styles.trackCardTop}>
                  <View style={[styles.trackBadge, { backgroundColor: `${color}20`, borderColor: color }]}>
                    <Text style={[styles.trackBadgeText, { color }]}>{track}</Text>
                  </View>
                  <Text style={styles.trackPassThreshold}>
                    Passing: {Math.round(PASSING_THRESHOLDS[track] * 100)}%
                  </Text>
                  {selected && <Text style={[styles.selectedCheck, { color }]}>✓</Text>}
                </View>

                <Text style={styles.trackFullName}>{TRACK_LABELS[track]}</Text>
                <Text style={styles.trackDesc}>{TRACK_DESCRIPTIONS[track]}</Text>

                <View style={styles.trackMeta}>
                  <View style={styles.trackMetaItem}>
                    <Text style={styles.trackMetaLabel}>Levels</Text>
                    <Text style={[styles.trackMetaVal, { color }]}>{LEVEL_COVERAGE[track]}</Text>
                  </View>
                  <View style={styles.trackMetaItem}>
                    <Text style={styles.trackMetaLabel}>Domains</Text>
                    <Text style={[styles.trackMetaVal, { color }]}>14 NIST</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}

          <TouchableOpacity
            style={[styles.nextBtn, !selectedTrack && styles.nextBtnDisabled]}
            disabled={!selectedTrack}
            onPress={() => setStep('date')}
          >
            <Text style={[styles.nextBtnText, !selectedTrack && { color: '#8A909E' }]}>
              Continue →
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setStep('track')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>When is your{'\n'}exam date?</Text>
          <Text style={styles.subheading}>
            Setting a date lets the app calculate your readiness trajectory and build a realistic study schedule.
          </Text>

          <View style={styles.dateCard}>
            <Text style={styles.dateLabel}>Target exam date</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#8A909E"
              value={examDate}
              onChangeText={setExamDate}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
              maxLength={10}
            />
            <Text style={styles.dateHint}>
              Optional — you can set or update this later from Settings (tap your track badge on the Home screen).
            </Text>
          </View>

          {examDate.trim() !== '' && (
            <View style={styles.countdownPreview}>
              <Text style={styles.countdownLabel}>Study time available</Text>
              <Text style={styles.countdownValue}>
                {(() => {
                  const d = new Date(examDate)
                  const today = new Date()
                  const days = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  return isNaN(days) || days < 0 ? 'Invalid date' : `${days} days`
                })()}
              </Text>
            </View>
          )}

          <View style={styles.selectedSummary}>
            <Text style={styles.selectedSummaryLabel}>Your track</Text>
            <View style={[styles.selectedTrackBadge, { borderColor: TRACK_COLORS[selectedTrack!] }]}>
              <Text style={[styles.selectedTrackText, { color: TRACK_COLORS[selectedTrack!] }]}>
                {selectedTrack} — {TRACK_LABELS[selectedTrack!]}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
            disabled={loading}
            onPress={handleFinish}
          >
            <Text style={styles.nextBtnText}>
              {loading ? 'Setting up...' : "Let's go →"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} disabled={loading} onPress={handleFinish}>
            <Text style={styles.skipBtnText}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0F14' },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 16, paddingBottom: 8 },
  dot: { width: 28, height: 4, borderRadius: 2, backgroundColor: '#1D2330' },
  dotActive: { backgroundColor: '#4ECDC4' },
  content: { padding: 20, paddingBottom: 48 },
  eyebrow: { fontSize: 11, fontFamily: 'DMSans_500Medium', color: '#4ECDC4', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, marginTop: 8 },
  heading: { fontSize: 32, fontFamily: 'DMSerifDisplay_400Regular', color: '#E8EAF0', lineHeight: 40, marginBottom: 10 },
  subheading: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#8A909E', lineHeight: 20, marginBottom: 28 },
  trackCard: { backgroundColor: '#151920', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.07)' },
  trackCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  trackBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  trackBadgeText: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', letterSpacing: 0.5 },
  trackPassThreshold: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  selectedCheck: { marginLeft: 'auto', fontSize: 18, fontFamily: 'DMSans_600SemiBold' },
  trackFullName: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0', marginBottom: 6 },
  trackDesc: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#8A909E', lineHeight: 19, marginBottom: 12 },
  trackMeta: { flexDirection: 'row', gap: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  trackMetaItem: { gap: 2 },
  trackMetaLabel: { fontSize: 10, fontFamily: 'DMSans_400Regular', color: '#8A909E', textTransform: 'uppercase', letterSpacing: 0.8 },
  trackMetaVal: { fontSize: 13, fontFamily: 'DMSans_600SemiBold' },
  nextBtn: { backgroundColor: '#4ECDC4', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 },
  nextBtnDisabled: { backgroundColor: '#1D2330' },
  nextBtnText: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: '#0C0F14' },
  backBtn: { marginBottom: 20 },
  backBtnText: { fontSize: 14, fontFamily: 'DMSans_500Medium', color: '#4ECDC4' },
  dateCard: { backgroundColor: '#151920', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  dateLabel: { fontSize: 12, fontFamily: 'DMSans_500Medium', color: '#8A909E', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  dateInput: { fontSize: 22, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', borderBottomWidth: 1, borderBottomColor: '#4ECDC4', paddingBottom: 8, marginBottom: 10 },
  dateHint: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E', fontStyle: 'italic' },
  countdownPreview: { backgroundColor: 'rgba(78,205,196,0.08)', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(78,205,196,0.2)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countdownLabel: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  countdownValue: { fontSize: 20, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4' },
  selectedSummary: { marginBottom: 20 },
  selectedSummaryLabel: { fontSize: 11, fontFamily: 'DMSans_500Medium', color: '#8A909E', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  selectedTrackBadge: { borderRadius: 10, borderWidth: 1.5, padding: 12 },
  selectedTrackText: { fontSize: 14, fontFamily: 'DMSans_600SemiBold' },
  skipBtn: { alignItems: 'center', paddingTop: 16 },
  skipBtnText: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
})
