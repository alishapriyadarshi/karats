import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../constants/Theme';
import { formatDateTime, formatMoney, formatPercent } from '../constants/Format';
import type { MetalModel } from '../constants/Types';

export default function DetailsScreen() {
  const params = useLocalSearchParams();
  const { metalData } = params as { metalData?: string | string[] };

  // Normalize param to a single string
  const metalJson: string | null = useMemo(() => {
    if (!metalData) return null;
    if (Array.isArray(metalData)) return metalData[0] ?? null;
    if (typeof metalData === 'string') return metalData;
    return null;
  }, [metalData]);

  // Safely parse the data
  const metal: MetalModel | null = useMemo(() => {
    if (!metalJson) return null;
    try { return JSON.parse(metalJson) as MetalModel; } catch { return null; }
  }, [metalJson]);

  if (!metal) return <Redirect href="/" />;

  const isUp = (metal.ch ?? 0) >= 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${metal.name}` }} />

      <View style={styles.card}>
        <Text style={styles.header}>{metal.name}</Text>
        <Text style={styles.subtle}>Last Updated • {metal.time}</Text>

        <View style={styles.row}>
          <Text style={styles.price}>{formatMoney(metal.price)}</Text>
          <View
            style={[
              styles.delta,
              { borderColor: isUp ? colors.success : colors.danger, backgroundColor: isUp ? '#11341b' : '#3a0c0c' },
            ]}
          >
            <Text style={{ color: isUp ? colors.success : colors.danger, fontWeight: '800' }}>
              {formatPercent(metal.chp)}
            </Text>
          </View>
        </View>

        <View style={styles.row2}>
          <Info label="Previous Close" value={formatMoney(metal.prev_close)} />
          <Info label="Open" value={formatMoney(metal.open_price)} />
        </View>

        <View style={styles.row2}>
          <Info label="Low" value={formatMoney(metal.low)} />
          <Info label="High" value={formatMoney(metal.high)} />
        </View>

        <View style={styles.row2}>
          <Info label="Bid" value={formatMoney(metal.bid)} />
          <Info label="Ask" value={formatMoney(metal.ask)} />
        </View>

        <Text style={styles.section}>Per Gram Prices</Text>
        <View style={styles.grid}>
          {Object.entries(metal.grams).map(([k, v]) => (
            <View key={k} style={styles.gridItem}>
              <Text style={styles.gridLabel}>{k.toUpperCase()}</Text>
              <Text style={styles.gridValue}>{formatMoney(typeof v === 'number' ? v : null)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Today</Text>
        <Text style={styles.subtle}>{formatDateTime(metal.rawTimestamp ?? undefined)}</Text>
      </View>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={styles.kvValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md, justifyContent: 'center' },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtle: { color: colors.subtext, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  price: { color: colors.accent, fontSize: 34, fontWeight: '900' },
  delta: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1 },
  row2: { flexDirection: 'row', gap: 12, marginTop: spacing.md },
  kvLabel: { color: colors.subtext, fontSize: 12 },
  kvValue: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 2 },
  section: { color: colors.text, fontWeight: '800', marginTop: spacing.lg, marginBottom: spacing.sm, fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: {
    width: '30%',
    backgroundColor: '#161622',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridLabel: { color: colors.subtext, fontSize: 12, textAlign: 'center' },
  gridValue: { color: colors.text, fontWeight: '800', textAlign: 'center', marginTop: 6 },
});