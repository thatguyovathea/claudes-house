import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'

type Step = 'email' | 'sent'

export default function SignInScreen() {
  const router = useRouter()
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<Step>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    setError(null)
    const { error: err } = await signInWithEmail(trimmed)
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      setStep('sent')
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        {step === 'email' ? (
          <View style={styles.content}>
            <Text style={styles.eyebrow}>CMMC APEX</Text>
            <Text style={styles.heading}>Sign in to sync{'\n'}your progress</Text>
            <Text style={styles.subheading}>
              Enter your email and we'll send you a magic link. No password needed. Your progress syncs automatically across devices when signed in.
            </Text>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#8A909E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.sendBtn, (loading || !email.trim()) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={loading || !email.trim()}
            >
              <Text style={[styles.sendBtnText, (loading || !email.trim()) && { color: '#8A909E' }]}>
                {loading ? 'Sending…' : 'Send magic link →'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Your study data is stored locally on this device. Signing in enables cloud backup and cross-device sync. Optional — the app works fully without an account.
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.sentIcon}>✉</Text>
            <Text style={styles.heading}>Check your email</Text>
            <Text style={styles.subheading}>
              We sent a magic link to{'\n'}<Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <Text style={styles.sentNote}>
              Tap the link in the email to sign in. You can close this screen — the link will bring you back automatically.
            </Text>
            <TouchableOpacity style={styles.resendBtn} onPress={() => setStep('email')}>
              <Text style={styles.resendBtnText}>Use a different email</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0F14' },
  flex: { flex: 1 },
  backBtn: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backBtnText: { fontSize: 14, fontFamily: 'DMSans_500Medium', color: '#4ECDC4' },
  content: { flex: 1, padding: 20, paddingTop: 16 },
  eyebrow: { fontSize: 11, fontFamily: 'DMSans_500Medium', color: '#4ECDC4', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  heading: { fontSize: 32, fontFamily: 'DMSerifDisplay_400Regular', color: '#E8EAF0', lineHeight: 40, marginBottom: 12 },
  subheading: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#8A909E', lineHeight: 21, marginBottom: 28 },
  inputCard: { backgroundColor: '#151920', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  inputLabel: { fontSize: 11, fontFamily: 'DMSans_500Medium', color: '#8A909E', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  input: { fontSize: 18, fontFamily: 'DMSans_400Regular', color: '#E8EAF0', borderBottomWidth: 1, borderBottomColor: '#4ECDC4', paddingBottom: 8 },
  errorText: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#FF6B6B', marginBottom: 12 },
  sendBtn: { backgroundColor: '#4ECDC4', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  sendBtnDisabled: { backgroundColor: '#1D2330' },
  sendBtnText: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: '#0C0F14' },
  disclaimer: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E', lineHeight: 18, marginTop: 16, textAlign: 'center' },
  // Sent state
  sentIcon: { fontSize: 48, textAlign: 'center', marginBottom: 16, marginTop: 32 },
  emailHighlight: { color: '#4ECDC4', fontFamily: 'DMSans_600SemiBold' },
  sentNote: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#8A909E', lineHeight: 21, marginTop: 16 },
  resendBtn: { marginTop: 32, alignItems: 'center' },
  resendBtnText: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#4ECDC4' },
})
