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
import { Property, RootStackParamList } from '../types';
import { propertyService } from '../services/property';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyList'>;

const TYPE_MAP: Record<string, string> = {
  apartment: '公寓',
  house: '别墅',
  land: '土地',
  commercial: '商铺',
  other: '其他',
};

export default function PropertyListScreen({ navigation }: Props) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setProperties(await propertyService.getList());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderProperty = ({ item }: { item: Property }) => {
    const gain = item.currentValue - item.purchasePrice;
    const gainPct = ((gain / item.purchasePrice) * 100).toFixed(1);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{TYPE_MAP[item.type] || item.type}</Text>
          </View>
        </View>
        <Text style={styles.cardAddress}>{item.address}</Text>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>购入价格</Text>
            <Text style={styles.priceValue}>¥{item.purchasePrice.toLocaleString()}</Text>
          </View>
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>当前估值</Text>
            <Text style={styles.priceValueAccent}>¥{item.currentValue.toLocaleString()}</Text>
          </View>
          <View style={[styles.gainBadge, gain >= 0 ? styles.gainPositive : styles.gainNegative]}>
            <Text style={[styles.gainText, gain >= 0 ? styles.gainTextPositive : styles.gainTextNegative]}>
              {gain >= 0 ? '+' : ''}{gainPct}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderProperty}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>暂无房产</Text>
              <Text style={styles.emptySubtext}>添加您的第一套海外房产</Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProperties();
            }}
            tintColor={colors.accent.primary}
          />
        }
      />
      <TouchableOpacity
        style={styles.addBtn}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddProperty')}
      >
        <Text style={styles.addBtnText}>添加房产</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  list: { padding: spacing.xl, paddingBottom: 100 },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  typeTag: {
    backgroundColor: colors.accent.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  typeText: {
    fontSize: fontSize.xs,
    color: colors.accent.primary,
    fontWeight: '500',
  },
  cardAddress: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priceCol: { flex: 1 },
  priceLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  priceValueAccent: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  gainBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  gainPositive: { backgroundColor: colors.accent.primaryLight },
  gainNegative: { backgroundColor: colors.accent.coralLight },
  gainText: { fontSize: fontSize.sm, fontWeight: '600' },
  gainTextPositive: { color: colors.accent.primary },
  gainTextNegative: { color: colors.accent.coral },
  empty: { alignItems: 'center', paddingTop: 100 },
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
    ...shadow.card,
  },
  addBtnText: {
    color: colors.text.inverse,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
