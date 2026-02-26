import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Property, TaxRecord, RootStackParamList } from '../types';
import { propertyService } from '../services/property';
import { taxService } from '../services/tax';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyDetail'>;

export default function PropertyDetailScreen({ navigation, route }: Props) {
  const { propertyId } = route.params;
  const [property, setProperty] = useState<Property | null>(null);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [propertyId]);

  const loadData = async () => {
    try {
      const [p, t] = await Promise.all([propertyService.get(propertyId), taxService.getByProperty(propertyId)]);
      setProperty(p); setTaxRecords(t);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert('确认删除', '此操作不可恢复', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => { await propertyService.delete(propertyId); navigation.goBack(); } },
    ]);
  };

  const typeMap: Record<string, string> = { apartment: '公寓', house: '别墅', land: '土地', commercial: '商铺', other: '其他' };
  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: '待缴纳', color: colors.accent.gold, bg: colors.status.pendingBg },
    paid: { label: '已缴纳', color: colors.accent.jade, bg: colors.status.paidBg },
    overdue: { label: '逾期', color: colors.accent.coral, bg: colors.status.overdueBg },
  };

  if (loading || !property) return <SafeAreaView style={styles.container}><View style={styles.loadingWrap}><Text style={styles.loadingText}>加载中...</Text></View></SafeAreaView>;

  const gain = property.currentValue - property.purchasePrice;
  const gainPct = ((gain / property.purchasePrice) * 100).toFixed(1);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.titleRow}>
            <Text style={styles.propName}>{property.name}</Text>
            <View style={styles.typeTag}><Text style={styles.typeText}>{typeMap[property.type] || property.type}</Text></View>
          </View>
          <Text style={styles.address}>{property.address}</Text>
          <Text style={styles.date}>购入于 {property.purchaseDate}</Text>
        </View>

        <View style={styles.valueSection}>
          <View style={styles.valueRow}>
            <View style={styles.valueCard}>
              <Text style={styles.valueLabel}>购入价格</Text>
              <Text style={styles.valueAmount}>¥{property.purchasePrice.toLocaleString()}</Text>
            </View>
            <View style={styles.valueCard}>
              <Text style={styles.valueLabel}>当前估值</Text>
              <Text style={styles.valueAmountGold}>¥{property.currentValue.toLocaleString()}</Text>
            </View>
          </View>
          <LinearGradient colors={gain >= 0 ? ['rgba(94,184,138,0.15)', 'rgba(94,184,138,0.05)'] : ['rgba(232,124,109,0.15)', 'rgba(232,124,109,0.05)']} style={styles.gainCard}>
            <Text style={styles.gainLabel}>账面收益</Text>
            <Text style={[styles.gainValue, { color: gain >= 0 ? colors.accent.jade : colors.accent.coral }]}>
              {gain >= 0 ? '+' : ''}¥{gain.toLocaleString()} ({gainPct}%)
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 税务记录</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TaxCenter')}><Text style={styles.linkText}>查看全部 →</Text></TouchableOpacity>
          </View>
          {taxRecords.length > 0 ? taxRecords.slice(0, 3).map((r) => {
            const s = statusMap[r.status] || statusMap.pending;
            return (
              <View key={r.id} style={styles.taxCard}>
                <View style={styles.taxRow}>
                  <Text style={styles.taxYear}>{r.year}年</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}><Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text></View>
                </View>
                <Text style={styles.taxAmount}>¥{r.amount.toLocaleString()}</Text>
                <Text style={styles.taxDue}>截止 {r.dueDate}</Text>
              </View>
            );
          }) : <Text style={styles.emptyHint}>暂无税务记录</Text>}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('EditProperty', { propertyId })}>
            <LinearGradient colors={['#E8B86D', '#D4956A']} style={styles.editBtn}><Text style={styles.editBtnText}>编辑房产信息</Text></LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}><Text style={styles.deleteBtnText}>删除房产</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.text.tertiary, fontSize: fontSize.md },
  headerSection: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  propName: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text.primary, flex: 1 },
  typeTag: { backgroundColor: colors.status.pendingBg, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full },
  typeText: { fontSize: fontSize.xs, color: colors.accent.gold, fontWeight: '600' },
  address: { fontSize: fontSize.md, color: colors.text.secondary, marginBottom: 4 },
  date: { fontSize: fontSize.sm, color: colors.text.tertiary },
  valueSection: { padding: spacing.xl },
  valueRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  valueCard: { flex: 1, backgroundColor: colors.bg.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border.subtle },
  valueLabel: { fontSize: fontSize.xs, color: colors.text.tertiary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing.sm },
  valueAmount: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text.primary },
  valueAmountGold: { fontSize: fontSize.xl, fontWeight: '700', color: colors.accent.gold },
  gainCard: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border.subtle },
  gainLabel: { fontSize: fontSize.xs, color: colors.text.tertiary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing.sm },
  gainValue: { fontSize: fontSize.xxl, fontWeight: '800' },
  section: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text.primary },
  linkText: { fontSize: fontSize.sm, color: colors.accent.gold, fontWeight: '600' },
  taxCard: { backgroundColor: colors.bg.card, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border.subtle },
  taxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  taxYear: { fontSize: fontSize.md, fontWeight: '600', color: colors.text.primary },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: radius.full },
  statusText: { fontSize: fontSize.xs, fontWeight: '600' },
  taxAmount: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  taxDue: { fontSize: fontSize.xs, color: colors.text.tertiary },
  emptyHint: { fontSize: fontSize.md, color: colors.text.tertiary, textAlign: 'center', paddingVertical: spacing.xxl },
  actions: { padding: spacing.xl, paddingBottom: spacing.huge },
  editBtn: { paddingVertical: 16, borderRadius: radius.lg, alignItems: 'center', ...shadow.card },
  editBtnText: { color: colors.bg.primary, fontSize: fontSize.lg, fontWeight: '700' },
  deleteBtn: { marginTop: spacing.md, paddingVertical: 16, borderRadius: radius.lg, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(232,124,109,0.4)' },
  deleteBtnText: { color: colors.accent.coral, fontSize: fontSize.md, fontWeight: '600' },
});
