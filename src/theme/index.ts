import { StyleSheet } from 'react-native';

export const colors = {
  bg: {
    primary: '#080C18',
    secondary: '#0E1225',
    card: '#151A2E',
    cardHover: '#1C2240',
    elevated: '#1E2438',
    input: '#12162A',
  },
  accent: {
    gold: '#E8B86D',
    goldLight: '#F5D38E',
    goldDim: '#9E7B3F',
    jade: '#5EB88A',
    jadeDim: '#3A7558',
    coral: '#E87C6D',
    coralDim: '#9E4F3F',
    sky: '#6DB5E8',
    violet: '#9B7CE8',
  },
  text: {
    primary: '#F0EDE6',
    secondary: '#A0A8B8',
    tertiary: '#636B7E',
    inverse: '#080C18',
    gold: '#E8B86D',
  },
  border: {
    subtle: 'rgba(255,255,255,0.06)',
    medium: 'rgba(255,255,255,0.10)',
    accent: 'rgba(232,184,109,0.25)',
  },
  status: {
    pending: '#E8B86D',
    pendingBg: 'rgba(232,184,109,0.12)',
    paid: '#5EB88A',
    paidBg: 'rgba(94,184,138,0.12)',
    overdue: '#E87C6D',
    overdueBg: 'rgba(232,124,109,0.12)',
    expired: '#E87C6D',
    expiredBg: 'rgba(232,124,109,0.12)',
    warning: '#E8B86D',
    warningBg: 'rgba(232,184,109,0.12)',
    safe: '#5EB88A',
    safeBg: 'rgba(94,184,138,0.12)',
  },
  gradient: {
    goldStart: '#E8B86D',
    goldEnd: '#D4956A',
    jadeStart: '#5EB88A',
    jadeEnd: '#4A9E7A',
    skyStart: '#6DB5E8',
    skyEnd: '#5A8FBE',
    darkCard: ['#1A1F35', '#151A2E'] as const,
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
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  hero: 32,
  display: 40,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
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
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardGold: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.accent,
    padding: spacing.lg,
    ...shadow.card,
  },
  heading: {
    fontSize: fontSize.xxl,
    fontWeight: '700' as const,
    color: colors.text.primary,
    letterSpacing: 0.5,
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
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2,
    fontWeight: '600' as const,
  },
  goldText: {
    color: colors.accent.gold,
    fontWeight: '700' as const,
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
