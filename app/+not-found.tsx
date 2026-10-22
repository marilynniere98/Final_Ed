import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, TINTS } from '@/constants/colors';
import { RADIUS, SHADOWS, SPACING, TEXT } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.icon}>
            <Ionicons name="compass-outline" size={44} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>This page wandered off</Text>
          <Text style={styles.subtitle}>
            The screen you were looking for does not exist.
          </Text>
          <Link href="/" style={styles.button}>
            Go back to Home screen!
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: TINTS.white,
    borderRadius: RADIUS.card,
    ...SHADOWS.card,
  },
  icon: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.pill,
    backgroundColor: TINTS.wash,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TEXT.title,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TEXT.meta,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    ...TEXT.button,
    color: COLORS.textOnPrimary,
    backgroundColor: COLORS.primaryInk,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    overflow: 'hidden',
  },
});