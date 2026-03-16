import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { FREE_QUESTION_LIMIT } from '@/lib/PremiumContext'

const FEATURES = [
  { icon: '⚡', label: 'Unlimited questions', desc: `No cap — drill past the ${FREE_QUESTION_LIMIT}-question free limit on any track` },
  { icon: '⬆', label: 'Weak Domain Focus', desc: 'Adaptive sessions that target your lowest-scoring domain automatically' },
  { icon: '↺', label: 'Missed Questions Review', desc: 'Revisit every question you got wrong across all sessions' },
  { icon: '◎', label: 'Full analytics', desc: 'Study plan, domain trends, and phased improvement roadmap' },
  { icon: '◈', label: 'All three tracks', desc: 'Unlimited access across RP, CCP, and CCA question banks' },
  { icon: '☁', label: 'Cloud sync', desc: 'Progress backs up automatically and syncs across your devices' },
]

export default function PaywallScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>CMMC APEX PREMIUM</Text>
          <Text style={styles.heading}>Unlock full access</Text>
          <Text style={styles.subheading}>
            You've reached the free tier limit. Upgrade to keep studying without limits.
          </Text>
        </View>

        {/* Feature list */}
        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing placeholder */}
        <View style={styles.pricingCard}>
          <View style={styles.pricingRow}>
            <View style={styles.pricingOption}>
              <Text style={styles.pricingBadge}>BEST VALUE</Text>
              <Text style={styles.pricingAmount}>$49</Text>
              <Text style={styles.pricingPeriod}>lifetime</Text>
            </View>
            <View style={[styles.pricingOption, styles.pricingOptionRight]}>
              <Text style={styles.pricingAmountSmall}>$9.99</Text>
              <Text style={styles.pricingPeriod}>/ month</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.ctaBtn} disabled>
            <Text style={styles.ctaBtnText}>Unlock Premium — Coming Soon</Text>
          </TouchableOpacity>
          <Text style={styles.ctaNote}>
            Payment integration coming soon. Your progress is saved — come back when it launches.
          </Text>
          <TouchableOpacity style={styles.dismissBtn} onPress={() => router.back()}>
            <Text style={styles.dismissBtnText}>Continue with free tier</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0F14' },
  content: { padding: 24, paddingBottom: 48 },
  header: { marginBottom: 28 },
  eyebrow: { fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#F4C842', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  heading: { fontSize: 32, fontFamily: 'DMSerifDisplay_400Regular', color: '#E8EAF0', lineHeight: 40, marginBottom: 10 },
  subheading: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#8A909E', lineHeight: 21 },
  featureList: { backgroundColor: '#151920', borderRadius: 16, padding: 6, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 10 },
  featureIcon: { fontSize: 20, width: 28, textAlign: 'center', marginTop: 1 },
  featureLabel: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#E8EAF0', marginBottom: 2 },
  featureDesc: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E', lineHeight: 17 },
  pricingCard: { backgroundColor: '#151920', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(244,200,66,0.2)' },
  pricingRow: { flexDirection: 'row', gap: 12 },
  pricingOption: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(244,200,66,0.06)', borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: '#F4C842' },
  pricingOptionRight: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' },
  pricingBadge: { fontSize: 9, fontFamily: 'DMSans_600SemiBold', color: '#F4C842', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  pricingAmount: { fontSize: 36, fontFamily: 'DMSerifDisplay_400Regular', color: '#F4C842', lineHeight: 40 },
  pricingAmountSmall: { fontSize: 28, fontFamily: 'DMSerifDisplay_400Regular', color: '#8A909E', lineHeight: 36 },
  pricingPeriod: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E', marginTop: 2 },
  ctaSection: { gap: 12 },
  ctaBtn: { backgroundColor: '#2A3040', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(244,200,66,0.2)' },
  ctaBtnText: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: '#8A909E' },
  ctaNote: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#8A909E', textAlign: 'center', lineHeight: 18 },
  dismissBtn: { alignItems: 'center', paddingVertical: 12 },
  dismissBtnText: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#4ECDC4' },
})
