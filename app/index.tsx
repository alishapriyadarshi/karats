// app/index.tsx
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useMetals } from '../hooks/useMetals';
import MetalTile from '../components/MetalTile';
import { colors, spacing } from '../constants/Theme';

export default function HomeScreen() {
  const router = useRouter();
  const apiKey = process.env.EXPO_PUBLIC_GOLDAPI_IO_API_KEY;

  const { metals, error, loading, refreshing, refreshLabel, fetchLive } = useMetals(apiKey);

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.h1}>Karats</Text>
        <Text style={styles.h2}>Gold • Silver • Platinum • Palladium</Text>

        <TouchableOpacity style={styles.refreshBtn} onPress={fetchLive} disabled={refreshing}>
          <Text style={styles.refreshText}>{refreshLabel}</Text>
        </TouchableOpacity>

        {error && <Text style={styles.err}>{error}</Text>}
      </View>

      <FlatList
        data={metals}
        renderItem={({ item }) => (
          <MetalTile
            item={item}
            onPress={() =>
              router.push({ pathname: '/details', params: { metalData: JSON.stringify(item) } })
            }
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchLive} />}
        ListEmptyComponent={
          loading ? <Text style={styles.h2}>Loading…</Text> : <Text style={styles.err}>No data</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerWrap: { padding: spacing.md },
  h1: { fontSize: 28, fontWeight: '800', color: colors.text },
  h2: { fontSize: 14, color: colors.subtext, marginTop: 4 },
  refreshBtn: {
    marginTop: spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignSelf: 'flex-start',
  },
  refreshText: { color: colors.text, fontWeight: '700' },
  err: { color: '#ff6b6b', marginTop: 8 },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
});