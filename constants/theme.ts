import { Platform, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import { COLORS, TINTS } from './colors';

/**
 * Shape scale. Everything rounded: cards are big and soft,
 * buttons / chips / inputs / search are fully pill-shaped.
 */
export const RADIUS = {
  card: 28,
  sheet: 32,
  tile: 24,
  field: 999,
  chip: 999,
  badge: 999,
  pill: 999,
} as const;

/** Generous spacing scale (4 -> 40). */
export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

/** Minimum comfortable touch target (accessibility). */
export const HIT = {
  min: 44,
} as const;

/**
 * Soft, diffuse shadows - no harsh borders, no hard drop shadows.
 * Spread these into a style; RN uses shadow* on iOS and elevation on Android.
 */
export const SHADOWS = {
  card: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 4,
  },
  raised: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  pill: {
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
  sheet: {
    shadowColor: TINTS.sheetShadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

/** System font stack - clean modern sans, no bundled font files. */
export const FONT = {
  regular:
    Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }) ??
    'System',
  medium:
    Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'System',
    }) ?? 'System',
} as const;

/** Type scale: large, bold, tight headings + small muted subtext. */
export const TEXT = StyleSheet.create({
  display: {
    fontFamily: FONT.regular,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '800',
    letterSpacing: -0.9,
    color: COLORS.textPrimary,
  },
  title: {
    fontFamily: FONT.regular,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: COLORS.textPrimary,
  },
  section: {
    fontFamily: FONT.regular,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: COLORS.textPrimary,
  },
  cardTitle: {
    fontFamily: FONT.regular,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: COLORS.textPrimary,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  button: {
    fontFamily: FONT.medium,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  chip: {
    fontFamily: FONT.medium,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  badge: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: COLORS.textSecondary,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  hint: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
});

/** Shared, reusable style fragments so screens stay declarative. */
export const SHARED: {
  screen: ViewStyle;
  page: ViewStyle;
  card: ViewStyle;
  cardInner: ViewStyle;
  field: TextStyle;
  fieldWrap: ViewStyle;
  chip: ViewStyle;
  chipActive: ViewStyle;
  chipText: TextStyle;
  chipTextActive: TextStyle;
  badge: ViewStyle;
  badgeText: TextStyle;
  avatar: ViewStyle;
} = {
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  page: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  card: {
    backgroundColor: TINTS.white,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  cardInner: {
    backgroundColor: TINTS.wash,
    borderRadius: RADIUS.tile,
    padding: SPACING.md,
  },
  field: {
    fontFamily: FONT.regular,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    color: COLORS.textPrimary,
    backgroundColor: TINTS.white,
    borderRadius: RADIUS.field,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 15,
    minHeight: HIT.min + 12,
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TINTS.white,
    borderRadius: RADIUS.field,
    paddingHorizontal: SPACING.lg,
    minHeight: HIT.min + 12,
    ...SHADOWS.raised,
  },
  chip: {
    minHeight: HIT.min,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.chip,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TINTS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  chipText: {
    ...TEXT.chip,
    color: COLORS.textPrimary,
  },
  chipTextActive: {
    ...TEXT.chip,
    color: TINTS.white,
  },
  badge: {
    borderRadius: RADIUS.badge,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...TEXT.badge,
    color: COLORS.textPrimary,
  },
  avatar: {
    borderRadius: RADIUS.pill,
    backgroundColor: TINTS.wash,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

/** Subtle press feedback - used as `pressed && SHARED.pressed`. */
export const PRESSED: ViewStyle = {
  opacity: 0.82,
  transform: [{ scale: 0.985 }],
};