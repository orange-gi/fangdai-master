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
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PropertyType, RootStackParamList } from '../types';
import { propertyService } from '../services/property';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProperty'>;

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: '公寓' },
  { value: 'house', label: '别墅' },
  { value: 'land', label: '土地' },
  { value: 'commercial', label: '商业地产' },
  { value: 'other', label: '其他' },
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
    } catch (error) {
      Alert.alert('错误', '加载房产信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert('提示', '请输入房产名称');
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
        currentValue: parseFloat(form.currentValue) || 0,
      });
      Alert.alert('成功', '房产信息已更新', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('失败', '更新失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本信息</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>房产名称 *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => updateForm('name', v)}
              placeholder="例如：洛杉矶公寓"
              placeholderTextColor="#ccc"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>房产类型</Text>
            <View style={styles.typeSelector}>
              {PROPERTY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.typeButton, form.type === type.value && styles.typeButtonActive]}
                  onPress={() => updateForm('type', type.value)}
                >
                  <Text style={[styles.typeButtonText, form.type === type.value && styles.typeButtonTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>地址</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.address}
              onChangeText={(v) => updateForm('address', v)}
              placeholder="详细地址"
              placeholderTextColor="#ccc"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 价格信息</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>购入日期</Text>
            <TextInput
              style={styles.input}
              value={form.purchaseDate}
              onChangeText={(v) => updateForm('purchaseDate', v)}
              placeholder="格式：2024-01-01"
              placeholderTextColor="#ccc"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>购入价格 (CNY)</Text>
            <TextInput
              style={styles.input}
              value={form.purchasePrice}
              onChangeText={(v) => updateForm('purchasePrice', v)}
              placeholder="购入价格"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>当前估值 (CNY)</Text>
            <TextInput
              style={styles.input}
              value={form.currentValue}
              onChangeText={(v) => updateForm('currentValue', v)}
              placeholder="当前估值"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.submitButtonText}>
            {saving ? '保存中...' : '保存修改'}
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
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 16,
    color: '#333', backgroundColor: '#fafafa',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeButton: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: '#fafafa',
  },
  typeButtonActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  typeButtonText: { fontSize: 14, color: '#666' },
  typeButtonTextActive: { color: '#fff' },
  submitButton: {
    backgroundColor: '#2e7d32', marginHorizontal: 16, marginVertical: 24,
    paddingVertical: 16, borderRadius: 12, alignItems: 'center',
  },
  submitButtonDisabled: { backgroundColor: '#a5d6a7' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
