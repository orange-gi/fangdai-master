import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PolicyArticle, PolicyCategory, RootStackParamList } from '../types';
import { policyService } from '../services/policy';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PolicyList'>;

const CATEGORIES: { value: PolicyCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'tax', label: '税务' },
  { value: 'property', label: '房产' },
  { value: 'immigration', label: '移民' },
  { value: 'law', label: '法规' },
];

const CATEGORY_NAME: Record<string, string> = {
  tax: '税务', property: '房产', immigration: '移民', law: '法规',
};

export default function PolicyListScreen({ navigation }: Props) {
  const [articles, setArticles] = useState<PolicyArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<PolicyCategory | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => { loadArticles(); }, [filter]);

  const loadArticles = async () => {
    try {
      if (searchText.trim()) {
        const result = await policyService.search(searchText);
        setArticles(result);
      } else {
        const result = await policyService.getList(filter === 'all' ? undefined : filter);
        setArticles(result);
      }
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadArticles(); };

  const handleSearch = () => { setLoading(true); loadArticles(); };

  const renderArticle = ({ item }: { item: PolicyArticle }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('PolicyDetail', { articleId: item.id })}
    >
      <View style={styles.cardMeta}>
        <Text style={styles.categoryLabel}>{CATEGORY_NAME[item.category] || item.category}</Text>
        <Text style={styles.date}>{item.publishedAt}</Text>
      </View>
      <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.articleSummary} numberOfLines={3}>{item.summary}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.source}>{item.source}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>暂无政策资讯</Text>
      <Text style={styles.emptySubtext}>下拉刷新试试</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索政策资讯..."
          placeholderTextColor={colors.text.tertiary}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchText(''); setTimeout(loadArticles, 100); }}>
            <Text style={styles.clearBtn}>清除</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[styles.filterPill, filter === c.value && styles.filterPillActive]}
            onPress={() => setFilter(c.value)}
          >
            <Text style={[styles.filterText, filter === c.value && styles.filterTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={renderArticle}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.primary} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  clearBtn: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    padding: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  filterPillActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
  },
  articleTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  articleSummary: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.md,
  },
  source: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.huge * 2,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
