import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      setUser(u); setNickname(u.nickname);
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

  const menus = [
    { icon: '🏠', title: '我的房产', sub: `${stats.propertyCount} 套`, screen: 'PropertyList' as const, color: colors.accent.sky },
    { icon: '📄', title: '我的证件', sub: `${stats.documentCount} 份`, screen: 'DocumentList' as const, color: colors.accent.violet },
    { icon: '💰', title: '税务中心', sub: `${stats.pendingTax} 笔待缴`, screen: 'TaxCenter' as const, color: colors.accent.gold },
    { icon: '📚', title: '政策资讯', sub: '最新动态', screen: 'PolicyList' as const, color: colors.accent.jade },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#151A2E', '#0E1225']} style={styles.header}>
          <LinearGradient colors={['#E8B86D', '#D4956A']} style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          </LinearGradient>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput style={styles.nickInput} value={nickname} onChangeText={setNickname} autoFocus placeholderTextColor={colors.text.tertiary} />
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn}><Text style={styles.saveBtnText}>保存</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditing(false); setNickname(user.nickname); }}><Text style={styles.cancelText}>取消</Text></TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditing(true)} style={styles.nameRow}>
              <Text style={styles.nickname}>{user.nickname}</Text>
              <Text style={styles.editHint}>✏️</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.joinDate}>加入时间 {user.createdAt}</Text>
        </LinearGradient>

        <View style={styles.statsRow}>
          {[
            { value: stats.propertyCount.toString(), label: '房产', color: colors.accent.sky },
            { value: stats.documentCount.toString(), label: '证件', color: colors.accent.violet },
            { value: stats.pendingTax.toString(), label: '待缴税', color: colors.accent.gold },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menuSection}>
          {menus.map((m, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={() => navigation.navigate(m.screen)} activeOpacity={0.8}>
              <View style={[styles.menuIconBg, { backgroundColor: m.color + '18' }]}>
                <Text style={styles.menuIcon}>{m.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{m.title}</Text>
                <Text style={styles.menuSub}>{m.sub}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.aiCard} activeOpacity={0.85} onPress={() => navigation.navigate('Chat', {})}>
          <LinearGradient colors={['rgba(232,184,109,0.12)', 'rgba(232,184,109,0.04)']} style={styles.aiCardInner}>
            <Text style={styles.aiCardIcon}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiCardTitle}>AI 助手</Text>
              <Text style={styles.aiCardSub}>智能问答 · 随时在线</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.version}>房产大师 v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl },
  avatarRing: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  avatarInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.bg.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  nickname: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text.primary },
  editHint: { fontSize: 14, opacity: 0.5 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  nickInput: { borderWidth: 1, borderColor: colors.accent.gold, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 6, fontSize: fontSize.lg, color: colors.text.primary, minWidth: 120, backgroundColor: colors.bg.input },
  saveBtn: { backgroundColor: colors.accent.gold, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.sm },
  saveBtnText: { color: colors.bg.primary, fontWeight: '700', fontSize: fontSize.sm },
  cancelText: { color: colors.text.tertiary, fontSize: fontSize.sm, padding: spacing.sm },
  joinDate: { fontSize: fontSize.sm, color: colors.text.tertiary, marginTop: spacing.sm },
  statsRow: { flexDirection: 'row', marginHorizontal: spacing.xl, marginTop: -spacing.lg, gap: spacing.md },
  statCard: { flex: 1, backgroundColor: colors.bg.card, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border.subtle, ...shadow.card },
  statValue: { fontSize: fontSize.xxl, fontWeight: '800' },
  statLabel: { fontSize: fontSize.xs, color: colors.text.tertiary, marginTop: 4, letterSpacing: 0.8, textTransform: 'uppercase' },
  menuSection: { marginTop: spacing.xxl, marginHorizontal: spacing.xl, backgroundColor: colors.bg.card, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border.subtle },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  menuIconBg: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  menuIcon: { fontSize: 20 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text.primary },
  menuSub: { fontSize: fontSize.xs, color: colors.text.tertiary, marginTop: 2 },
  menuArrow: { fontSize: 22, color: colors.text.tertiary },
  aiCard: { marginHorizontal: spacing.xl, marginTop: spacing.lg },
  aiCardInner: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border.accent },
  aiCardIcon: { fontSize: 28, marginRight: spacing.md },
  aiCardTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.accent.gold },
  aiCardSub: { fontSize: fontSize.xs, color: colors.text.tertiary, marginTop: 2 },
  version: { textAlign: 'center', fontSize: fontSize.xs, color: colors.text.tertiary, paddingVertical: spacing.xxxl, letterSpacing: 1 },
});
