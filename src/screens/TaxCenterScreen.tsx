import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TaxRecord, RootStackParamList } from '../types';
import { taxService } from '../services/tax';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TaxCenter'>;

const TAX_TYPE_MAP: Record<string, string> = {
  income: '所得税',
  property: '房产税',
  'capital-gain': '资本利得税',
  other: '其他',
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待缴纳', color: colors.status.pending, bg: colors.status.pendingBg },
  paid: { label: '已缴纳', color: colors.status.paid, bg: colors.status.paidBg },
  overdue: { label: '逾期', color: colors.status.overdue, bg: colors.status.overdueBg },
};

const FILTERS: { key: 'all' | 'pending' | 'paid'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待缴纳' },
  { key: 'paid', label: '已缴纳' },
];

export default function TaxCenterScreen({ navigation }: Props) {
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [stats, setStats] = useState({
    pendingAmount: 0,
    paidAmount: 0,
    pendingCount: 0,
    paidCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const loadData = useCallback(async () => {
    try {
      const [listData, statsData] = await Promise.all([
        taxService.getList(),
        taxService.getStats(),
      ]);
      setRecords(listData);
      setStats(statsData);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRecords = filter === 'all' ? records : records.filter((r) => r.status === filter);

  const handleMarkPaid = async (id: string) => {
    try {
      await taxService.markPaid(id);
      loadData();
    } catch {
      /* ignore */
    }
  };

  const renderHeader = () => (
    <View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>待缴纳</Text>
          <Text style={styles.statValuePending}>¥{stats.pendingAmount.toLocaleString()}</Text>
          <Text style={styles.statCount}>{stats.pendingCount} 笔</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>已缴纳</Text>
          <Text style={styles.statValuePaid}>¥{stats.paidAmount.toLocaleString()}</Text>
          <Text style={styles.statCount}>{stats.paidCount} 笔</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.aiBtn}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TaxConsultation')}
      >
        <View>
          <Text style={styles.aiTitle}>AI 税务咨询</Text>
          <Text style={styles.aiSubtitle}>智能分析 · 专业建议</Text>
        </View>
        <Text style={styles.aiArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRecord = ({ item }: { item: TaxRecord }) => {
    const status = STATUS_MAP[item.status] || STATUS_MAP.pending;
    return (
      <TouchableOpacity
        style={styles.recordCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TaxDetail', { taxId: item.id })}
      >
        <View style={styles.recordHeader}>
          <View>
            <Text style={styles.recordType}>{TAX_TYPE_MAP[item.taxType] || item.taxType}</Text>
            <Text style={styles.recordYear}>{item.year}年</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.recordAmount}>¥{item.amount.toLocaleString()}</Text>

        <View style={styles.recordFooter}>
          <Text style={styles.recordDue}>截止日期: {item.dueDate}</Text>
          {item.paidDate && <Text style={styles.recordPaid}>已缴: {item.paidDate}</Text>}
        </View>

        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.markPaidBtn}
            activeOpacity={0.8}
            onPress={() => handleMarkPaid(item.id)}
          >
            <Text style={styles.markPaidText}>标记已缴纳</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderRecord}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>暂无税务记录</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor={colors.accent.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingBottom: spacing.huge },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadow.card,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  statValuePending: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.accent.gold,
    marginBottom: 2,
  },
  statValuePaid: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.accent.primary,
    marginBottom: 2,
  },
  statCount: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
  },

  aiBtn: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: colors.accent.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.card,
  },
  aiTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  aiSubtitle: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  aiArrow: {
    fontSize: fontSize.xl,
    color: colors.text.inverse,
  },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  filterTabActive: {
    backgroundColor: colors.accent.primaryLight,
    borderColor: colors.accent.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.accent.primary,
    fontWeight: '600',
  },

  recordCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadow.card,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  recordType: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  recordYear: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  recordAmount: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordDue: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  recordPaid: {
    fontSize: fontSize.sm,
    color: colors.accent.primary,
  },
  markPaidBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  markPaidText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: '600',
  },

  emptyWrap: {
    alignItems: 'center',
    paddingTop: spacing.huge,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.text.tertiary,
  },
});
