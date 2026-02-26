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

const CATEGORY_MAP: Record<string, string> = {
  tax: '税务政策', property: '房产政策', immigration: '移民政策', law: '法律法规',
};

const CATEGORY_COLORS: Record<string, string> = {
  tax: colors.accent.gold,
  property: colors.accent.sky,
  immigration: colors.accent.violet,
  law: colors.accent.coral,
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
        <ActivityIndicator size="large" color={colors.accent.gold} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const catColor = CATEGORY_COLORS[article.category] || colors.accent.gold;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.meta}>
            <View style={[styles.categoryBadge, { backgroundColor: catColor + '1A' }]}>
              <Text style={[styles.categoryText, { color: catColor }]}>
                {CATEGORY_MAP[article.category] || article.category}
              </Text>
            </View>
            <Text style={styles.date}>{article.publishedAt}</Text>
          </View>
          <Text style={styles.title}>{article.title}</Text>
          <View style={styles.sourceRow}>
            <Text style={styles.sourceLabel}>来源</Text>
            <Text style={styles.sourceValue}>{article.source}</Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryBorder} />
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>📋 摘要</Text>
            <Text style={styles.summaryText}>{article.summary}</Text>
          </View>
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
    backgroundColor: colors.bg.secondary,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
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
    letterSpacing: 0.3,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sourceLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sourceValue: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: colors.bg.card,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadow.card,
  },
  summaryBorder: {
    width: 3,
    backgroundColor: colors.accent.gold,
  },
  summaryContent: {
    flex: 1,
    padding: spacing.lg,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  contentBox: {
    backgroundColor: colors.bg.card,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
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
