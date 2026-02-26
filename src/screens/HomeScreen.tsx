import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { propertyService } from '../services/property';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [stats, setStats] = useState({ count: 0, totalValue: 0, totalGain: 0, totalPurchase: 0 });
  useEffect(() => { propertyService.getStats().then(setStats).catch(() => {}); }, []);

  const features = [
    { id: 'tax', title: '税务规划', subtitle: '专业税务咨询', screen: 'TaxCenter' as const },
    { id: 'property', title: '房产管理', subtitle: '统一管理资产', screen: 'PropertyList' as const },
    { id: 'document', title: '证件管理', subtitle: '数字化存档', screen: 'DocumentList' as const },
    { id: 'policy', title: '政策解读', subtitle: '最新政策速递', screen: 'PolicyList' as const },
  ];

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.title}>房产大师</Text>
          <TouchableOpacity style={s.profileBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={s.profileText}>我的</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.subtitle}>您的海外房产税务助手</Text>
      </View>

      {stats.count > 0 && (
        <View style={s.statsRow}>
          <View style={s.statItem}><Text style={s.statNum}>{stats.count}</Text><Text style={s.statLabel}>房产</Text></View>
          <View style={s.statDivider} />
          <View style={s.statItem}><Text style={[s.statNum, s.accentText]}>¥{(stats.totalValue / 10000).toFixed(0)}万</Text><Text style={s.statLabel}>总资产</Text></View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statNum, stats.totalGain >= 0 ? s.greenText : s.redText]}>
              {stats.totalGain >= 0 ? '+' : ''}¥{(stats.totalGain / 10000).toFixed(0)}万
            </Text>
            <Text style={s.statLabel}>收益</Text>
          </View>
        </View>
      )}

      <View style={s.grid}>
        {features.map((f) => (
          <TouchableOpacity key={f.id} style={s.featureCard} onPress={() => navigation.navigate(f.screen)} activeOpacity={0.7}>
            <Text style={s.featureTitle}>{f.title}</Text>
            <Text style={s.featureSub}>{f.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={s.aiBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Chat', {})}>
        <Text style={s.aiBtnText}>咨询 AI 助手</Text>
        <Text style={s.aiArrow}>→</Text>
      </TouchableOpacity>

      <View style={{ height: spacing.huge }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: fontSize.hero, fontWeight: '700', color: colors.text.primary },
  subtitle: { fontSize: fontSize.sm, color: colors.text.tertiary, marginTop: 4 },
  profileBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.bg.secondary },
  profileText: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '500' },
  statsRow: { flexDirection: 'row', marginHorizontal: spacing.xl, backgroundColor: colors.bg.card, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: colors.border.subtle, marginVertical: 4 },
  statNum: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text.primary },
  statLabel: { fontSize: fontSize.xs, color: colors.text.tertiary, marginTop: 4 },
  accentText: { color: colors.accent.primary },
  greenText: { color: colors.accent.primary },
  redText: { color: colors.accent.coral },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  featureCard: { width: '46%', backgroundColor: colors.bg.card, borderRadius: radius.lg, padding: spacing.xl, margin: '2%', ...shadow.card },
  featureTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text.primary, marginBottom: 4 },
  featureSub: { fontSize: fontSize.xs, color: colors.text.tertiary },
  aiBtn: { marginHorizontal: spacing.xl, marginTop: spacing.xl, backgroundColor: colors.accent.primary, borderRadius: radius.lg, paddingVertical: 16, paddingHorizontal: spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiBtnText: { fontSize: fontSize.md, fontWeight: '600', color: colors.text.inverse },
  aiArrow: { fontSize: fontSize.lg, color: colors.text.inverse },
});
