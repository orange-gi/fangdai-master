import { StyleSheet } from 'react-native';

export const colors = {
  bg: {
    primary: '#F6F5F2',
    secondary: '#EFEEE9',
    card: '#FFFFFF',
    cardHover: '#FAFAF8',
    elevated: '#FFFFFF',
    input: '#F6F5F2',
  },
  accent: {
    primary: '#2D5A47',
    primaryLight: '#E8F0EC',
    gold: '#8B6914',
    goldLight: '#F5F0E0',
    coral: '#B5453A',
    coralLight: '#FBEAE8',
    jade: '#2D5A47',
    jadeDim: '#3A7558',
    sky: '#2D5A47',
    violet: '#2D5A47',
  },
  text: {
    primary: '#1A1D21',
    secondary: '#5F6368',
    tertiary: '#9AA0A6',
    inverse: '#FFFFFF',
    gold: '#8B6914',
  },
  border: {
    subtle: '#EFEEE9',
    medium: '#E2E1DC',
    accent: '#2D5A47',
  },
  status: {
    pending: '#8B6914',
    pendingBg: '#F5F0E0',
    paid: '#2D5A47',
    paidBg: '#E8F0EC',
    overdue: '#B5453A',
    overdueBg: '#FBEAE8',
    expired: '#B5453A',
    expiredBg: '#FBEAE8',
    warning: '#8B6914',
    warningBg: '#F5F0E0',
    safe: '#2D5A47',
    safeBg: '#E8F0EC',
  },
  gradient: {
    goldStart: '#2D5A47',
    goldEnd: '#2D5A47',
    jadeStart: '#2D5A47',
    jadeEnd: '#2D5A47',
    skyStart: '#2D5A47',
    skyEnd: '#2D5A47',
    darkCard: ['#FFFFFF', '#FFFFFF'] as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  full: 999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  hero: 28,
  display: 34,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  glow: (_color: string) => ({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  }),
};

export const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardGold: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  heading: {
    fontSize: fontSize.xxl,
    fontWeight: '700' as const,
    color: colors.text.primary,
  },
  subheading: {
    fontSize: fontSize.lg,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  body: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: '500' as const,
  },
  goldText: {
    color: colors.accent.gold,
    fontWeight: '600' as const,
  },
  input: {
    backgroundColor: colors.bg.input,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing.md,
  },
});
