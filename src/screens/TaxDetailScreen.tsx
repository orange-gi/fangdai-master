import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TaxRecord, RootStackParamList } from '../types';
import { taxService } from '../services/tax';
import { propertyService } from '../services/property';

type Props = NativeStackScreenProps<RootStackParamList, 'TaxDetail'>;

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
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!record) return;
    Alert.alert('确认', '确定标记为已缴纳？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          try {
            await taxService.markPaid(record.id);
            loadData();
          } catch (error) {
            Alert.alert('失败', '操作失败，请重试');
          }
        },
      },
    ]);
  };

  const handleDelete = async () => {
    Alert.alert('确认删除', '确定要删除这条税务记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await taxService.delete(taxId);
            navigation.goBack();
          } catch (error) {
            Alert.alert('失败', '删除失败');
          }
        },
      },
    ]);
  };

  const getTaxTypeName = (type: string) => {
    const map: Record<string, string> = {
      income: '所得税', property: '房产税', 'capital-gain': '资本利得税', other: '其他',
    };
    return map[type] || type;
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { name: string; color: string; bg: string }> = {
      pending: { name: '待缴纳', color: '#ff9800', bg: '#fff3e0' },
      paid: { name: '已缴纳', color: '#4caf50', bg: '#e8f5e9' },
      overdue: { name: '逾期', color: '#f44336', bg: '#ffebee' },
    };
    return map[status] || { name: status, color: '#999', bg: '#f5f5f5' };
  };

  if (loading || !record) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(record.status);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.header}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.name}</Text>
          </View>
          <Text style={styles.amount}>¥{record.amount.toLocaleString()}</Text>
          <Text style={styles.taxType}>{getTaxTypeName(record.taxType)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>详细信息</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>关联房产</Text>
            <Text style={styles.infoValue}>{propertyName || '未知'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>税务年度</Text>
            <Text style={styles.infoValue}>{record.year}年</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>截止日期</Text>
            <Text style={styles.infoValue}>{record.dueDate}</Text>
          </View>
          {record.paidDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>缴纳日期</Text>
              <Text style={[styles.infoValue, { color: '#4caf50' }]}>{record.paidDate}</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {record.status === 'pending' && (
            <TouchableOpacity style={styles.payButton} onPress={handleMarkPaid}>
              <Text style={styles.payButtonText}>标记已缴纳</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>删除记录</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#fff', padding: 24, alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, marginBottom: 16,
  },
  statusText: { fontSize: 14, fontWeight: '600' },
  amount: { fontSize: 36, fontWeight: '700', color: '#333', marginBottom: 8 },
  taxType: { fontSize: 16, color: '#666' },
  section: { backgroundColor: '#fff', marginTop: 12, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 15, color: '#999' },
  infoValue: { fontSize: 15, color: '#333', fontWeight: '500' },
  actions: { padding: 16 },
  payButton: {
    backgroundColor: '#2e7d32', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 12,
  },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#f44336',
    paddingVertical: 16, borderRadius: 12, alignItems: 'center',
  },
  deleteButtonText: { color: '#f44336', fontSize: 16, fontWeight: '600' },
});
