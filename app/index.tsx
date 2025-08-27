// app/index.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import MetalTile from '../components/MetalTile';
import { formatDateTime } from '../constants/Format';
import { colors, spacing } from '../constants/Theme';
import { useMetals } from '../hooks/useMetals';

function formatTimeLeft(resetAt: number | null) {
  if (!resetAt) return '';
  const ms = resetAt - Date.now();
  if (ms <= 0) return 'now';
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${mins}m`;
}

export default function HomeScreen() {
  const router = useRouter();
  const apiKey = process.env.EXPO_PUBLIC_GOLDAPI_IO_API_KEY;

  const {
    metals,
    loading,
    error,
    refreshing,
    loaders,
    lastUpdated,
    onPull,
    tryForceRefresh,
    remainingRefreshes,
    refreshResetAt,
  } = useMetals(apiKey);

  const handleManualRefresh = async () => {
    if (remainingRefreshes <= 0) {
      Alert.alert(
        'Refresh limit reached',
      `You can refresh only 2 times per day to avoid exceeding the API quota.\nTry again in ${formatTimeLeft(refreshResetAt)}.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Optional pre-warning if they have just 1 left
    if (remainingRefreshes === 1) {
      const proceed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'One refresh left',
          'You have 1 refresh remaining for today. Proceed?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Refresh', onPress: () => resolve(true) },
          ]
        );
      });
      if (!proceed) return;
    }

    const res = await tryForceRefresh();
    if (!res.allowed) {
      Alert.alert(
        'Refresh blocked',
        `Refresh limit reached. Try again in ${formatTimeLeft(res.resetAt)}.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.h1}>Live Metals</Text>
        <Text style={styles.h2}>Gold • Silver • Platinum • Palladium</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            Last updated: {lastUpdated ? formatDateTime(Math.floor(lastUpdated / 1000)) : '—'}
            {lastUpdated ? ' (cached)' : ''}
          </Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={handleManualRefresh}>
            <Text style={styles.refreshText}>
              Refresh {remainingRefreshes >= 0 ? `(${remainingRefreshes} left for Today)` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.err}>{error}</Text>}
      </View>

      <FlatList
        data={metals}
        renderItem={({ item }) => (
          <MetalTile
            item={item}
            loading={!!loaders[item.id]}
            onPress={() => router.push({ pathname: '/details', params: { metalData: JSON.stringify(item) } })}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onPull} />}
        ListEmptyComponent={
          loading ? <Text style={styles.h2}>Loading cached/live prices…</Text> : <Text style={styles.err}>No data</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.md },
  h1: { color: colors.text, fontSize: 28, fontWeight: '800' },
  h2: { color: colors.subtext, marginTop: 6 },
  err: { color: '#ff6b6b', marginTop: 8, fontSize: 12 },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  metaRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaText: { color: colors.subtext, fontSize: 12 },
  refreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  refreshText: { color: colors.text, fontWeight: '600' },
});