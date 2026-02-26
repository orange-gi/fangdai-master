import { callFunction } from './cloudbase';
import { RentalIncome } from '../types';

const MOCK_RENTAL_INCOME: RentalIncome[] = [
  {
    id: '1',
    propertyId: '1',
    month: '2024-01',
    amount: 15000,
    currency: 'CNY',
    notes: '洛杉矶公寓1月租金',
    createdAt: '2024-01-05',
  },
  {
    id: '2',
    propertyId: '1',
    month: '2024-02',
    amount: 15000,
    currency: 'CNY',
    createdAt: '2024-02-05',
  },
  {
    id: '3',
    propertyId: '1',
    month: '2024-03',
    amount: 15500,
    currency: 'CNY',
    notes: '租金微涨',
    createdAt: '2024-03-05',
  },
  {
    id: '4',
    propertyId: '2',
    month: '2024-01',
    amount: 22000,
    currency: 'CNY',
    createdAt: '2024-01-03',
  },
  {
    id: '5',
    propertyId: '2',
    month: '2024-02',
    amount: 22000,
    currency: 'CNY',
    createdAt: '2024-02-03',
  },
  {
    id: '6',
    propertyId: '2',
    month: '2024-03',
    amount: 22000,
    currency: 'CNY',
    createdAt: '2024-03-03',
  },
];

const USE_MOCK = true;

export const rentalService = {
  async getByProperty(propertyId: string): Promise<RentalIncome[]> {
    if (USE_MOCK) {
      return MOCK_RENTAL_INCOME
        .filter(r => r.propertyId === propertyId)
        .sort((a, b) => b.month.localeCompare(a.month));
    }
    const result = await callFunction('property', { action: 'rental-list', propertyId });
    return (result as { list: RentalIncome[] }).list;
  },

  async add(data: Omit<RentalIncome, 'id' | 'createdAt'>): Promise<string> {
    if (USE_MOCK) {
      const newId = (MOCK_RENTAL_INCOME.length + 1).toString();
      MOCK_RENTAL_INCOME.push({
        ...data,
        id: newId,
        createdAt: new Date().toISOString().split('T')[0],
      });
      return newId;
    }
    const result = await callFunction('property', { action: 'rental-add', ...data });
    return (result as { id: string }).id;
  },

  async getAnnualTotal(propertyId: string, year: number): Promise<number> {
    if (USE_MOCK) {
      return MOCK_RENTAL_INCOME
        .filter(r => r.propertyId === propertyId && r.month.startsWith(year.toString()))
        .reduce((sum, r) => sum + r.amount, 0);
    }
    const result = await callFunction('property', { action: 'rental-stats', propertyId, year });
    return (result as { total: number }).total;
  },

  async getAllStats(): Promise<{ totalIncome: number; propertyCount: number; monthlyAvg: number }> {
    if (USE_MOCK) {
      const totalIncome = MOCK_RENTAL_INCOME.reduce((sum, r) => sum + r.amount, 0);
      const propertyIds = new Set(MOCK_RENTAL_INCOME.map(r => r.propertyId));
      const months = new Set(MOCK_RENTAL_INCOME.map(r => r.month));
      return {
        totalIncome,
        propertyCount: propertyIds.size,
        monthlyAvg: months.size > 0 ? Math.round(totalIncome / months.size) : 0,
      };
    }
    const result = await callFunction('property', { action: 'rental-all-stats' });
    return result as { totalIncome: number; propertyCount: number; monthlyAvg: number };
  },
};
