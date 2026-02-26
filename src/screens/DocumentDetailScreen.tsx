import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Document, RootStackParamList } from '../types';
import { documentService } from '../services/document';

type Props = NativeStackScreenProps<RootStackParamList, 'DocumentDetail'>;

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
    Alert.alert('确认删除', '确定要删除此证件吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await documentService.delete(documentId);
            navigation.goBack();
          } catch (error) {
            Alert.alert('删除失败', '请稍后重试');
          }
        },
      },
    ]);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  if (loading || !doc) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#ff9800" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const typeInfo = DOC_TYPE_MAP[doc.type] || DOC_TYPE_MAP.other;
  const daysLeft = doc.expiryDate ? getDaysUntilExpiry(doc.expiryDate) : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>{typeInfo.icon}</Text>
          <Text style={styles.headerName}>{doc.name}</Text>
          <Text style={styles.headerType}>{typeInfo.name}</Text>
        </View>

        {daysLeft !== null && (
          <View style={[styles.expiryBanner, daysLeft < 0 ? styles.expiredBanner : daysLeft <= 90 ? styles.warningBanner : styles.normalBanner]}>
            <Text style={styles.expiryText}>
              {daysLeft < 0
                ? `⚠️ 已过期 ${Math.abs(daysLeft)} 天`
                : daysLeft <= 90
                ? `⏰ 还有 ${daysLeft} 天到期`
                : `✅ 有效期剩余 ${daysLeft} 天`}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>证件信息</Text>
          {doc.number && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>证件编号</Text>
              <Text style={styles.infoValue}>{doc.number}</Text>
            </View>
          )}
          {doc.issueDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>签发日期</Text>
              <Text style={styles.infoValue}>{doc.issueDate}</Text>
            </View>
          )}
          {doc.expiryDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>到期日期</Text>
              <Text style={styles.infoValue}>{doc.expiryDate}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>关联房产ID</Text>
            <Text style={styles.infoValue}>{doc.propertyId}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>删除证件</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', padding: 24, alignItems: 'center' },
  headerIcon: { fontSize: 48, marginBottom: 12 },
  headerName: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 4, textAlign: 'center' },
  headerType: { fontSize: 14, color: '#666' },
  expiryBanner: { marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 12, alignItems: 'center' },
  expiredBanner: { backgroundColor: '#ffebee' },
  warningBanner: { backgroundColor: '#fff3e0' },
  normalBanner: { backgroundColor: '#e8f5e9' },
  expiryText: { fontSize: 15, fontWeight: '600', color: '#333' },
  section: { backgroundColor: '#fff', marginTop: 12, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 15, color: '#999' },
  infoValue: { fontSize: 15, color: '#333', fontWeight: '500' },
  actions: { padding: 16 },
  deleteButton: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#f44336',
    paddingVertical: 16, borderRadius: 12, alignItems: 'center',
  },
  deleteButtonText: { color: '#f44336', fontSize: 16, fontWeight: '600' },
});
