import { callFunction } from './cloudbase';
import { TaxRecord } from '../types';

const MOCK_TAX_RECORDS: TaxRecord[] = [
  {
    id: '1',
    propertyId: '1',
    year: 2024,
    taxType: 'property',
    amount: 35000,
    status: 'pending',
    dueDate: '2024-12-31',
  },
  {
    id: '2',
    propertyId: '1',
    year: 2024,
    taxType: 'income',
    amount: 82000,
    status: 'paid',
    dueDate: '2024-04-15',
    paidDate: '2024-03-20',
  },
  {
    id: '3',
    propertyId: '2',
    year: 2024,
    taxType: 'property',
    amount: 56000,
    status: 'pending',
    dueDate: '2024-12-31',
  },
  {
    id: '4',
    propertyId: '2',
    year: 2023,
    taxType: 'capital-gain',
    amount: 120000,
    status: 'paid',
    dueDate: '2023-12-31',
    paidDate: '2023-11-15',
  },
  {
    id: '5',
    propertyId: '1',
    year: 2023,
    taxType: 'property',
    amount: 32000,
    status: 'paid',
    dueDate: '2023-12-31',
    paidDate: '2023-12-10',
  },
];

const USE_MOCK = true;

export const taxService = {
  async getList(): Promise<TaxRecord[]> {
    if (USE_MOCK) {
      return [...MOCK_TAX_RECORDS].sort((a, b) => b.year - a.year);
    }
    const result = await callFunction('tax', { action: 'list' });
    return (result as { list: TaxRecord[] }).list;
  },

  async get(id: string): Promise<TaxRecord | null> {
    if (USE_MOCK) {
      return MOCK_TAX_RECORDS.find(r => r.id === id) || null;
    }
    const result = await callFunction('tax', { action: 'get', taxId: id });
    return result as TaxRecord | null;
  },

  async getByProperty(propertyId: string): Promise<TaxRecord[]> {
    if (USE_MOCK) {
      return MOCK_TAX_RECORDS.filter(r => r.propertyId === propertyId);
    }
    const result = await callFunction('tax', { action: 'list', propertyId });
    return (result as { list: TaxRecord[] }).list;
  },

  async add(data: Omit<TaxRecord, 'id'>): Promise<string> {
    if (USE_MOCK) {
      const newId = (MOCK_TAX_RECORDS.length + 1).toString();
      MOCK_TAX_RECORDS.push({ ...data, id: newId });
      return newId;
    }
    const result = await callFunction('tax', { action: 'add', ...data });
    return (result as { id: string }).id;
  },

  async markPaid(id: string): Promise<void> {
    if (USE_MOCK) {
      const record = MOCK_TAX_RECORDS.find(r => r.id === id);
      if (record) {
        record.status = 'paid';
        record.paidDate = new Date().toISOString().split('T')[0];
      }
      return;
    }
    await callFunction('tax', { action: 'update', taxId: id, status: 'paid', paidDate: new Date().toISOString().split('T')[0] });
  },

  async getStats(): Promise<{
    pendingAmount: number;
    paidAmount: number;
    pendingCount: number;
    paidCount: number;
  }> {
    if (USE_MOCK) {
      const pending = MOCK_TAX_RECORDS.filter(r => r.status === 'pending');
      const paid = MOCK_TAX_RECORDS.filter(r => r.status === 'paid');
      return {
        pendingAmount: pending.reduce((sum, r) => sum + r.amount, 0),
        paidAmount: paid.reduce((sum, r) => sum + r.amount, 0),
        pendingCount: pending.length,
        paidCount: paid.length,
      };
    }
    const result = await callFunction('tax', { action: 'stats' });
    return result as { pendingAmount: number; paidAmount: number; pendingCount: number; paidCount: number };
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      const index = MOCK_TAX_RECORDS.findIndex(r => r.id === id);
      if (index !== -1) MOCK_TAX_RECORDS.splice(index, 1);
      return;
    }
    await callFunction('tax', { action: 'delete', taxId: id });
  },
};
