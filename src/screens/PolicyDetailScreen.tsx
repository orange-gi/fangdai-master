import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PolicyArticle, RootStackParamList } from '../types';
import { policyService } from '../services/policy';

type Props = NativeStackScreenProps<RootStackParamList, 'PolicyDetail'>;

const CATEGORY_MAP: Record<string, string> = {
  tax: '税务政策', property: '房产政策', immigration: '移民政策', law: '法律法规',
};

export default function PolicyDetailScreen({ route }: Props) {
  const { articleId } = route.params;
  const [article, setArticle] = useState<PolicyArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      const result = await policyService.get(articleId);
      setArticle(result);
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !article) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#9C27B0" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.meta}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{CATEGORY_MAP[article.category] || article.category}</Text>
            </View>
            <Text style={styles.date}>{article.publishedAt}</Text>
          </View>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.source}>来源: {article.source}</Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>📋 摘要</Text>
          <Text style={styles.summaryText}>{article.summary}</Text>
        </View>

        <View style={styles.contentBox}>
          {article.content.split('\n').map((paragraph, index) => (
            <Text key={index} style={paragraph.trim() === '' ? styles.spacer : styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollView: { flex: 1 },
  header: { backgroundColor: '#fff', padding: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  categoryTag: { backgroundColor: '#f3e5f5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { color: '#9C27B0', fontSize: 12, fontWeight: '600' },
  date: { fontSize: 13, color: '#999' },
  title: { fontSize: 22, fontWeight: '700', color: '#333', lineHeight: 30, marginBottom: 8 },
  source: { fontSize: 13, color: '#aaa' },
  summaryBox: {
    backgroundColor: '#fff', marginTop: 12, padding: 16,
    borderLeftWidth: 3, borderLeftColor: '#9C27B0',
  },
  summaryLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  summaryText: { fontSize: 15, color: '#555', lineHeight: 22 },
  contentBox: { backgroundColor: '#fff', marginTop: 12, padding: 20, marginBottom: 24 },
  paragraph: { fontSize: 16, color: '#333', lineHeight: 26, marginBottom: 4 },
  spacer: { height: 12 },
});
