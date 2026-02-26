import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PropertyType, RootStackParamList } from '../types';
import { propertyService } from '../services/property';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProperty'>;

const TYPES: { value: PropertyType; label: string; icon: string }[] = [
  { value: 'apartment', label: '公寓', icon: '🏢' },
  { value: 'house', label: '别墅', icon: '🏡' },
  { value: 'land', label: '土地', icon: '🌍' },
  { value: 'commercial', label: '商铺', icon: '🏬' },
  { value: 'other', label: '其他', icon: '📦' },
];

export default function EditPropertyScreen({ navigation, route }: Props) {
  const { propertyId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    type: 'apartment' as PropertyType,
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
  });

  useEffect(() => {
    loadProperty();
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      const prop = await propertyService.get(propertyId);
      if (prop) {
        setForm({
          name: prop.name,
          address: prop.address,
          type: prop.type,
          purchaseDate: prop.purchaseDate,
          purchasePrice: prop.purchasePrice.toString(),
          currentValue: prop.currentValue.toString(),
        });
      }
    } catch {
      Alert.alert('错误', '加载房产信息失败');
    } finally {
      setLoading(false);
    }
  };

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert('提示', '请输入房产名称');
      return;
    }
    if (!form.address.trim()) {
      Alert.alert('提示', '请输入地址');
      return;
    }
    if (!form.purchasePrice) {
      Alert.alert('提示', '请输入购入价格');
      return;
    }
    setSaving(true);
    try {
      await propertyService.update(propertyId, {
        name: form.name,
        address: form.address,
        type: form.type,
        purchaseDate: form.purchaseDate,
        purchasePrice: parseFloat(form.purchasePrice) || 0,
        currentValue: parseFloat(form.currentValue) || parseFloat(form.purchasePrice) || 0,
      });
      Alert.alert('成功', '房产信息已更新', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('失败', '更新失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>房产类型</Text>
          <View style={styles.typeGrid}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeItem, form.type === t.value && styles.typeActive]}
                onPress={() => update('type', t.value)}
              >
                <Text style={styles.typeIcon}>{t.icon}</Text>
                <Text style={[styles.typeLabel, form.type === t.value && styles.typeLabelActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本信息</Text>
          <Text style={styles.label}>房产名称 *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={v => update('name', v)}
            placeholder="例如：洛杉矶公寓"
            placeholderTextColor={colors.text.tertiary}
          />
          <Text style={styles.label}>详细地址 *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.address}
            onChangeText={v => update('address', v)}
            placeholder="街道、城市、州、邮编"
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={3}
          />
          <Text style={styles.label}>购入日期</Text>
          <TextInput
            style={styles.input}
            value={form.purchaseDate}
            onChangeText={v => update('purchaseDate', v)}
            placeholder="2024-01-01"
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 价格信息</Text>
          <Text style={styles.label}>购入价格 (CNY) *</Text>
          <TextInput
            style={styles.input}
            value={form.purchasePrice}
            onChangeText={v => update('purchasePrice', v)}
            placeholder="请输入购入价格"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
          />
          <Text style={styles.label}>当前估值 (CNY)</Text>
          <TextInput
            style={styles.input}
            value={form.currentValue}
            onChangeText={v => update('currentValue', v)}
            placeholder="留空则使用购入价格"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.submitWrap}>
          <TouchableOpacity activeOpacity={0.85} onPress={handleSubmit} disabled={saving}>
            <LinearGradient
              colors={saving ? ['#9E7B3F', '#8A6A3A'] : ['#E8B86D', '#D4956A']}
              style={styles.submitBtn}
            >
              <Text style={styles.submitText}>{saving ? '保存中...' : '保存修改'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { color: colors.text.tertiary, fontSize: fontSize.md, marginTop: spacing.sm },
  section: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  typeGrid: { flexDirection: 'row', gap: spacing.sm },
  typeItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.bg.card,
  },
  typeActive: {
    borderColor: colors.accent.gold,
    backgroundColor: 'rgba(232,184,109,0.08)',
  },
  typeIcon: { fontSize: 22, marginBottom: 4 },
  typeLabel: { fontSize: fontSize.xs, color: colors.text.tertiary },
  typeLabelActive: { color: colors.accent.gold, fontWeight: '600' },
  label: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.bg.input,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitWrap: { padding: spacing.xl, paddingBottom: spacing.huge },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadow.elevated,
  },
  submitText: {
    color: colors.bg.primary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
