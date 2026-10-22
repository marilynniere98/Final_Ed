import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { COLORS, TINTS } from '@/constants/colors';
import { RADIUS, SHADOWS } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth';

function RootNavigator() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <View style={styles.splashCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      {!session && !inAuthGroup && <Redirect href="/login" />}
      {session && inAuthGroup && <Redirect href="/" />}
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashCard: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.pill,
    backgroundColor: TINTS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
});