import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Property, RootStackParamList } from '../types';
import { propertyService } from '../services/property';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyList'>;

export default function PropertyListScreen({ navigation }: Props) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadProperties(); }, []);

  const loadProperties = async () => {
    try { setProperties(await propertyService.getList()); }
    catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  const typeMap: Record<string, string> = { apartment: '公寓', house: '别墅', land: '土地', commercial: '商铺', other: '其他' };

  const renderProperty = ({ item, index }: { item: Property; index: number }) => {
    const gain = item.currentValue - item.purchasePrice;
    const gainPct = ((gain / item.purchasePrice) * 100).toFixed(1);
    return (
      <TouchableOpacity
        style={[styles.card, index === 0 && styles.cardFirst]}
        onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardName}>{item.name}</Text>
            <View style={styles.typeTag}>
              <Text style={styles.typeText}>{typeMap[item.type] || item.type}</Text>
            </View>
          </View>
          <Text style={styles.cardAddress}>{item.address}</Text>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.cardFooter}>
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>购入价格</Text>
            <Text style={styles.priceValue}>¥{item.purchasePrice.toLocaleString()}</Text>
          </View>
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>当前估值</Text>
            <Text style={styles.priceValueGold}>¥{item.currentValue.toLocaleString()}</Text>
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
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏠</Text>
            <Text style={styles.emptyText}>暂无房产</Text>
            <Text style={styles.emptySubtext}>添加您的第一套海外房产</Text>
          </View>
        ) : null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProperties(); }} tintColor={colors.accent.gold} />}
      />
      <TouchableOpacity style={styles.addBtnWrap} activeOpacity={0.9} onPress={() => navigation.navigate('AddProperty')}>
        <LinearGradient colors={['#E8B86D', '#D4956A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ 添加房产</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  list: { padding: spacing.xl, paddingBottom: 100 },
  card: { backgroundColor: colors.bg.card, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border.subtle, ...shadow.card },
  cardFirst: { borderColor: colors.border.accent },
  cardHeader: { marginBottom: spacing.md },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text.primary, flex: 1 },
  typeTag: { backgroundColor: colors.status.pendingBg, paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: radius.full },
  typeText: { fontSize: fontSize.xs, color: colors.accent.gold, fontWeight: '600' },
  cardAddress: { fontSize: fontSize.sm, color: colors.text.tertiary },
  cardDivider: { height: 1, backgroundColor: colors.border.subtle, marginVertical: spacing.md },
  cardFooter: { flexDirection: 'row', alignItems: 'flex-end' },
  priceCol: { flex: 1 },
  priceLabel: { fontSize: fontSize.xs, color: colors.text.tertiary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
  priceValue: { fontSize: fontSize.md, fontWeight: '600', color: colors.text.secondary },
  priceValueGold: { fontSize: fontSize.md, fontWeight: '700', color: colors.accent.gold },
  gainBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm },
  gainPositive: { backgroundColor: colors.status.paidBg },
  gainNegative: { backgroundColor: colors.status.overdueBg },
  gainText: { fontSize: fontSize.sm, fontWeight: '700' },
  gainTextPositive: { color: colors.accent.jade },
  gainTextNegative: { color: colors.accent.coral },
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyIcon: { fontSize: 56, marginBottom: spacing.lg },
  emptyText: { fontSize: fontSize.xl, color: colors.text.secondary, fontWeight: '600' },
  emptySubtext: { fontSize: fontSize.sm, color: colors.text.tertiary, marginTop: spacing.sm },
  addBtnWrap: { position: 'absolute', bottom: 24, left: spacing.xl, right: spacing.xl },
  addBtn: { paddingVertical: 16, borderRadius: radius.lg, alignItems: 'center', ...shadow.elevated },
  addBtnText: { color: colors.bg.primary, fontSize: fontSize.lg, fontWeight: '700', letterSpacing: 0.5 },
});
