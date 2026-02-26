import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { propertyService } from '../services/property';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [stats, setStats] = useState({ count: 0, totalValue: 0, totalGain: 0 });

  useEffect(() => {
    propertyService.getStats().then(setStats).catch(() => {});
  }, []);

  const features = [
    {
      id: 'tax',
      title: '税务规划',
      subtitle: '专业税务方案咨询',
      icon: '💰',
      color: '#4CAF50',
      screen: 'TaxCenter' as const,
    },
    {
      id: 'property',
      title: '房产管理',
      subtitle: '多房产统一管理',
      icon: '🏠',
      color: '#2196F3',
      screen: 'PropertyList' as const,
    },
    {
      id: 'document',
      title: '证件管理',
      subtitle: '房产证件数字化',
      icon: '📄',
      color: '#FF9800',
      screen: 'DocumentList' as const,
    },
    {
      id: 'policy',
      title: '政策解读',
      subtitle: '最新政策推送',
      icon: '📚',
      color: '#9C27B0',
      screen: 'PolicyList' as const,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>房产大师</Text>
            <Text style={styles.subtitle}>您的海外房产税务助手</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {stats.count > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.count}</Text>
              <Text style={styles.statLabel}>房产数量</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>¥{(stats.totalValue / 10000).toFixed(0)}万</Text>
              <Text style={styles.statLabel}>总资产</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, stats.totalGain >= 0 ? styles.positive : styles.negative]}>
                {stats.totalGain >= 0 ? '+' : ''}¥{(stats.totalGain / 10000).toFixed(0)}万
              </Text>
              <Text style={styles.statLabel}>总收益</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.features}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.featureCard}
            onPress={() => navigation.navigate(feature.screen)}
          >
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.aiSection}>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => navigation.navigate('Chat', {})}
        >
          <Text style={styles.aiIcon}>🤖</Text>
          <Text style={styles.aiText}>咨询 AI 助手</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 22,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  positive: {
    color: '#2e7d32',
  },
  negative: {
    color: '#f44336',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  featureCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: '1.5%',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  aiSection: {
    padding: 20,
  },
  aiButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  aiText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
