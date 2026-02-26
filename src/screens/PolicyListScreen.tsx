import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
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

const CATEGORY_ICONS: Record<string, string> = {
  tax: '💰', property: '🏠', immigration: '✈️', law: '⚖️',
};

const CATEGORY_COLORS: Record<string, string> = {
  tax: colors.accent.gold,
  property: colors.accent.sky,
  immigration: colors.accent.violet,
  law: colors.accent.coral,
};

export default function PolicyListScreen({ navigation }: Props) {
  const [articles, setArticles] = useState<PolicyArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<PolicyCategory | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadArticles();
  }, [filter]);

  const loadArticles = async () => {
    try {
      if (searchText.trim()) {
        const result = await policyService.search(searchText);
        setArticles(result);
      } else {
        const result = await policyService.getList(
          filter === 'all' ? undefined : filter
        );
        setArticles(result);
      }
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadArticles();
  };

  const handleSearch = () => {
    setLoading(true);
    loadArticles();
  };

  const renderArticle = ({ item }: { item: PolicyArticle }) => {
    const catColor = CATEGORY_COLORS[item.category] || colors.accent.gold;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('PolicyDetail', { articleId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.categoryTag, { backgroundColor: catColor + '18' }]}>
            <Text style={styles.categoryIcon}>{CATEGORY_ICONS[item.category] || '📰'}</Text>
            <Text style={[styles.categoryText, { color: catColor }]}>
              {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
            </Text>
          </View>
          <Text style={styles.date}>{item.publishedAt}</Text>
        </View>
        <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.articleSummary} numberOfLines={3}>{item.summary}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.source}>{item.source}</Text>
          <Text style={styles.readMore}>阅读全文 →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyText}>暂无政策资讯</Text>
      <Text style={styles.emptySubtext}>下拉刷新试试</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
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
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        {CATEGORIES.map((c) => {
          const isActive = filter === c.value;
          return isActive ? (
            <LinearGradient
              key={c.value}
              colors={[colors.accent.gold, colors.gradient.goldEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.filterBtnGradient}
            >
              <TouchableOpacity onPress={() => setFilter(c.value)}>
                <Text style={styles.filterTextActive}>{c.label}</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <TouchableOpacity
              key={c.value}
              style={styles.filterBtn}
              onPress={() => setFilter(c.value)}
            >
              <Text style={styles.filterText}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={renderArticle}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.gold}
            colors={[colors.accent.gold]}
          />
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
    backgroundColor: colors.bg.input,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  searchIcon: {
    fontSize: fontSize.md,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  clearBtn: {
    fontSize: fontSize.md,
    color: colors.text.tertiary,
    padding: spacing.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  filterBtnGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  filterTextActive: {
    fontSize: fontSize.sm,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  categoryIcon: {
    fontSize: fontSize.sm,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
  },
  articleTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  articleSummary: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.md,
  },
  source: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
  },
  readMore: {
    fontSize: fontSize.xs,
    color: colors.accent.gold,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.huge * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
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
