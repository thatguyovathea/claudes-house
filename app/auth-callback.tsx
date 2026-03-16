import { useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

/**
 * Handles the magic link deep link: cissp-apex://auth-callback?code=<pkce_code>
 * Exchanges the PKCE code for a session, then redirects home.
 */
export default function AuthCallbackScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ code?: string }>()

  useEffect(() => {
    const code = params.code

    if (!code) {
      // No code — shouldn't happen, send them home
      router.replace('/(tabs)')
      return
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          // Exchange failed — go home without session (app still works offline)
          router.replace('/(tabs)')
        } else {
          router.replace('/(tabs)')
        }
      })
      .catch(() => {
        router.replace('/(tabs)')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.container}>
      <ActivityIndicator color="#4ECDC4" size="large" />
      <Text style={styles.text}>Signing you in…</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C0F14', alignItems: 'center', justifyContent: 'center', gap: 16 },
  text: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#8A909E' },
})
