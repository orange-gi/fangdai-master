import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DocumentType, RootStackParamList } from '../types';
import { documentService } from '../services/document';

type Props = NativeStackScreenProps<RootStackParamList, 'AddDocument'>;

const DOC_TYPES: { value: DocumentType; label: string; icon: string }[] = [
  { value: 'deed', label: '房产证', icon: '🏠' },
  { value: 'contract', label: '购房合同', icon: '📝' },
  { value: 'id', label: '身份证', icon: '🪪' },
  { value: 'passport', label: '护照', icon: '📕' },
  { value: 'visa', label: '签证', icon: '✈️' },
  { value: 'tax', label: '税单', icon: '💰' },
  { value: 'insurance', label: '保险', icon: '🛡️' },
  { value: 'other', label: '其他', icon: '📎' },
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
    } catch (error) {
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
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>证件类型</Text>
          <View style={styles.typeGrid}>
            {DOC_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeItem, form.type === t.value && styles.typeItemActive]}
                onPress={() => updateForm('type', t.value)}
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
          <Text style={styles.sectionTitle}>证件信息</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>证件名称 *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => updateForm('name', v)}
              placeholder="例如：洛杉矶公寓房产证"
              placeholderTextColor="#ccc"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>证件编号</Text>
            <TextInput
              style={styles.input}
              value={form.number}
              onChangeText={(v) => updateForm('number', v)}
              placeholder="证件编号（选填）"
              placeholderTextColor="#ccc"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>签发日期</Text>
            <TextInput
              style={styles.input}
              value={form.issueDate}
              onChangeText={(v) => updateForm('issueDate', v)}
              placeholder="格式：2024-01-01"
              placeholderTextColor="#ccc"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>到期日期</Text>
            <TextInput
              style={styles.input}
              value={form.expiryDate}
              onChangeText={(v) => updateForm('expiryDate', v)}
              placeholder="格式：2030-01-01（选填）"
              placeholderTextColor="#ccc"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? '保存中...' : '保存证件'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollView: { flex: 1 },
  section: { backgroundColor: '#fff', marginBottom: 12, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeItem: {
    width: '23%', alignItems: 'center', paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: '#fafafa',
  },
  typeItemActive: { borderColor: '#ff9800', backgroundColor: '#fff3e0' },
  typeIcon: { fontSize: 24, marginBottom: 4 },
  typeLabel: { fontSize: 12, color: '#666' },
  typeLabelActive: { color: '#ff9800', fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 16,
    color: '#333', backgroundColor: '#fafafa',
  },
  submitButton: {
    backgroundColor: '#ff9800', marginHorizontal: 16, marginVertical: 24,
    paddingVertical: 16, borderRadius: 12, alignItems: 'center',
  },
  submitButtonDisabled: { backgroundColor: '#ffe0b2' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
