import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PolicyArticle, PolicyCategory, RootStackParamList } from '../types';
import { policyService } from '../services/policy';

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

  const renderArticle = ({ item }: { item: PolicyArticle }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PolicyDetail', { articleId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryIcon}>{CATEGORY_ICONS[item.category] || '📰'}</Text>
          <Text style={styles.categoryText}>
            {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
          </Text>
        </View>
        <Text style={styles.date}>{item.publishedAt}</Text>
      </View>
      <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.articleSummary} numberOfLines={3}>{item.summary}</Text>
      <Text style={styles.source}>{item.source}</Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyText}>暂无政策资讯</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索政策资讯..."
          placeholderTextColor="#999"
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
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[styles.filterBtn, filter === c.value && styles.filterBtnActive]}
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333', paddingVertical: 10 },
  clearBtn: { fontSize: 16, color: '#999', padding: 8 },
  filterContainer: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12, gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff',
  },
  filterBtnActive: { backgroundColor: '#9C27B0' },
  filterText: { fontSize: 13, color: '#666' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: 16, paddingTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  categoryTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  categoryIcon: { fontSize: 14 },
  categoryText: { fontSize: 12, color: '#9C27B0', fontWeight: '600' },
  date: { fontSize: 12, color: '#999' },
  articleTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 8, lineHeight: 24 },
  articleSummary: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 10 },
  source: { fontSize: 12, color: '#aaa' },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, color: '#999' },
});
