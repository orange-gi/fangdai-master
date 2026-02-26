import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PolicyArticle, RootStackParamList } from '../types';
import { policyService } from '../services/policy';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PolicyDetail'>;

const CATEGORY_NAME: Record<string, string> = {
  tax: '税务政策', property: '房产政策', immigration: '移民政策', law: '法律法规',
};

export default function PolicyDetailScreen({ route }: Props) {
  const { articleId } = route.params;
  const [article, setArticle] = useState<PolicyArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadArticle(); }, [articleId]);

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
        <ActivityIndicator size="large" color={colors.accent.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.meta}>
            <Text style={styles.categoryText}>
              {CATEGORY_NAME[article.category] || article.category}
            </Text>
            <Text style={styles.date}>{article.publishedAt}</Text>
          </View>
          <Text style={styles.title}>{article.title}</Text>
          <View style={styles.sourceRow}>
            <Text style={styles.sourceLabel}>来源</Text>
            <Text style={styles.sourceValue}>{article.source}</Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>摘要</Text>
          <Text style={styles.summaryText}>{article.summary}</Text>
        </View>

        <View style={styles.contentBox}>
          {article.content.split('\n').map((paragraph, index) => (
            <Text key={index} style={paragraph.trim() === '' ? styles.spacer : styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 34,
    marginBottom: spacing.md,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sourceLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  sourceValue: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  summaryBox: {
    backgroundColor: colors.accent.primaryLight,
    marginHorizontal: spacing.xl,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  contentBox: {
    backgroundColor: colors.bg.card,
    marginTop: spacing.md,
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.md,
    ...shadow.card,
  },
  paragraph: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    lineHeight: 28,
    marginBottom: spacing.xs,
  },
  spacer: {
    height: spacing.md,
  },
  bottomPadding: {
    height: spacing.xxxl,
  },
});
