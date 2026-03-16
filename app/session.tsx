import { useEffect, useRef, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { CMMCDomain, CMMCLevel, ExamTrack, StudyMode } from '@/types'
import { DOMAIN_NAMES } from '@/types'
import { buildSessionAsync, computeResult, type SessionAnswer, type SessionQuestion } from '@/lib/sessionEngine'
import { useTrack } from '@/lib/TrackContext'
import { saveSession, getOverallStats } from '@/lib/db'
import { useAuth } from '@/lib/AuthContext'
import { syncSession } from '@/lib/sync'
import { usePremium, FREE_QUESTION_LIMIT } from '@/lib/PremiumContext'

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

type AnswerLetter = 'A' | 'B' | 'C' | 'D'
type QuestionState = 'answering' | 'revealed'

export default function SessionScreen() {
  const router = useRouter()
  const { activeTrack } = useTrack()
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const params = useLocalSearchParams<{
    mode: StudyMode
    level: CMMCLevel
    domain?: string
  }>()

  const mode = params.mode ?? 'quick10'
  const level = params.level ?? 'L2'
  const domain = (params.domain as CMMCDomain | 'mixed') ?? 'mixed'

  const [questions, setQuestions] = useState<SessionQuestion[]>([])
  const [loadingSession, setLoadingSession] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [questionState, setQuestionState] = useState<QuestionState>('answering')
  const [selectedLetter, setSelectedLetter] = useState<AnswerLetter | null>(null)
  const [answers, setAnswers] = useState<SessionAnswer[]>([])
  const [answeredAts, setAnsweredAts] = useState<number[]>([])
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [sessionStartTime] = useState(Date.now())
  const sessionId = useRef(genId())
  const [timer, setTimer] = useState(0)

  const fadeAnim = useRef(new Animated.Value(1)).current

  const isMockExam = mode === 'mockExam'
  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const progress = (currentIndex + 1) / questions.length

  // Load questions — gate on free question limit first
  useEffect(() => {
    if (!isPremium) {
      getOverallStats(activeTrack)
        .then(({ totalAnswered }) => {
          if (totalAnswered >= FREE_QUESTION_LIMIT) {
            router.replace('/paywall')
            return
          }
          buildSessionAsync({ mode, track: activeTrack, level, domain })
            .then(setQuestions)
            .catch(() => {})
            .finally(() => setLoadingSession(false))
        })
        .catch(() => setLoadingSession(false))
    } else {
      buildSessionAsync({ mode, track: activeTrack, level, domain })
        .then(setQuestions)
        .catch(() => {})
        .finally(() => setLoadingSession(false))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Timer for mock exam
  useEffect(() => {
    if (!isMockExam) return
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [isMockExam])

  function formatTimer(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function handleSelectAnswer(letter: AnswerLetter) {
    if (questionState === 'revealed') return
    setSelectedLetter(letter)
  }

  function handleSubmit() {
    if (!selectedLetter || !currentQuestion) return
    const correct = currentQuestion.options.find(o => o.letter === selectedLetter)?.isCorrect ?? false
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000)

    const now = Date.now()
    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedLetter,
      isCorrect: correct,
      domain: currentQuestion.domain,
      practiceId: currentQuestion.practiceId,
      timeSpentSeconds: timeSpent,
    }])
    setAnsweredAts(prev => [...prev, now])
    setQuestionState('revealed')
  }

  function handleNext() {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      if (isLastQuestion) {
        void finishSession()
      } else {
        setCurrentIndex(i => i + 1)
        setSelectedLetter(null)
        setQuestionState('answering')
        setQuestionStartTime(Date.now())
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start()
      }
    })
  }

  async function finishSession() {
    const now = Date.now()
    const totalTime = Math.round((now - sessionStartTime) / 1000)
    const config = { mode, track: activeTrack, level, domain }
    const result = computeResult(config, answers, totalTime)

    // Persist to SQLite, then best-effort sync to Supabase if signed in
    const sessionRow = {
      id: sessionId.current,
      track: activeTrack,
      level,
      mode,
      domain: domain === 'mixed' ? null : domain,
      started_at: sessionStartTime,
      ended_at: now,
      total_q: result.totalQuestions,
      correct: result.correctCount,
      score_pct: result.scorePercent,
      time_secs: totalTime,
    }
    const answerRows = answers.map((a, i) => ({
      id: genId(),
      question_id: a.questionId,
      practice_id: a.practiceId,
      domain: a.domain,
      selected_letter: a.selectedLetter,
      is_correct: a.isCorrect,
      time_secs: a.timeSpentSeconds,
      answered_at: answeredAts[i] ?? now,
    }))

    saveSession(sessionRow, answerRows)
      .then(() => {
        if (user) {
          void syncSession(user.id, sessionRow, answerRows)
        }
      })
      .catch(() => { /* storage failure is non-fatal */ })

    router.replace({
      pathname: '/review',
      params: { result: JSON.stringify(result) },
    })
  }

  if (loadingSession) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptySubtitle}>Building your session…</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!currentQuestion) {
    const emptyMsg = mode === 'missedReview'
      ? 'No missed questions yet — complete a few sessions first.'
      : 'No questions found for this level and track combination.'
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No questions available</Text>
          <Text style={styles.emptySubtitle}>{emptyMsg}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const correctLetter = currentQuestion.options.find(o => o.isCorrect)?.letter

  function optionStyle(letter: AnswerLetter) {
    if (questionState === 'answering') {
      return [styles.option, selectedLetter === letter && styles.optionSelected]
    }
    if (letter === correctLetter) return [styles.option, styles.optionCorrect]
    if (letter === selectedLetter && letter !== correctLetter) return [styles.option, styles.optionWrong]
    return [styles.option, styles.optionDimmed]
  }

  function optionTextStyle(letter: AnswerLetter) {
    if (questionState === 'revealed') {
      if (letter === correctLetter) return [styles.optionText, { color: '#5CC89C' }]
      if (letter === selectedLetter) return [styles.optionText, { color: '#FF6B6B' }]
      return [styles.optionText, { color: '#8A909E' }]
    }
    return [styles.optionText, selectedLetter === letter && { color: '#4ECDC4' }]
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.headerBack}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerProgress}>{currentIndex + 1} / {questions.length}</Text>
          <Text style={styles.headerMode}>{DOMAIN_NAMES[currentQuestion.domain]} · {currentQuestion.level}</Text>
        </View>
        {isMockExam
          ? <Text style={styles.headerTimer}>{formatTimer(timer)}</Text>
          : <View style={{ width: 28 }} />
        }
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Practice ID + difficulty */}
          <View style={styles.questionMeta}>
            <Text style={styles.practiceId}>{currentQuestion.practiceId}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: currentQuestion.difficulty === 3 ? 'rgba(255,107,107,0.12)' : currentQuestion.difficulty === 2 ? 'rgba(244,200,66,0.1)' : 'rgba(92,200,156,0.1)' }]}>
              <Text style={[styles.difficultyText, { color: currentQuestion.difficulty === 3 ? '#FF6B6B' : currentQuestion.difficulty === 2 ? '#F4C842' : '#5CC89C' }]}>
                {currentQuestion.difficulty === 1 ? 'Foundational' : currentQuestion.difficulty === 2 ? 'Intermediate' : 'Advanced'}
              </Text>
            </View>
          </View>

          {/* Compliance tip — shown before answer */}
          {questionState === 'answering' && (
            <View style={styles.complianceTip}>
              <Text style={styles.complianceTipLabel}>Assessor Lens</Text>
              <Text style={styles.complianceTipText}>
                Think about what an assessor would look for as evidence — not just what the practice says, but how you would verify it in the field.
              </Text>
            </View>
          )}

          {/* Question stem */}
          <Text style={styles.stem}>{currentQuestion.stem}</Text>

          {/* Options */}
          <View style={styles.options}>
            {currentQuestion.options.map(opt => (
              <TouchableOpacity
                key={opt.letter}
                style={optionStyle(opt.letter as AnswerLetter)}
                onPress={() => handleSelectAnswer(opt.letter as AnswerLetter)}
                disabled={questionState === 'revealed'}
                activeOpacity={0.8}
              >
                <View style={[styles.optionLetter, selectedLetter === opt.letter && questionState === 'answering' && styles.optionLetterSelected,
                  questionState === 'revealed' && opt.letter === correctLetter && styles.optionLetterCorrect,
                  questionState === 'revealed' && opt.letter === selectedLetter && opt.letter !== correctLetter && styles.optionLetterWrong,
                ]}>
                  <Text style={styles.optionLetterText}>{opt.letter}</Text>
                </View>
                <Text style={optionTextStyle(opt.letter as AnswerLetter)}>{opt.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit button */}
          {questionState === 'answering' && (
            <TouchableOpacity
              style={[styles.submitBtn, !selectedLetter && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!selectedLetter}
            >
              <Text style={[styles.submitBtnText, !selectedLetter && { color: '#8A909E' }]}>
                Submit Answer
              </Text>
            </TouchableOpacity>
          )}

          {/* Explanation — shown after answer */}
          {questionState === 'revealed' && (
            <>
              <View style={[styles.resultBanner, selectedLetter === correctLetter ? styles.resultBannerCorrect : styles.resultBannerWrong]}>
                <Text style={[styles.resultBannerText, { color: selectedLetter === correctLetter ? '#5CC89C' : '#FF6B6B' }]}>
                  {selectedLetter === correctLetter ? '✓ Correct' : `✗ Incorrect — Answer is ${correctLetter}`}
                </Text>
              </View>

              <View style={styles.explanationCard}>
                <Text style={styles.explanationLabel}>Explanation</Text>
                <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
                <Text style={styles.sourceRef}>{currentQuestion.sourceRef}</Text>
              </View>

              <View style={styles.mindsetCard}>
                <Text style={styles.mindsetLabel}>CMMC Mindset</Text>
                <Text style={styles.mindsetText}>{currentQuestion.mindsetNote}</Text>
              </View>

              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.nextBtnText}>
                  {isLastQuestion ? 'See Results →' : 'Next Question →'}
                </Text>
              </TouchableOpacity>
            </>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0F14' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerBack: { fontSize: 18, color: '#8A909E', width: 28 },
  headerCenter: { alignItems: 'center' },
  headerProgress: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0' },
  headerMode: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginTop: 1 },
  headerTimer: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#F4C842', width: 48, textAlign: 'right' },
  progressTrack: { height: 3, backgroundColor: '#1D2330', marginHorizontal: 16, borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#4ECDC4', borderRadius: 2 },
  content: { padding: 16, paddingBottom: 48 },
  questionMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 10 },
  practiceId: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4', letterSpacing: 0.5 },
  difficultyBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  difficultyText: { fontSize: 11, fontFamily: 'DMSans_500Medium' },
  complianceTip: { backgroundColor: 'rgba(244,200,66,0.07)', borderRadius: 10, padding: 12, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: '#F4C842' },
  complianceTipLabel: { fontSize: 10, fontFamily: 'DMSans_600SemiBold', color: '#F4C842', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  complianceTipText: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', lineHeight: 18 },
  stem: { fontSize: 16, fontFamily: 'DMSans_500Medium', color: '#E8EAF0', lineHeight: 24, marginBottom: 20 },
  options: { gap: 8, marginBottom: 20 },
  option: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#151920', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  optionSelected: { borderColor: '#4ECDC4', backgroundColor: 'rgba(78,205,196,0.06)' },
  optionCorrect: { borderColor: '#5CC89C', backgroundColor: 'rgba(92,200,156,0.08)' },
  optionWrong: { borderColor: '#FF6B6B', backgroundColor: 'rgba(255,107,107,0.08)' },
  optionDimmed: { opacity: 0.45 },
  optionLetter: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1D2330', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  optionLetterSelected: { backgroundColor: 'rgba(78,205,196,0.2)' },
  optionLetterCorrect: { backgroundColor: 'rgba(92,200,156,0.25)' },
  optionLetterWrong: { backgroundColor: 'rgba(255,107,107,0.2)' },
  optionLetterText: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0' },
  optionText: { flex: 1, fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', lineHeight: 20 },
  submitBtn: { backgroundColor: '#4ECDC4', borderRadius: 14, padding: 16, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#1D2330' },
  submitBtnText: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: '#0C0F14' },
  resultBanner: { borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 14 },
  resultBannerCorrect: { backgroundColor: 'rgba(92,200,156,0.1)', borderWidth: 1, borderColor: 'rgba(92,200,156,0.3)' },
  resultBannerWrong: { backgroundColor: 'rgba(255,107,107,0.1)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  resultBannerText: { fontSize: 15, fontFamily: 'DMSans_600SemiBold' },
  explanationCard: { backgroundColor: '#151920', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  explanationLabel: { fontSize: 10, fontFamily: 'DMSans_600SemiBold', color: '#8A909E', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  explanationText: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', lineHeight: 20 },
  sourceRef: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginTop: 8, fontStyle: 'italic' },
  mindsetCard: { backgroundColor: 'rgba(244,200,66,0.06)', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(244,200,66,0.18)', borderLeftWidth: 3, borderLeftColor: '#F4C842' },
  mindsetLabel: { fontSize: 10, fontFamily: 'DMSans_600SemiBold', color: '#F4C842', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  mindsetText: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', lineHeight: 20 },
  nextBtn: { backgroundColor: '#4ECDC4', borderRadius: 14, padding: 16, alignItems: 'center' },
  nextBtnText: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: '#0C0F14' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontFamily: 'DMSerifDisplay_400Regular', color: '#E8EAF0', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#8A909E', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  backBtn: { backgroundColor: '#151920', borderRadius: 12, padding: 14, paddingHorizontal: 24 },
  backBtnText: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#4ECDC4' },
})
