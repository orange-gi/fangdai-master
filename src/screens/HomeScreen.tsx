import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { propertyService } from '../services/property';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [stats, setStats] = useState({ count: 0, totalValue: 0, totalGain: 0, totalPurchase: 0 });
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    propertyService.getStats().then(setStats).catch(() => {});
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const features = [
    { id: 'tax', title: '税务规划', subtitle: '专业税务咨询', icon: '💰', gradient: ['#E8B86D', '#D4956A'] as const, screen: 'TaxCenter' as const },
    { id: 'property', title: '房产管理', subtitle: '统一管理资产', icon: '🏠', gradient: ['#6DB5E8', '#5A8FBE'] as const, screen: 'PropertyList' as const },
    { id: 'document', title: '证件管理', subtitle: '数字化存档', icon: '📄', gradient: ['#9B7CE8', '#8060C8'] as const, screen: 'DocumentList' as const },
    { id: 'policy', title: '政策解读', subtitle: '最新政策速递', icon: '📚', gradient: ['#5EB88A', '#4A9E7A'] as const, screen: 'PolicyList' as const },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <LinearGradient colors={['#151A2E', '#0E1225', '#080C18']} style={styles.heroSection}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>您好，</Text>
              <Text style={styles.heroTitle}>房产大师</Text>
            </View>
            <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
              <LinearGradient colors={['#E8B86D', '#D4956A']} style={styles.profileGradient}>
                <Text style={styles.profileIcon}>👤</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={styles.heroSubtitle}>您的海外房产税务助手</Text>

          {stats.count > 0 && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.count}</Text>
                <Text style={styles.statLabel}>房产</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Text style={styles.statValueGold}>¥{(stats.totalValue / 10000).toFixed(0)}万</Text>
                <Text style={styles.statLabel}>总资产</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Text style={[styles.statValue, stats.totalGain >= 0 ? styles.textJade : styles.textCoral]}>
                  {stats.totalGain >= 0 ? '+' : ''}¥{(stats.totalGain / 10000).toFixed(0)}万
                </Text>
                <Text style={styles.statLabel}>收益</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionLabel}>功能服务</Text>
          <View style={styles.featuresGrid}>
            {features.map((f, i) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.featureCard, i % 2 === 0 ? { marginRight: spacing.sm } : { marginLeft: spacing.sm }]}
                onPress={() => navigation.navigate(f.screen)}
                activeOpacity={0.8}
              >
                <LinearGradient colors={f.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featureIconBg}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                </LinearGradient>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSubtitle}>{f.subtitle}</Text>
                <Text style={styles.featureArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.aiSection}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Chat', {})}>
            <LinearGradient
              colors={['#E8B86D', '#D4956A', '#C87E5A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiButton}
            >
              <View style={styles.aiContent}>
                <Text style={styles.aiEmoji}>🤖</Text>
                <View>
                  <Text style={styles.aiTitle}>AI 智能助手</Text>
                  <Text style={styles.aiSubtitle}>7×24 房产税务咨询</Text>
                </View>
              </View>
              <Text style={styles.aiArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  heroSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroGreeting: { fontSize: fontSize.md, color: colors.text.tertiary, marginBottom: 2 },
  heroTitle: { fontSize: fontSize.hero, fontWeight: '800', color: colors.text.primary, letterSpacing: 1 },
  heroSubtitle: { fontSize: fontSize.sm, color: colors.text.tertiary, marginTop: spacing.sm, letterSpacing: 0.5 },
  profileBtn: { marginTop: 4 },
  profileGradient: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  profileIcon: { fontSize: 20 },
  statsContainer: {
    flexDirection: 'row', marginTop: spacing.xxl,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border.subtle, padding: spacing.lg,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: colors.border.subtle, marginVertical: 2 },
  statValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text.primary },
  statValueGold: { fontSize: fontSize.xl, fontWeight: '700', color: colors.accent.gold },
  statLabel: { fontSize: fontSize.xs, color: colors.text.tertiary, marginTop: 4, letterSpacing: 0.8, textTransform: 'uppercase' },
  textJade: { color: colors.accent.jade },
  textCoral: { color: colors.accent.coral },
  featuresSection: { paddingHorizontal: spacing.xl, marginTop: -spacing.md },
  sectionLabel: { fontSize: fontSize.xs, color: colors.text.tertiary, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '600', marginBottom: spacing.lg },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  featureCard: {
    flex: 1, minWidth: '45%', backgroundColor: colors.bg.card,
    borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border.subtle, ...shadow.card,
  },
  featureIconBg: {
    width: 48, height: 48, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  featureIcon: { fontSize: 22 },
  featureTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  featureSubtitle: { fontSize: fontSize.xs, color: colors.text.tertiary },
  featureArrow: { fontSize: fontSize.lg, color: colors.text.tertiary, position: 'absolute', top: spacing.xl, right: spacing.xl },
  aiSection: { paddingHorizontal: spacing.xl, paddingBottom: spacing.huge },
  aiButton: { borderRadius: radius.xl, padding: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...shadow.elevated },
  aiContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  aiEmoji: { fontSize: 28 },
  aiTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#080C18' },
  aiSubtitle: { fontSize: fontSize.xs, color: 'rgba(8,12,24,0.6)', marginTop: 2 },
  aiArrow: { fontSize: fontSize.xxl, color: '#080C18', fontWeight: '300' },
});
