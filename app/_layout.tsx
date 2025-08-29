// app/_layout.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet } from 'react-native';
import { colors } from '../constants/Theme';

export default function RootLayout() {
  const HeaderBg = () => (
    <LinearGradient
      colors={['#0b0b0f', '#14141a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    />
  );

  return (
    <>
      <StatusBar style="light" />
      <Stack
        initialRouteName="index"
        screenOptions={{
          contentStyle: { backgroundColor: colors.bg },
          headerTitleAlign: 'center',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: 'transparent' },
          headerBackground: () => <HeaderBg />,
          headerShadowVisible: false,
          headerTitleStyle: styles.headerTitle,
          animation: 'slide_from_right',
        
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'Karats' }}
        />
        <Stack.Screen
          name="details"
          options={{
            title: 'Details',
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontWeight: '800',
    letterSpacing: 1, 
  },
});