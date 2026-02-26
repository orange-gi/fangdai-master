import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Document, RootStackParamList } from '../types';
import { documentService } from '../services/document';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DocumentList'>;

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

export default function DocumentListScreen({ navigation }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const result = await documentService.getList();
      setDocuments(result);
    } catch (error) {
      console.error('加载证件失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDocuments();
  };

  const isExpired = (expiryDate?: string): boolean => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate?: string): boolean => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const days = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 90;
  };

  const renderDocument = ({ item }: { item: Document }) => {
    const typeInfo = DOC_TYPE_MAP[item.type] || DOC_TYPE_MAP.other;
    const expired = isExpired(item.expiryDate);
    const expiringSoon = !expired && isExpiringSoon(item.expiryDate);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardRow}>
          <View style={styles.iconContainer}>
            <Text style={styles.docIcon}>{typeInfo.icon}</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.docName} numberOfLines={1}>{item.name}</Text>
              {expired && (
                <View style={styles.expiredBadge}>
                  <Text style={styles.expiredBadgeText}>已过期</Text>
                </View>
              )}
              {expiringSoon && (
                <View style={styles.warningBadge}>
                  <Text style={styles.warningBadgeText}>即将到期</Text>
                </View>
              )}
            </View>
            <Text style={styles.docType}>{typeInfo.name}</Text>
            {item.number && (
              <Text style={styles.docNumber}>{item.number}</Text>
            )}
          </View>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📄</Text>
      <Text style={styles.emptyText}>暂无证件</Text>
      <Text style={styles.emptySubtext}>点击下方按钮添加您的第一份证件</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={renderDocument}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.violet}
          />
        }
      />
      <TouchableOpacity
        style={styles.addBtnWrap}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('AddDocument', {})}
      >
        <LinearGradient
          colors={['#9B7CE8', '#8060C8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ 添加证件</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  list: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadow.card,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  docIcon: {
    fontSize: 26,
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  docName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  docType: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  docNumber: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  expiredBadge: {
    backgroundColor: colors.status.expiredBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  expiredBadgeText: {
    color: colors.accent.coral,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  warningBadge: {
    backgroundColor: colors.status.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  warningBadgeText: {
    color: colors.accent.gold,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.xl,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  addBtnWrap: {
    position: 'absolute',
    bottom: 24,
    left: spacing.xl,
    right: spacing.xl,
  },
  addBtn: {
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadow.elevated,
  },
  addBtnText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
