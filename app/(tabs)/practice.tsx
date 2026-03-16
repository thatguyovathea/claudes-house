import { useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { DOMAIN_NAMES, ALL_DOMAINS, TRACK_LEVELS, type CMMCDomain, type CMMCLevel, type StudyMode } from '@/types'
import { useTrack } from '@/lib/TrackContext'
import { usePremium } from '@/lib/PremiumContext'

type ModeCard = { mode: StudyMode; title: string; desc: string; icon: string; color: string; levelRequired?: CMMCLevel }

const MODES: ModeCard[] = [
  { mode: 'quick10', title: 'Quick 10', desc: 'Adaptive mix, ~10 min', icon: '⚡', color: '#4ECDC4' },
  { mode: 'weakDomain', title: 'Weak Domain Focus', desc: 'Targets your lowest-scoring domain', icon: '⬆', color: '#FF6B6B' },
  { mode: 'domainDrill', title: 'Domain Drill', desc: 'Pick one domain, go deep', icon: '◎', color: '#8B7FE8' },
  { mode: 'mockExam', title: 'Mock Exam', desc: 'Full timed exam, CAT-style', icon: '◈', color: '#F4C842' },
  { mode: 'missedReview', title: 'Missed Questions', desc: 'Revisit questions you got wrong', icon: '↺', color: '#5CC89C' },
]

export default function PracticeScreen() {
  const router = useRouter()
  const { activeTrack } = useTrack()
  const { isModeAllowed } = usePremium()
  const [selectedMode, setSelectedMode] = useState<StudyMode | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<CMMCLevel | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<CMMCDomain | null>(null)

  const availableLevels = TRACK_LEVELS[activeTrack]
  const needsDomain = selectedMode === 'domainDrill'
  const needsLevel = selectedMode !== 'missedReview'

  function canStart() {
    if (!selectedMode) return false
    if (needsLevel && !selectedLevel) return false
    if (needsDomain && !selectedDomain) return false
    return true
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.heading}>Practice</Text>
        <Text style={styles.subheading}>Choose a mode, level, and start studying.</Text>

        {/* Study mode */}
        <Text style={styles.sectionLabel}>Study Mode</Text>
        {MODES.map((m) => {
          const allowed = isModeAllowed(m.mode)
          return (
            <TouchableOpacity
              key={m.mode}
              style={[
                styles.modeCard,
                !allowed && styles.modeCardLocked,
                selectedMode === m.mode && { borderColor: m.color, borderWidth: 1.5 },
              ]}
              onPress={() => {
                if (!allowed) { router.push('/paywall'); return }
                setSelectedMode(m.mode)
              }}
            >
              <Text style={[styles.modeIcon, { color: allowed ? m.color : '#3A4150' }]}>{m.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modeTitle, !allowed && styles.modeTitleLocked]}>{m.title}</Text>
                <Text style={styles.modeDesc}>{m.desc}</Text>
              </View>
              {!allowed && <Text style={styles.lockIcon}>🔒</Text>}
              {allowed && selectedMode === m.mode && <Text style={[styles.checkmark, { color: m.color }]}>✓</Text>}
            </TouchableOpacity>
          )
        })}

        {/* Level selector — never mix levels; hidden for missedReview */}
        {needsLevel && (
          <>
            <Text style={styles.sectionLabel}>CMMC Level</Text>
            <Text style={styles.levelNote}>Sessions stay within one level. Levels are never mixed.</Text>
            <View style={styles.levelRow}>
              {availableLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.levelChip, selectedLevel === level && styles.levelChipActive]}
                  onPress={() => setSelectedLevel(level)}
                >
                  <Text style={[styles.levelChipText, selectedLevel === level && styles.levelChipTextActive]}>
                    {level}
                  </Text>
                  <Text style={[styles.levelChipSub, selectedLevel === level && { color: '#4ECDC4' }]}>
                    {level === 'L1' ? '17 practices' : level === 'L2' ? '110 practices' : '24 practices'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Domain selector (only for Domain Drill) */}
        {needsDomain && (
          <>
            <Text style={styles.sectionLabel}>Select Domain</Text>
            <View style={styles.domainGrid}>
              {ALL_DOMAINS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.domainChip, selectedDomain === d && styles.domainChipActive]}
                  onPress={() => setSelectedDomain(d)}
                >
                  <Text style={[styles.domainChipCode, selectedDomain === d && { color: '#4ECDC4' }]}>{d}</Text>
                  <Text style={styles.domainChipName} numberOfLines={2}>{DOMAIN_NAMES[d]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Start button */}
        <TouchableOpacity
          style={[styles.startBtn, !canStart() && styles.startBtnDisabled]}
          disabled={!canStart()}
          onPress={() => {
            router.push({
              pathname: '/session',
              params: {
                mode: selectedMode!,
                // missedReview doesn't use level — omit when null to avoid "null" string param
                ...(selectedLevel ? { level: selectedLevel } : {}),
                ...(selectedDomain ? { domain: selectedDomain } : {}),
              },
            })
          }}
        >
          <Text style={[styles.startBtnText, !canStart() && { color: '#8A909E' }]}>
            Start Session
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0F14' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 26, fontFamily: 'DMSerifDisplay_400Regular', color: '#E8EAF0', paddingTop: 20, marginBottom: 4 },
  subheading: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#8A909E', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 20 },
  modeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#151920', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  modeCardLocked: { opacity: 0.55 },
  modeIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  modeTitle: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0', marginBottom: 2 },
  modeTitleLocked: { color: '#8A909E' },
  modeDesc: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  checkmark: { fontSize: 16, fontFamily: 'DMSans_600SemiBold' },
  lockIcon: { fontSize: 14 },
  levelNote: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginBottom: 10, fontStyle: 'italic' },
  levelRow: { flexDirection: 'row', gap: 8 },
  levelChip: { flex: 1, backgroundColor: '#151920', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  levelChipActive: { borderColor: '#4ECDC4', backgroundColor: 'rgba(78,205,196,0.08)' },
  levelChipText: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: '#8A909E', marginBottom: 2 },
  levelChipTextActive: { color: '#4ECDC4' },
  levelChipSub: { fontSize: 10, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  domainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  domainChip: { width: '47.5%', backgroundColor: '#151920', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  domainChipActive: { borderColor: '#4ECDC4', backgroundColor: 'rgba(78,205,196,0.08)' },
  domainChipCode: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#8A909E', marginBottom: 2 },
  domainChipName: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  startBtn: { backgroundColor: '#4ECDC4', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 28 },
  startBtnDisabled: { backgroundColor: '#1D2330' },
  startBtnText: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: '#0C0F14' },
  comingSoonBox: { backgroundColor: 'rgba(78,205,196,0.06)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(78,205,196,0.2)', padding: 12, marginTop: 12 },
  comingSoonText: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#8A909E', lineHeight: 19 },
})
