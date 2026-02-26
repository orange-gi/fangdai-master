import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, User } from '../types';
import { userService } from '../services/user';
import { propertyService } from '../services/property';
import { taxService } from '../services/tax';
import { documentService } from '../services/document';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [stats, setStats] = useState({ propertyCount: 0, documentCount: 0, pendingTax: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [u, ps, ts, ds] = await Promise.all([
        userService.getCurrentUser(), propertyService.getStats(), taxService.getStats(), documentService.getList(),
      ]);
      setUser(u);
      setNickname(u.nickname);
      setStats({ propertyCount: ps.count, documentCount: ds.length, pendingTax: ts.pendingCount });
    } catch { /* ignore */ }
  };

  const handleSave = async () => {
    if (!nickname.trim()) { Alert.alert('提示', '昵称不能为空'); return; }
    await userService.updateProfile({ nickname: nickname.trim() });
    setUser(p => p ? { ...p, nickname: nickname.trim() } : null);
    setEditing(false);
  };

  if (!user) return null;

  const initial = user.nickname.charAt(0).toUpperCase();

  const menus = [
    { title: '我的房产', sub: `${stats.propertyCount} 套`, screen: 'PropertyList' as const },
    { title: '我的证件', sub: `${stats.documentCount} 份`, screen: 'DocumentList' as const },
    { title: '税务中心', sub: `${stats.pendingTax} 笔待缴`, screen: 'TaxCenter' as const },
    { title: '政策资讯', sub: '最新动态', screen: 'PolicyList' as const },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.nickInput}
                value={nickname}
                onChangeText={setNickname}
                autoFocus
                placeholderTextColor={colors.text.tertiary}
              />
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>保存</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditing(false); setNickname(user.nickname); }}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.nickname}>{user.nickname}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.joinDate}>加入时间 {user.createdAt}</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { value: stats.propertyCount.toString(), label: '房产' },
            { value: stats.documentCount.toString(), label: '证件' },
            { value: stats.pendingTax.toString(), label: '待缴税' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menuSection}>
          {menus.map((m, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuItem, i < menus.length - 1 && styles.menuItemBorder]}
              onPress={() => navigation.navigate(m.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{m.title}</Text>
                <Text style={styles.menuSub}>{m.sub}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.aiRow}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Chat', {})}
        >
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>AI 助手</Text>
            <Text style={styles.menuSub}>智能问答</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <Text style={styles.version}>房产大师 v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  nickname: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nickInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    fontSize: fontSize.lg,
    color: colors.text.primary,
    minWidth: 120,
    backgroundColor: colors.bg.card,
  },
  saveBtn: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  saveBtnText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  cancelText: {
    color: colors.text.tertiary,
    fontSize: fontSize.sm,
    padding: spacing.sm,
  },
  joinDate: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadow.card,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  menuSection: {
    marginTop: spacing.xxl,
    marginHorizontal: spacing.xl,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  menuSub: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 22,
    color: colors.text.tertiary,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  version: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    paddingVertical: spacing.xxxl,
  },
});
