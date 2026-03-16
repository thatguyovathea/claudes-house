import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans'
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display'
import { View, ActivityIndicator } from 'react-native'
import { Toaster } from 'sonner-native'
import { isOnboardingComplete } from '@/lib/storage'
import { TrackProvider } from '@/lib/TrackContext'
import { AuthProvider } from '@/lib/AuthContext'
import { PremiumProvider } from '@/lib/PremiumContext'

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSerifDisplay_400Regular,
  })
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  useEffect(() => {
    async function checkOnboarding() {
      const complete = await isOnboardingComplete()
      const inOnboarding = segments[0] === 'onboarding'

      if (!complete && !inOnboarding) {
        router.replace('/onboarding')
      } else if (complete && inOnboarding) {
        router.replace('/(tabs)')
      }
      setOnboardingChecked(true)
    }
    if (fontsLoaded) {
      checkOnboarding()
    }
  }, [fontsLoaded, segments])

  if (!fontsLoaded || !onboardingChecked) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0C0F14', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#4ECDC4" />
      </View>
    )
  }

  return (
    <AuthProvider>
      <TrackProvider>
        <PremiumProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0C0F14' } }}>
            <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
            <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
            <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          </Stack>
          <Toaster />
        </PremiumProvider>
      </TrackProvider>
    </AuthProvider>
  )
}
