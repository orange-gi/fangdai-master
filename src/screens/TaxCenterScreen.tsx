import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TaxRecord, RootStackParamList } from '../types';
import { taxService } from '../services/tax';

type Props = NativeStackScreenProps<RootStackParamList, 'TaxCenter'>;

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [listData, statsData] = await Promise.all([
        taxService.getList(),
        taxService.getStats(),
      ]);
      setRecords(listData);
      setStats(statsData);
    } catch (error) {
      console.error('加载税务记录失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getFilteredRecords = () => {
    if (filter === 'all') return records;
    return records.filter(r => r.status === filter);
  };

  const getTaxTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      income: '所得税',
      property: '房产税',
      'capital-gain': '资本利得税',
      other: '其他',
    };
    return typeMap[type] || type;
  };

  const getStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待缴纳',
      paid: '已缴纳',
      overdue: '逾期',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: '#ff9800',
      paid: '#4caf50',
      overdue: '#f44336',
    };
    return colorMap[status] || '#999';
  };

  const renderRecord = ({ item }: { item: TaxRecord }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TaxDetail', { taxId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.taxType}>{getTaxTypeName(item.taxType)}</Text>
          <Text style={styles.year}>{item.year}年</Text>
        </View>
        <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusName(item.status)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.amount}>¥{item.amount.toLocaleString()}</Text>
      <Text style={styles.dueDate}>截止日期: {item.dueDate}</Text>
      
      {item.status === 'pending' && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={async () => {
            try {
              await taxService.markPaid(item.id);
              loadData();
            } catch (error) {
              console.error('标记缴纳失败:', error);
            }
          }}
        >
          <Text style={styles.payButtonText}>标记已缴纳</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>暂无税务记录</Text>
    </View>
  );

  const filteredRecords = getFilteredRecords();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* 统计卡片 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>待缴纳</Text>
          <Text style={[styles.statValue, styles.pendingValue]}>
            ¥{stats.pendingAmount.toLocaleString()}
          </Text>
          <Text style={styles.statCount}>{stats.pendingCount}笔</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>已缴纳</Text>
          <Text style={[styles.statValue, styles.paidValue]}>
            ¥{stats.paidAmount.toLocaleString()}
          </Text>
          <Text style={styles.statCount}>{stats.paidCount}笔</Text>
        </View>
      </View>

      {/* AI 咨询入口 */}
      <TouchableOpacity
        style={styles.aiButton}
        onPress={() => navigation.navigate('TaxConsultation')}
      >
        <Text style={styles.aiButtonText}>🤖 AI 税务咨询</Text>
      </TouchableOpacity>

      {/* 筛选 */}
      <View style={styles.filterContainer}>
        {(['all', 'pending', 'paid'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? '全部' : f === 'pending' ? '待缴纳' : '已缴纳'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderRecord}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  pendingValue: {
    color: '#ff9800',
  },
  paidValue: {
    color: '#4caf50',
  },
  statCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  aiButton: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  aiButtonText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#2e7d32',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taxType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  year: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  dueDate: {
    fontSize: 14,
    color: '#999',
  },
  payButton: {
    marginTop: 12,
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
