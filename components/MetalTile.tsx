// components/MetalTile.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { formatMoney, formatPercent } from '../constants/Format';
import { colors, radii, spacing } from '../constants/Theme';
import { MetalModel } from '../constants/Types';
interface Props {
    item: MetalModel;
    loading?: boolean;
    onPress?: () => void;
  }
  
  export default function MetalTile({ item, loading, onPress }: Props) {
    const isUp = (item.ch ?? 0) >= 0;
  
    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
        <LinearGradient
          colors={['#1f1f2e', '#151521']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Top Row */}
          <View style={styles.rowTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.subtitle}>24K • Updated {item.time}</Text>
            </View>
  
            <View style={getBadgeStyle(isUp)}>
              <Text style={styles.badgeText}>{formatPercent(item.chp)}</Text>
            </View>
          </View>
  
          {/* Bottom Row */}
          <View style={styles.rowBottom}>
            <View style={{ minWidth: 140, alignItems: 'flex-start' }}>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.price}>{formatMoney(item.price)}</Text>
              )}
              <Text style={styles.subtle}>Prev Close {formatMoney(item.prev_close)}</Text>
            </View>
  
            <View style={styles.rightCol}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Bid {formatMoney(item.bid)}</Text>
              </View>
              <View style={[styles.pill, { marginTop: spacing.xs }]}>
                <Text style={styles.pillText}>Ask {formatMoney(item.ask)}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  /** Typed dynamic style helper to avoid union issues */
  function getBadgeStyle(up: boolean): ViewStyle {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: up ? colors.success : colors.danger,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
    };
  }
  
  /** Strongly type each key to prevent TextStyle leaking into ViewStyle props */
  type Styles = {
    card: ViewStyle;
    gradient: ViewStyle;
    rowTop: ViewStyle;
    rowBottom: ViewStyle;
    title: TextStyle;
    subtitle: TextStyle;
    price: TextStyle;
    subtle: TextStyle;
    rightCol: ViewStyle;
    pill: ViewStyle;
    pillText: TextStyle;
    badgeText: TextStyle;
  };
  
  const styles = StyleSheet.create<Styles>({
    card: {
      borderRadius: radii.xl,
      overflow: 'hidden',
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    gradient: {
      padding: spacing.lg,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowBottom: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginTop: spacing.md,
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.subtext,
      marginTop: 4,
    },
    price: {
      color: colors.accent,
      fontSize: 26,
      fontWeight: '800',
    },
    subtle: {
      color: colors.subtext,
      marginTop: 4,
      fontSize: 12,
    },
    rightCol: {
      flex: 1,
      alignItems: 'flex-end',
    },
    pill: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillText: {
      color: colors.text,
      fontSize: 12,
    },
    badgeText: {
      color: '#0b0b0f',
      fontWeight: '700',
      marginLeft: 4,
      fontSize: 12,
    },
  });