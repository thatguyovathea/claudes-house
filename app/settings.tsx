import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { TRACK_COLORS, PASSING_THRESHOLDS, type ExamTrack } from '@/types'
import { useTrack } from '@/lib/TrackContext'
import { useAuth } from '@/lib/AuthContext'

const TRACKS: { id: ExamTrack; name: string; desc: string }[] = [
  { id: 'RP',  name: 'Registered Practitioner',  desc: 'Entry level · FAR 52.204-21 + CMMC framework' },
  { id: 'CCP', name: 'Certified CMMC Professional', desc: 'Practitioner level · All 110 NIST SP 800-171 practices' },
  { id: 'CCA', name: 'Certified CMMC Assessor',   desc: 'Assessor level · L1/L2/L3 + assessment methodology' },
]

export default function SettingsScreen() {
  const router = useRouter()
  const { activeTrack, setActiveTrack, examDate, setExamDate } = useTrack()
  const { user, signOut } = useAuth()

  const [selectedTrack, setSelectedTrack] = useState<ExamTrack>(activeTrack)
  const [dateInput, setDateInput] = useState(examDate ?? '')

  function previewDays(): string | null {
    if (!dateInput.trim()) return null
    const d = new Date(dateInput.trim())
    const days = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (isNaN(days)) return null
    if (days < 0) return 'Date is in the past'
    return `${days} day${days !== 1 ? 's' : ''} away`
  }

  async function save() {
    const parsedDate = dateInput.trim() || null
    setActiveTrack(selectedTrack)
    setExamDate(parsedDate)
    router.back()
  }

  const hasChanges = selectedTrack !== activeTrack || (dateInput.trim() || null) !== examDate

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity onPress={save} disabled={!hasChanges} hitSlop={12}>
          <Text style={[styles.save, !hasChanges && styles.saveDisabled]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Track */}
        <Text style={styles.sectionLabel}>Exam Track</Text>
        <Text style={styles.sectionNote}>Progress is tracked independently per credential.</Text>
        {TRACKS.map((t) => {
          const color = TRACK_COLORS[t.id]
          const isSelected = selectedTrack === t.id
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.trackCard, isSelected && { borderColor: color, backgroundColor: `${color}10` }]}
              onPress={() => setSelectedTrack(t.id)}
              activeOpacity={0.8}
            >
              <View style={styles.trackRow}>
                <View style={[styles.trackBadge, { borderColor: color }]}>
                  <Text style={[styles.trackBadgeText, { color }]}>{t.id}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.trackName, isSelected && { color: '#E8EAF0' }]}>{t.name}</Text>
                  <Text style={styles.trackDesc}>{t.desc}</Text>
                </View>
                <Text style={styles.trackThreshold}>
                  {Math.round(PASSING_THRESHOLDS[t.id] * 100)}% pass
                </Text>
              </View>
              {isSelected && (
                <View style={[styles.activeBar, { backgroundColor: color }]} />
              )}
            </TouchableOpacity>
          )
        })}

        {/* Exam date */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>Exam Date</Text>
        <Text style={styles.sectionNote}>
          Used for the countdown on your Home screen. Enter as MM/DD/YYYY or leave blank.
        </Text>
        <View style={styles.dateCard}>
          <TextInput
            style={styles.dateInput}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#8A909E"
            value={dateInput}
            onChangeText={setDateInput}
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
            maxLength={10}
          />
          {previewDays() && (
            <Text style={styles.datePreview}>{previewDays()}</Text>
          )}
        </View>
        {dateInput.trim() !== '' && (
          <TouchableOpacity onPress={() => setDateInput('')} style={styles.clearDate}>
            <Text style={styles.clearDateText}>Clear exam date</Text>
          </TouchableOpacity>
        )}

        {/* Account */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>Account</Text>
        {user ? (
          <>
            <View style={styles.accountCard}>
              <Text style={styles.accountEmail}>{user.email}</Text>
              <Text style={styles.accountNote}>Progress syncs automatically while signed in.</Text>
            </View>
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={async () => { await signOut(); router.back() }}
            >
              <Text style={styles.signOutBtnText}>Sign out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sectionNote}>
              Sign in to back up your progress and sync across devices. The app works fully without an account.
            </Text>
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => router.push('/(auth)/signin')}
            >
              <Text style={styles.signInBtnText}>Sign in / Create account →</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0F14' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  cancel: { fontSize: 15, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  title: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0' },
  save: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4' },
  saveDisabled: { color: '#2A3040' },
  content: { padding: 20, paddingBottom: 48 },
  sectionLabel: { fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#8A909E', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  sectionNote: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginBottom: 14, lineHeight: 18 },
  trackCard: { backgroundColor: '#151920', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trackBadge: { borderWidth: 1.5, borderRadius: 7, paddingHorizontal: 9, paddingVertical: 3 },
  trackBadgeText: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', letterSpacing: 0.4 },
  trackName: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#8A909E', marginBottom: 2 },
  trackDesc: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  trackThreshold: { fontSize: 11, fontFamily: 'DMSans_500Medium', color: '#8A909E' },
  activeBar: { height: 2, marginTop: 10, borderRadius: 1 },
  dateCard: { backgroundColor: '#151920', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  dateInput: { fontSize: 20, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', borderBottomWidth: 1, borderBottomColor: '#4ECDC4', paddingBottom: 8 },
  datePreview: { fontSize: 13, fontFamily: 'DMSans_500Medium', color: '#4ECDC4', marginTop: 10 },
  clearDate: { paddingTop: 10 },
  clearDateText: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#FF6B6B' },
  accountCard: { backgroundColor: '#151920', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginBottom: 10 },
  accountEmail: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0', marginBottom: 4 },
  accountNote: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
  signOutBtn: { paddingVertical: 8 },
  signOutBtnText: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#FF6B6B' },
  signInBtn: { backgroundColor: 'rgba(78,205,196,0.1)', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(78,205,196,0.3)' },
  signInBtnText: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4' },
})
