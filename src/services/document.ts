import { callFunction } from './cloudbase';
import { Document } from '../types';

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    propertyId: '1',
    type: 'deed',
    name: '洛杉矶公寓房产证',
    number: 'LA-2020-88001',
    issueDate: '2020-06-01',
    expiryDate: '2030-06-01',
  },
  {
    id: '2',
    propertyId: '1',
    type: 'contract',
    name: '洛杉矶公寓购房合同',
    number: 'CT-2020-0515',
    issueDate: '2020-05-15',
  },
  {
    id: '3',
    propertyId: '2',
    type: 'deed',
    name: '纽约工作室房产证',
    number: 'NY-2021-66002',
    issueDate: '2021-09-01',
    expiryDate: '2031-09-01',
  },
  {
    id: '4',
    propertyId: '1',
    type: 'insurance',
    name: '洛杉矶公寓保险单',
    number: 'INS-2024-001',
    issueDate: '2024-01-01',
    expiryDate: '2025-01-01',
  },
  {
    id: '5',
    propertyId: '2',
    type: 'tax',
    name: '纽约工作室2023年税单',
    number: 'TAX-NY-2023',
    issueDate: '2023-12-15',
  },
];

const USE_MOCK = true;

export const documentService = {
  async getList(): Promise<Document[]> {
    if (USE_MOCK) {
      return [...MOCK_DOCUMENTS];
    }
    const result = await callFunction('document', { action: 'list' });
    return (result as { list: Document[] }).list;
  },

  async get(id: string): Promise<Document | null> {
    if (USE_MOCK) {
      return MOCK_DOCUMENTS.find(d => d.id === id) || null;
    }
    const result = await callFunction('document', { action: 'get', documentId: id });
    return result as Document | null;
  },

  async getByProperty(propertyId: string): Promise<Document[]> {
    if (USE_MOCK) {
      return MOCK_DOCUMENTS.filter(d => d.propertyId === propertyId);
    }
    const result = await callFunction('document', { action: 'list', propertyId });
    return (result as { list: Document[] }).list;
  },

  async add(data: Omit<Document, 'id'>): Promise<string> {
    if (USE_MOCK) {
      const newId = (MOCK_DOCUMENTS.length + 1).toString();
      MOCK_DOCUMENTS.push({ ...data, id: newId });
      return newId;
    }
    const result = await callFunction('document', { action: 'add', ...data });
    return (result as { id: string }).id;
  },

  async update(id: string, data: Partial<Document>): Promise<void> {
    if (USE_MOCK) {
      const index = MOCK_DOCUMENTS.findIndex(d => d.id === id);
      if (index !== -1) {
        MOCK_DOCUMENTS[index] = { ...MOCK_DOCUMENTS[index], ...data };
      }
      return;
    }
    await callFunction('document', { action: 'update', documentId: id, ...data });
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      const index = MOCK_DOCUMENTS.findIndex(d => d.id === id);
      if (index !== -1) MOCK_DOCUMENTS.splice(index, 1);
      return;
    }
    await callFunction('document', { action: 'delete', documentId: id });
  },

  async getExpiring(days: number = 30): Promise<Document[]> {
    if (USE_MOCK) {
      const now = new Date();
      const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      return MOCK_DOCUMENTS.filter(d => {
        if (!d.expiryDate) return false;
        const expiry = new Date(d.expiryDate);
        return expiry >= now && expiry <= future;
      });
    }
    const result = await callFunction('document', { action: 'expiring', days });
    return (result as { list: Document[] }).list;
  },
};
