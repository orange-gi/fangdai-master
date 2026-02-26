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

const DOC_TYPE_MAP: Record<string, { icon: string; name: string }> = {
  deed: { icon: '🏠', name: '房产证' },
  contract: { icon: '📝', name: '购房合同' },
  id: { icon: '🪪', name: '身份证' },
  passport: { icon: '📕', name: '护照' },
  visa: { icon: '✈️', name: '签证' },
  tax: { icon: '💰', name: '税单' },
  insurance: { icon: '🛡️', name: '保险' },
  other: { icon: '📎', name: '其他' },
};

export default function DocumentDetailScreen({ navigation, route }: Props) {
  const { documentId } = route.params;
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

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

  const getExpiryConfig = (days: number) => {
    if (days < 0) {
      return {
        bgColor: colors.status.expiredBg,
        textColor: colors.accent.coral,
        borderColor: 'rgba(232,124,109,0.20)',
        label: `⚠️ 已过期 ${Math.abs(days)} 天`,
      };
    }
    if (days <= 90) {
      return {
        bgColor: colors.status.warningBg,
        textColor: colors.accent.gold,
        borderColor: 'rgba(232,184,109,0.20)',
        label: `⏰ 还有 ${days} 天到期`,
      };
    }
    return {
      bgColor: colors.status.safeBg,
      textColor: colors.accent.jade,
      borderColor: 'rgba(94,184,138,0.20)',
      label: `✅ 有效期剩余 ${days} 天`,
    };
  };

  if (loading || !doc) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={colors.accent.violet}
          style={{ marginTop: spacing.huge }}
        />
      </SafeAreaView>
    );
  }

  const typeInfo = DOC_TYPE_MAP[doc.type] || DOC_TYPE_MAP.other;
  const daysLeft = doc.expiryDate ? getDaysUntilExpiry(doc.expiryDate) : null;
  const expiryConfig = daysLeft !== null ? getExpiryConfig(daysLeft) : null;

  const infoRows: { label: string; value: string }[] = [];
  if (doc.number) infoRows.push({ label: '证件编号', value: doc.number });
  if (doc.issueDate) infoRows.push({ label: '签发日期', value: doc.issueDate });
  if (doc.expiryDate) infoRows.push({ label: '到期日期', value: doc.expiryDate });
  infoRows.push({ label: '关联房产ID', value: doc.propertyId });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.headerIcon}>{typeInfo.icon}</Text>
          </View>
          <Text style={styles.headerName}>{doc.name}</Text>
          <Text style={styles.headerType}>{typeInfo.name}</Text>
        </View>

        {expiryConfig && (
          <View
            style={[
              styles.expiryBanner,
              {
                backgroundColor: expiryConfig.bgColor,
                borderColor: expiryConfig.borderColor,
              },
            ]}
          >
            <Text style={[styles.expiryText, { color: expiryConfig.textColor }]}>
              {expiryConfig.label}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>证件信息</Text>
          {infoRows.map((row, index) => (
            <View
              key={row.label}
              style={[
                styles.infoRow,
                index < infoRows.length - 1 && styles.infoRowBorder,
              ]}
            >
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.85}
          >
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
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.xxl,
    backgroundColor: colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadow.card,
  },
  headerIcon: {
    fontSize: 40,
  },
  headerName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  headerType: {
    fontSize: fontSize.md,
    color: colors.text.tertiary,
  },
  expiryBanner: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  expiryText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  section: {
    backgroundColor: colors.bg.card,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadow.card,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: spacing.lg,
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
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: 'rgba(232,124,109,0.30)',
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.accent.coral,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
