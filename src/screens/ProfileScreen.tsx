import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, User } from '../types';
import { userService } from '../services/user';
import { propertyService } from '../services/property';
import { taxService } from '../services/tax';
import { documentService } from '../services/document';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [stats, setStats] = useState({
    propertyCount: 0,
    documentCount: 0,
    pendingTax: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, propStats, taxStats, docs] = await Promise.all([
        userService.getCurrentUser(),
        propertyService.getStats(),
        taxService.getStats(),
        documentService.getList(),
      ]);
      setUser(userData);
      setNickname(userData.nickname);
      setStats({
        propertyCount: propStats.count,
        documentCount: docs.length,
        pendingTax: taxStats.pendingCount,
      });
    } catch (error) {
      console.error('加载失败:', error);
    }
  };

  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      Alert.alert('提示', '昵称不能为空');
      return;
    }
    try {
      await userService.updateProfile({ nickname: nickname.trim() });
      setUser(prev => prev ? { ...prev, nickname: nickname.trim() } : null);
      setEditing(false);
      Alert.alert('成功', '昵称已更新');
    } catch {
      Alert.alert('失败', '更新失败');
    }
  };

  if (!user) return null;

  const menuItems = [
    { icon: '🏠', title: '我的房产', subtitle: `${stats.propertyCount} 套`, screen: 'PropertyList' as const },
    { icon: '📄', title: '我的证件', subtitle: `${stats.documentCount} 份`, screen: 'DocumentList' as const },
    { icon: '💰', title: '税务中心', subtitle: `${stats.pendingTax} 笔待缴`, screen: 'TaxCenter' as const },
    { icon: '📚', title: '政策资讯', subtitle: '最新动态', screen: 'PolicyList' as const },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.nicknameInput}
                value={nickname}
                onChangeText={setNickname}
                autoFocus
                placeholder="输入昵称"
                placeholderTextColor="#ccc"
              />
              <TouchableOpacity onPress={handleSaveNickname} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>保存</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditing(false); setNickname(user.nickname); }}>
                <Text style={styles.cancelBtn}>取消</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditing(true)} style={styles.nameRow}>
              <Text style={styles.nickname}>{user.nickname}</Text>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.joinDate}>加入时间: {user.createdAt}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.propertyCount}</Text>
            <Text style={styles.statLabel}>房产</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.documentCount}</Text>
            <Text style={styles.statLabel}>证件</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, stats.pendingTax > 0 ? styles.pendingColor : undefined]}>
              {stats.pendingTax}
            </Text>
            <Text style={styles.statLabel}>待缴税</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Chat', {})}
          >
            <Text style={styles.menuIcon}>🤖</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>AI 助手</Text>
              <Text style={styles.menuSubtitle}>智能问答</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>房产大师 v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', padding: 24, alignItems: 'center' },
  avatarContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatar: { fontSize: 36 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nickname: { fontSize: 22, fontWeight: '700', color: '#333' },
  editIcon: { fontSize: 14 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nicknameInput: {
    borderWidth: 1, borderColor: '#4CAF50', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6, fontSize: 16, color: '#333', minWidth: 120,
  },
  saveBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cancelBtn: { color: '#999', fontSize: 14, padding: 8 },
  joinDate: { fontSize: 13, color: '#999', marginTop: 8 },
  statsContainer: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 12,
  },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '700', color: '#333' },
  statLabel: { fontSize: 13, color: '#999', marginTop: 4 },
  pendingColor: { color: '#ff9800' },
  menuSection: {
    backgroundColor: '#fff', marginTop: 12, borderRadius: 12,
    marginHorizontal: 16, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  menuIcon: { fontSize: 24, marginRight: 14 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '500', color: '#333' },
  menuSubtitle: { fontSize: 13, color: '#999', marginTop: 2 },
  menuArrow: { fontSize: 22, color: '#ccc' },
  footer: { alignItems: 'center', padding: 32 },
  version: { fontSize: 13, color: '#ccc' },
});
