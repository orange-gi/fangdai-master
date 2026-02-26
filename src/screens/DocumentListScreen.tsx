import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Document, RootStackParamList } from '../types';
import { documentService } from '../services/document';

type Props = NativeStackScreenProps<RootStackParamList, 'DocumentList'>;

const DOC_TYPE_MAP: Record<string, { name: string; icon: string }> = {
  deed: { name: '房产证', icon: '🏠' },
  contract: { name: '购房合同', icon: '📝' },
  id: { name: '身份证', icon: '🪪' },
  passport: { name: '护照', icon: '📕' },
  visa: { name: '签证', icon: '✈️' },
  tax: { name: '税单', icon: '💰' },
  insurance: { name: '保险', icon: '🛡️' },
  other: { name: '其他', icon: '📎' },
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

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const days = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 90;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const renderDocument = ({ item }: { item: Document }) => {
    const typeInfo = DOC_TYPE_MAP[item.type] || DOC_TYPE_MAP.other;
    const expired = isExpired(item.expiryDate);
    const expiringSoon = isExpiringSoon(item.expiryDate);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.docIcon}>{typeInfo.icon}</Text>
        </View>
        <View style={styles.cardCenter}>
          <Text style={styles.docName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.docType}>{typeInfo.name}</Text>
          {item.number && <Text style={styles.docNumber}>编号: {item.number}</Text>}
        </View>
        <View style={styles.cardRight}>
          {expired && (
            <View style={[styles.badge, styles.expiredBadge]}>
              <Text style={styles.expiredText}>已过期</Text>
            </View>
          )}
          {expiringSoon && !expired && (
            <View style={[styles.badge, styles.warningBadge]}>
              <Text style={styles.warningText}>即将到期</Text>
            </View>
          )}
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📄</Text>
      <Text style={styles.emptyText}>暂无证件</Text>
      <Text style={styles.emptySubtext}>点击下方按钮添加证件</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddDocument', {})}
      >
        <Text style={styles.addButtonText}>+ 添加证件</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardLeft: { marginRight: 12 },
  docIcon: { fontSize: 32 },
  cardCenter: { flex: 1 },
  docName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  docType: { fontSize: 13, color: '#666', marginBottom: 2 },
  docNumber: { fontSize: 12, color: '#999' },
  cardRight: { alignItems: 'flex-end' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 4 },
  expiredBadge: { backgroundColor: '#ffebee' },
  expiredText: { color: '#f44336', fontSize: 11, fontWeight: '600' },
  warningBadge: { backgroundColor: '#fff3e0' },
  warningText: { color: '#ff9800', fontSize: 11, fontWeight: '600' },
  arrow: { fontSize: 22, color: '#ccc' },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, color: '#999', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#ccc' },
  addButton: {
    position: 'absolute', bottom: 24, left: 24, right: 24,
    backgroundColor: '#ff9800', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
