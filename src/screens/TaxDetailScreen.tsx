import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TaxRecord, RootStackParamList } from '../types';
import { taxService } from '../services/tax';
import { propertyService } from '../services/property';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TaxDetail'>;

const TAX_TYPE_MAP: Record<string, string> = {
  income: '所得税',
  property: '房产税',
  'capital-gain': '资本利得税',
  other: '其他',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待缴纳', color: colors.status.pending, bg: colors.status.pendingBg },
  paid: { label: '已缴纳', color: colors.status.paid, bg: colors.status.paidBg },
  overdue: { label: '逾期', color: colors.status.overdue, bg: colors.status.overdueBg },
};

export default function TaxDetailScreen({ navigation, route }: Props) {
  const { taxId } = route.params;
  const [record, setRecord] = useState<TaxRecord | null>(null);
  const [propertyName, setPropertyName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [taxId]);

  const loadData = async () => {
    try {
      const taxData = await taxService.get(taxId);
      setRecord(taxData);
      if (taxData) {
        const prop = await propertyService.get(taxData.propertyId);
        if (prop) setPropertyName(prop.name);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = () => {
    if (!record) return;
    Alert.alert('确认', '确定标记为已缴纳？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          try {
            await taxService.markPaid(record.id);
            loadData();
          } catch {
            Alert.alert('失败', '操作失败，请重试');
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这条税务记录吗？此操作不可恢复。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await taxService.delete(taxId);
            navigation.goBack();
          } catch {
            Alert.alert('失败', '删除失败');
          }
        },
      },
    ]);
  };

  if (loading || !record) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = STATUS_CONFIG[record.status] || STATUS_CONFIG.pending;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
          </View>

          <Text style={styles.amount}>¥{record.amount.toLocaleString()}</Text>
          <Text style={styles.taxType}>{TAX_TYPE_MAP[record.taxType] || record.taxType}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>详细信息</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>关联房产</Text>
              <Text style={styles.infoValue}>{propertyName || '未知'}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>税务年度</Text>
              <Text style={styles.infoValue}>{record.year}年</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>税种类型</Text>
              <Text style={styles.infoValue}>{TAX_TYPE_MAP[record.taxType] || record.taxType}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>截止日期</Text>
              <Text style={styles.infoValue}>{record.dueDate}</Text>
            </View>

            {record.paidDate && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>缴纳日期</Text>
                  <Text style={[styles.infoValue, { color: colors.accent.primary }]}>
                    {record.paidDate}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          {record.status === 'pending' && (
            <TouchableOpacity style={styles.payBtn} activeOpacity={0.8} onPress={handleMarkPaid}>
              <Text style={styles.payBtnText}>标记已缴纳</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>删除记录</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: { color: colors.text.tertiary, fontSize: fontSize.md },

  header: {
    padding: spacing.xxl,
    paddingTop: spacing.xxxl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  amount: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  taxType: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
  },

  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: '500',
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadow.card,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  infoLabel: {
    fontSize: fontSize.md,
    color: colors.text.tertiary,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },

  actions: {
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
  payBtn: {
    backgroundColor: colors.accent.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadow.card,
  },
  payBtnText: {
    color: colors.text.inverse,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  deleteBtn: {
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent.coralLight,
  },
  deleteBtnText: {
    color: colors.accent.coral,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});
