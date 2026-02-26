import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Document, RootStackParamList } from '../types';
import { documentService } from '../services/document';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DocumentDetail'>;

const DOC_TYPE_NAME: Record<string, string> = {
  deed: '房产证',
  contract: '购房合同',
  id: '身份证',
  passport: '护照',
  visa: '签证',
  tax: '税单',
  insurance: '保险',
  other: '其他',
};

export default function DocumentDetailScreen({ navigation, route }: Props) {
  const { documentId } = route.params;
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDocument(); }, [documentId]);

  const loadDocument = async () => {
    try {
      const result = await documentService.get(documentId);
      setDoc(result);
    } catch (error) {
      console.error('加载证件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除此证件吗？此操作不可撤销。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await documentService.delete(documentId);
            navigation.goBack();
          } catch {
            Alert.alert('删除失败', '请稍后重试');
          }
        },
      },
    ]);
  };

  const getDaysUntilExpiry = (expiryDate: string): number => {
    return Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  };

  const getExpiryLabel = (days: number) => {
    if (days < 0) return { text: `已过期 ${Math.abs(days)} 天`, color: colors.accent.coral, bg: colors.status.expiredBg };
    if (days <= 90) return { text: `还有 ${days} 天到期`, color: colors.accent.gold, bg: colors.status.warningBg };
    return { text: `有效期剩余 ${days} 天`, color: colors.accent.primary, bg: colors.status.safeBg };
  };

  if (loading || !doc) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent.primary} style={{ marginTop: spacing.huge }} />
      </SafeAreaView>
    );
  }

  const typeName = DOC_TYPE_NAME[doc.type] || DOC_TYPE_NAME.other;
  const daysLeft = doc.expiryDate ? getDaysUntilExpiry(doc.expiryDate) : null;
  const expiryInfo = daysLeft !== null ? getExpiryLabel(daysLeft) : null;

  const infoRows: { label: string; value: string }[] = [];
  if (doc.number) infoRows.push({ label: '证件编号', value: doc.number });
  if (doc.issueDate) infoRows.push({ label: '签发日期', value: doc.issueDate });
  if (doc.expiryDate) infoRows.push({ label: '到期日期', value: doc.expiryDate });
  infoRows.push({ label: '关联房产ID', value: doc.propertyId });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.typeLabel}>{typeName}</Text>
          <Text style={styles.headerName}>{doc.name}</Text>
        </View>

        {expiryInfo && (
          <View style={[styles.expiryBanner, { backgroundColor: expiryInfo.bg }]}>
            <Text style={[styles.expiryText, { color: expiryInfo.color }]}>{expiryInfo.text}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>证件信息</Text>
          {infoRows.map((row, index) => (
            <View
              key={row.label}
              style={[styles.infoRow, index < infoRows.length - 1 && styles.infoRowBorder]}
            >
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
            <Text style={styles.deleteButtonText}>删除证件</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scrollContent: {
    paddingBottom: spacing.huge,
  },
  header: {
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  headerName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  expiryBanner: {
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  expiryText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.bg.card,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...shadow.card,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: '600',
    marginBottom: spacing.lg,
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  infoLabel: {
    fontSize: fontSize.md,
    color: colors.text.tertiary,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    fontWeight: '500',
  },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.accent.coral,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    backgroundColor: colors.bg.card,
  },
  deleteButtonText: {
    color: colors.accent.coral,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
