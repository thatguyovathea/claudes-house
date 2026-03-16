import { useState, useEffect } from 'react'
import { Tabs } from 'expo-router'
import { View, Text, StyleSheet, AppState } from 'react-native'
import { getDueCountByDomain } from '@/lib/flashcardStore'

function TabIcon({ label, focused, badge }: { label: string; focused: boolean; badge?: number }) {
  const icons: Record<string, string> = {
    Home: '⌂',
    Practice: '✎',
    Cards: '◈',
    Progress: '◎',
  }
  return (
    <View style={styles.tabIcon}>
      <View>
        <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
          {icons[label]}
        </Text>
        {badge != null && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  )
}

export default function TabLayout() {
  const [dueCount, setDueCount] = useState(0)

  useEffect(() => {
    function refresh() {
      getDueCountByDomain()
        .then(counts => {
          setDueCount(Object.values(counts).reduce((sum, n) => sum + n, 0))
        })
        .catch(() => {})
    }
    refresh()
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refresh()
    })
    return () => sub.remove()
  }, [])

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Practice" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="flashcards"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Cards" focused={focused} badge={dueCount} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Progress" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0C0F14',
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
  },
  tabIcon: {
    alignItems: 'center',
    gap: 3,
  },
  tabEmoji: {
    fontSize: 20,
    color: '#8A909E',
  },
  tabEmojiActive: {
    color: '#4ECDC4',
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    color: '#8A909E',
  },
  tabLabelActive: {
    color: '#4ECDC4',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'DMSans_600SemiBold',
    color: '#fff',
  },
})
