import { View, Text, StyleSheet } from 'react-native'
import { CartesianChart, Bar, Line } from 'victory-native'
import { useFont } from '@shopify/react-native-skia'

// Victory Native v41 requires a font for axis labels.
// We pass null when no font is loaded — axes render without tick labels.
// This is intentional: the chart still shows bars/lines correctly.

interface WeeklyBarDatum {
  day: string
  count: number
  [key: string]: unknown
}

interface DomainScoreDatum {
  domain: string
  score: number
  [key: string]: unknown
}

/**
 * Weekly activity bar chart — shows questions answered per day for last 7 days.
 */
export function WeeklyBarChart({ data }: { data: WeeklyBarDatum[] }) {
  const font = useFont(null, 10)

  if (data.length === 0 || data.every(d => d.count === 0)) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyChartText}>No activity yet this week</Text>
      </View>
    )
  }

  return (
    <View style={styles.chartContainer}>
      <CartesianChart
        data={data}
        xKey="day"
        yKeys={['count']}
        axisOptions={{
          font,
          tickCount: { x: 7, y: 4 },
          labelColor: '#8A909E',
          lineColor: 'rgba(255,255,255,0.07)',
          labelOffset: { x: 4, y: 4 },
        }}
        domainPadding={{ left: 12, right: 12, top: 16 }}
      >
        {({ points, chartBounds }) => (
          <Bar
            points={points.count}
            chartBounds={chartBounds}
            color="#4ECDC4"
            roundedCorners={{ topLeft: 4, topRight: 4 }}
            animate={{ type: 'timing', duration: 300 }}
            innerPadding={0.3}
          />
        )}
      </CartesianChart>
    </View>
  )
}

/**
 * Domain score horizontal bar chart — 14 domains, color-coded by score vs 70% target.
 */
export function DomainScoreChart({ data }: { data: DomainScoreDatum[] }) {
  const font = useFont(null, 10)

  if (data.length === 0) return null

  // Show top 7 domains (most interesting for a compact chart)
  const chartData = data.slice(0, 7)

  return (
    <View style={styles.chartContainer}>
      <CartesianChart
        data={chartData}
        xKey="domain"
        yKeys={['score']}
        axisOptions={{
          font,
          tickCount: { x: chartData.length, y: 4 },
          labelColor: '#8A909E',
          lineColor: 'rgba(255,255,255,0.07)',
          labelOffset: { x: 4, y: 4 },
        }}
        domain={{ y: [0, 100] }}
        domainPadding={{ left: 12, right: 12, top: 16 }}
      >
        {({ points, chartBounds }) => (
          <>
            <Bar
              points={points.score}
              chartBounds={chartBounds}
              color="#4ECDC4"
              roundedCorners={{ topLeft: 4, topRight: 4 }}
              animate={{ type: 'timing', duration: 400 }}
              innerPadding={0.3}
            />
          </>
        )}
      </CartesianChart>
    </View>
  )
}

/**
 * Readiness trend line chart — scorePercent over recent sessions.
 */
export function ReadinessTrendChart({ data }: { data: Array<{ session: number; score: number }> }) {
  const font = useFont(null, 10)

  if (data.length < 2) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyChartText}>Complete 2+ sessions to see your trend</Text>
      </View>
    )
  }

  return (
    <View style={styles.chartContainer}>
      <CartesianChart
        data={data}
        xKey="session"
        yKeys={['score']}
        axisOptions={{
          font,
          tickCount: { x: Math.min(data.length, 6), y: 5 },
          labelColor: '#8A909E',
          lineColor: 'rgba(255,255,255,0.07)',
          labelOffset: { x: 4, y: 4 },
        }}
        domain={{ y: [0, 100] }}
        domainPadding={{ left: 8, right: 8, top: 16 }}
      >
        {({ points }) => (
          <Line
            points={points.score}
            color="#4ECDC4"
            strokeWidth={2.5}
            curveType="natural"
            animate={{ type: 'timing', duration: 400 }}
          />
        )}
      </CartesianChart>
    </View>
  )
}

const styles = StyleSheet.create({
  chartContainer: {
    height: 180,
    backgroundColor: '#151920',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  emptyChart: {
    height: 100,
    backgroundColor: '#151920',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  emptyChartText: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    color: '#8A909E',
  },
})
