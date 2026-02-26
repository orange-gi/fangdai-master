// 主页屏幕
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const features = [
    {
      id: 'tax',
      title: '税务规划',
      subtitle: '专业税务方案咨询',
      icon: '💰',
      color: '#4CAF50',
    },
    {
      id: 'property',
      title: '房产管理',
      subtitle: '多房产统一管理',
      icon: '🏠',
      color: '#2196F3',
    },
    {
      id: 'document',
      title: '证件管理',
      subtitle: '房产证件数字化',
      icon: '📄',
      color: '#FF9800',
    },
    {
      id: 'policy',
      title: '政策解读',
      subtitle: '最新政策推送',
      icon: '📚',
      color: '#9C27B0',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>房产大师</Text>
        <Text style={styles.subtitle}>您的海外房产税务助手</Text>
      </View>

      <View style={styles.features}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.featureCard}
            onPress={() => {}}
          >
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.aiSection}>
        <TouchableOpacity style={styles.aiButton}>
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
