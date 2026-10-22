export const COLORS = {
  primary: '#E8503A',
  primaryLight: '#FF9C85',
  primaryDark: '#B33720',
  /** Deeper coral for text and button fills - keeps white labels above 4.5:1 */
  primaryInk: '#C7361F',

  gradientStart: '#E8503A',
  gradientMiddle: '#F58C76',
  gradientEnd: '#FDE6E0',

  background: '#FDE6E0',
  card: '#F6D0C8',

  textPrimary: '#111111',
  textSecondary: '#7A625C',
  textOnPrimary: '#FFFFFF',

  surface: '#FFFFFF',
  border: '#F1C6BE',
  shadow: '#8C4A40',

  qrBackground: '#FFFFFF',
  qrForeground: '#111111',

  warning: '#8A6114',
  success: '#2F7A54',
  danger: '#B3261E',
} as const;

/**
 * Extended surface / tint tokens for the blush palette.
 * Kept separate from COLORS so the original token map stays intact.
 */
export const TINTS = {
  /** Lightest wash - chips, icon tiles, section rows */
  wash: '#FFF1ED',
  /** Slightly deeper wash - inactive chips, quiet surfaces */
  washDeep: '#F9E2DC',
  /** Page-level tint for large blocks */
  blush: '#FDE6E0',
  /** Dusty pink surface - cards that sit on the blush page */
  dust: '#F6D0C8',
  /** Pure white - inputs, badges, sheets */
  white: '#FFFFFF',
  /** Translucent coral for pressed / ghost states */
  coralGhost: 'rgba(232, 80, 58, 0.12)',
  /** Translucent ink for scrims over the camera */
  inkScrim: 'rgba(17, 17, 17, 0.45)',
  /** Deep warm ink for the sheet's upward shadow */
  sheetShadow: '#2A1410',
  /** Translucent white for chips sitting on white cards */
  whiteGhost: 'rgba(232, 80, 58, 0.10)',
} as const;

/** Status pill colors - readable on blush and on white. */
export const STATUS = {
  present: {
    bg: '#DCEFE4',
    fg: '#1F6B47',
  },
  late: {
    bg: '#FBEBD2',
    fg: '#8A6114',
  },
  absent: {
    bg: '#FADFD9',
    fg: '#A32A1E',
  },
} as const;