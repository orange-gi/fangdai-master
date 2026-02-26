import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Document, RootStackParamList } from '../types';
import { documentService } from '../services/document';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DocumentList'>;

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

export default function DocumentListScreen({ navigation }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadDocuments(); }, []);

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

  const onRefresh = () => { setRefreshing(true); loadDocuments(); };

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
    const typeName = DOC_TYPE_NAME[item.type] || DOC_TYPE_NAME.other;
    const expired = isExpired(item.expiryDate);
    const expiringSoon = !expired && isExpiringSoon(item.expiryDate);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          <Text style={styles.typeLabel}>{typeName}</Text>
          {expired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredText}>已过期</Text>
            </View>
          )}
          {expiringSoon && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningText}>即将到期</Text>
            </View>
          )}
        </View>
        <Text style={styles.docName} numberOfLines={1}>{item.name}</Text>
        {item.number && <Text style={styles.docNumber}>{item.number}</Text>}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.primary} />
        }
      />
      <TouchableOpacity
        style={styles.addBtn}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddDocument', {})}
      >
        <Text style={styles.addBtnText}>添加证件</Text>
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
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: '500',
    flex: 1,
  },
  expiredBadge: {
    backgroundColor: colors.status.expiredBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  expiredText: {
    color: colors.accent.coral,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  warningBadge: {
    backgroundColor: colors.status.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  warningText: {
    color: colors.accent.gold,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  docName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  docNumber: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  addBtn: {
    position: 'absolute',
    bottom: 24,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.accent.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  addBtnText: {
    color: colors.text.inverse,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
