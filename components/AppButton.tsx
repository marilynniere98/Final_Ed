import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, TINTS } from '@/constants/colors';
import { HIT, PRESSED, RADIUS, SHADOWS, SPACING, TEXT } from '@/constants/theme';

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme?: 'primary';
  onPress: () => void;
};

export default function AppButton({ title, icon, theme, onPress }: Props) {
  const isPrimary = theme === 'primary';

  return (
    <View style={styles.buttonOuter}>
      <Pressable
        style={({ pressed }) => [
          styles.buttonInner,
          isPrimary ? styles.primaryFill : styles.secondaryFill,
          isPrimary && styles.primaryShadow,
          pressed && PRESSED,
        ]}
        onPress={onPress}
      >
        <View style={isPrimary ? styles.primaryIconPill : styles.secondaryIconPill}>
          <Ionicons
            name={icon}
            size={20}
            color={isPrimary ? COLORS.primary : COLORS.textPrimary}
            style={styles.icon}
          />
        </View>
        <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>
          {title}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonOuter: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    minHeight: HIT.min + 14,
  },
  primaryFill: {
    backgroundColor: COLORS.primaryInk,
  },
  primaryShadow: {
    ...SHADOWS.pill,
  },
  secondaryFill: {
    backgroundColor: TINTS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  primaryIconPill: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.pill,
    backgroundColor: TINTS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  secondaryIconPill: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.pill,
    backgroundColor: TINTS.wash,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  icon: {
    marginRight: 0,
  },
  label: TEXT.button,
  primaryLabel: {
    ...TEXT.button,
    color: COLORS.textOnPrimary,
  },
  secondaryLabel: {
    ...TEXT.button,
    color: COLORS.textPrimary,
  },
});