// 房产服务
import { callFunction } from './cloudbase';
import { Property } from '../types';

// 模拟数据（开发环境使用）
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    name: '洛杉矶公寓',
    address: '123 Main St, Los Angeles, CA 90001',
    type: 'apartment',
    purchaseDate: '2020-05-15',
    purchasePrice: 5000000,
    currentValue: 6500000,
  },
  {
    id: '2',
    name: '纽约工作室',
    address: '456 Broadway, New York, NY 10012',
    type: 'apartment',
    purchaseDate: '2021-08-20',
    purchasePrice: 8000000,
    currentValue: 9200000,
  },
];

const USE_MOCK = true; // 开发环境使用模拟数据

export const propertyService = {
  async getList(page = 1, pageSize = 10): Promise<Property[]> {
    if (USE_MOCK) {
      return MOCK_PROPERTIES;
    }
    const result = await callFunction('property', { action: 'list', page, pageSize });
    return (result as { list: Property[] }).list;
  },

  async get(id: string): Promise<Property | null> {
    if (USE_MOCK) {
      return MOCK_PROPERTIES.find(p => p.id === id) || null;
    }
    const result = await callFunction('property', { action: 'get', propertyId: id });
    return result as Property | null;
  },

  async add(data: Omit<Property, 'id'>): Promise<string> {
    if (USE_MOCK) {
      const newId = (MOCK_PROPERTIES.length + 1).toString();
      MOCK_PROPERTIES.push({ ...data, id: newId });
      return newId;
    }
    const result = await callFunction('property', { action: 'add', ...data });
    return (result as { id: string }).id;
  },

  async update(id: string, data: Partial<Property>): Promise<void> {
    if (USE_MOCK) {
      const index = MOCK_PROPERTIES.findIndex(p => p.id === id);
      if (index !== -1) {
        MOCK_PROPERTIES[index] = { ...MOCK_PROPERTIES[index], ...data };
      }
      return;
    }
    await callFunction('property', { action: 'update', propertyId: id, ...data });
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      const index = MOCK_PROPERTIES.findIndex(p => p.id === id);
      if (index !== -1) {
        MOCK_PROPERTIES.splice(index, 1);
      }
      return;
    }
    await callFunction('property', { action: 'delete', propertyId: id });
  },

  async getStats(): Promise<{
    count: number;
    totalValue: number;
    totalPurchase: number;
    totalGain: number;
  }> {
    if (USE_MOCK) {
      const count = MOCK_PROPERTIES.length;
      const totalValue = MOCK_PROPERTIES.reduce((sum, p) => sum + p.currentValue, 0);
      const totalPurchase = MOCK_PROPERTIES.reduce((sum, p) => sum + p.purchasePrice, 0);
      return { count, totalValue, totalPurchase, totalGain: totalValue - totalPurchase };
    }
    const result = await callFunction('property', { action: 'stats' });
    return result as { count: number; totalValue: number; totalPurchase: number; totalGain: number };
  },
};
