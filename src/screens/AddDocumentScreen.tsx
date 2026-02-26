import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DocumentType, RootStackParamList } from '../types';
import { documentService } from '../services/document';
import { colors, spacing, radius, fontSize, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddDocument'>;

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'deed', label: '房产证' },
  { value: 'contract', label: '购房合同' },
  { value: 'id', label: '身份证' },
  { value: 'passport', label: '护照' },
  { value: 'visa', label: '签证' },
  { value: 'tax', label: '税单' },
  { value: 'insurance', label: '保险' },
  { value: 'other', label: '其他' },
];

export default function AddDocumentScreen({ navigation, route }: Props) {
  const propertyId = route.params?.propertyId || '1';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: 'deed' as DocumentType,
    name: '',
    number: '',
    issueDate: '',
    expiryDate: '',
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert('提示', '请输入证件名称');
      return;
    }
    setLoading(true);
    try {
      await documentService.add({
        propertyId,
        type: form.type,
        name: form.name,
        number: form.number || undefined,
        issueDate: form.issueDate || undefined,
        expiryDate: form.expiryDate || undefined,
      });
      Alert.alert('成功', '证件添加成功', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('失败', '添加失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>证件类型</Text>
          <View style={styles.typeGrid}>
            {DOC_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typePill, form.type === t.value && styles.typePillActive]}
                onPress={() => updateForm('type', t.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.typeText, form.type === t.value && styles.typeTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>证件信息</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>证件名称 *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => updateForm('name', v)}
              placeholder="例如：洛杉矶公寓房产证"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>证件编号</Text>
            <TextInput
              style={styles.input}
              value={form.number}
              onChangeText={(v) => updateForm('number', v)}
              placeholder="证件编号（选填）"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>签发日期</Text>
            <TextInput
              style={styles.input}
              value={form.issueDate}
              onChangeText={(v) => updateForm('issueDate', v)}
              placeholder="格式：2024-01-01"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>到期日期</Text>
            <TextInput
              style={styles.input}
              value={form.expiryDate}
              onChangeText={(v) => updateForm('expiryDate', v)}
              placeholder="格式：2030-01-01（选填）"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>
            {loading ? '保存中...' : '保存证件'}
          </Text>
        </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: spacing.huge,
  },
  section: {
    backgroundColor: colors.bg.card,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...shadow.card,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: '600',
    marginBottom: spacing.lg,
    letterSpacing: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typePill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.bg.primary,
  },
  typePillActive: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.primaryLight,
  },
  typeText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  typeTextActive: {
    color: colors.accent.primary,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
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
  submitBtn: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    backgroundColor: colors.accent.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.text.inverse,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
