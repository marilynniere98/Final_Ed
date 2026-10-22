import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, TINTS } from '@/constants/colors';
import { RADIUS, SHADOWS, SPACING, TEXT } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export default function Header({ title, subtitle, icon = 'qr-code-2' }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <View style={styles.logoClip}>
          <View style={styles.logoGlow} />
        </View>
        <MaterialIcons name={icon} size={34} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.pill,
    backgroundColor: TINTS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.raised,
  },
  logoClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  logoGlow: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: RADIUS.pill,
    backgroundColor: TINTS.wash,
    top: -22,
    right: -26,
  },
  title: {
    ...TEXT.section,
    textAlign: 'center',
  },
  subtitle: {
    ...TEXT.meta,
    marginTop: SPACING.xxs,
    textAlign: 'center',
  },
});