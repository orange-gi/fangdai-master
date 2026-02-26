import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Property, TaxRecord, RootStackParamList } from '../types';
import { propertyService } from '../services/property';
import { taxService } from '../services/tax';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyDetail'>;

export default function PropertyDetailScreen({ navigation, route }: Props) {
  const { propertyId } = route.params;
  const [property, setProperty] = useState<Property | null>(null);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    try {
      const [propData, taxData] = await Promise.all([
        propertyService.get(propertyId),
        taxService.getByProperty(propertyId),
      ]);
      setProperty(propData);
      setTaxRecords(taxData);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '确认删除',
      '确定要删除这套房产吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyService.delete(propertyId);
              navigation.goBack();
            } catch {
              Alert.alert('删除失败', '请稍后重试');
            }
          },
        },
      ]
    );
  };

  const getPropertyTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      apartment: '公寓',
      house: '别墅',
      land: '土地',
      commercial: '商业地产',
      other: '其他',
    };
    return typeMap[type] || type;
  };

  const getTaxStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待缴纳',
      paid: '已缴纳',
      overdue: '逾期',
    };
    return statusMap[status] || status;
  };

  const getTaxStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: '#ff9800',
      paid: '#4caf50',
      overdue: '#f44336',
    };
    return colorMap[status] || '#999';
  };

  if (loading || !property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const gain = property.currentValue - property.purchasePrice;
  const gainPercent = ((gain / property.purchasePrice) * 100).toFixed(1);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* 房产基本信息 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{property.name}</Text>
            <View style={styles.typeTag}>
              <Text style={styles.typeTagText}>{getPropertyTypeName(property.type)}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>地址</Text>
            <Text style={styles.infoValue}>{property.address}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>购入日期</Text>
            <Text style={styles.infoValue}>{property.purchaseDate}</Text>
          </View>
        </View>

        {/* 价值信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 价值信息</Text>
          
          <View style={styles.priceCard}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>购入价格</Text>
              <Text style={styles.priceValue}>¥{property.purchasePrice.toLocaleString()}</Text>
            </View>
            
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>当前估值</Text>
              <Text style={[styles.priceValue, styles.currentValue]}>
                ¥{property.currentValue.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>账面收益</Text>
              <Text style={[styles.priceValue, gain >= 0 ? styles.positive : styles.negative]}>
                {gain >= 0 ? '+' : ''}¥{gain.toLocaleString()} ({gainPercent}%)
              </Text>
            </View>
          </View>
        </View>

        {/* 税务记录 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 税务记录</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TaxCenter')}>
              <Text style={styles.linkText}>查看全部</Text>
            </TouchableOpacity>
          </View>
          
          {taxRecords.length > 0 ? (
            taxRecords.slice(0, 3).map((record) => (
              <View key={record.id} style={styles.taxCard}>
                <View style={styles.taxHeader}>
                  <Text style={styles.taxYear}>{record.year}年</Text>
                  <View style={[styles.statusTag, { backgroundColor: getTaxStatusColor(record.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getTaxStatusColor(record.status) }]}>
                      {getTaxStatusName(record.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.taxAmount}>¥{record.amount.toLocaleString()}</Text>
                <Text style={styles.taxDueDate}>截止日期: {record.dueDate}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>暂无税务记录</Text>
          )}
        </View>

        {/* 操作按钮 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProperty', { propertyId })}
          >
            <Text style={styles.editButtonText}>编辑房产信息</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>删除房产</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  typeTag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeTagText: {
    color: '#2e7d32',
    fontSize: 12,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currentValue: {
    color: '#2e7d32',
  },
  positive: {
    color: '#2e7d32',
  },
  negative: {
    color: '#f44336',
  },
  linkText: {
    color: '#2e7d32',
    fontSize: 14,
  },
  taxCard: {
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  taxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taxYear: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taxAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taxDueDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  editButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '500',
  },
});
