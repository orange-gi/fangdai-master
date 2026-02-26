// 房产大师 - 类型定义
// 统一管理所有数据类型

// ============ 用户相关 ============

export interface User {
  id: string;
  openid: string;
  nickname: string;
  avatar?: string;
  createdAt: string;
}

// ============ 房产相关 ============

export interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  images?: string[];
  documents?: Document[];
}

export type PropertyType = 
  | 'apartment'    // 公寓
  | 'house'        // 别墅
  | 'land'         // 土地
  | 'commercial'  // 商业地产
  | 'other';       // 其他

// 税务信息
export interface TaxRecord {
  id: string;
  propertyId: string;
  year: number;
  taxType: TaxType;
  amount: number;
  status: TaxStatus;
  dueDate: string;
  paidDate?: string;
}

export type TaxType = 
  | 'income'        // 所得税
  | 'property'     // 房产税
  | 'capital-gain' // 资本利得税
  | 'other';       // 其他

export type TaxStatus = 
  | 'pending'  // 待缴纳
  | 'paid'      // 已缴纳
  | 'overdue';  // 逾期

// 证件信息
export interface Document {
  id: string;
  propertyId: string;
  type: DocumentType;
  name: string;
  number?: string;
  issueDate?: string;
  expiryDate?: string;
  imageUrl?: string;
}

export type DocumentType = 
  | 'deed'           // 房产证
  | 'contract'       // 购房合同
  | 'id'             // 身份证
  | 'passport'       // 护照
  | 'visa'           // 签证
  | 'tax'            // 税单
  | 'insurance'      // 保险
  | 'other';         // 其他

// ============ 税务相关 ============

// 税务咨询
export interface TaxConsultation {
  id: string;
  userId: string;
  question: string;
  answer?: string;
  status: 'pending' | 'answered';
  createdAt: string;
}

// 税务方案
export interface TaxPlan {
  id: string;
  userId: string;
  propertyId?: string;
  title: string;
  description: string;
  estimatedAmount?: number;
  year: number;
  createdAt: string;
}

// ============ AI 对话相关 ============

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatHistory {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// ============ 租金收益 ============

export interface RentalIncome {
  id: string;
  propertyId: string;
  month: string;
  amount: number;
  currency: string;
  notes?: string;
  createdAt: string;
}

// ============ 政策资讯 ============

export interface PolicyArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: PolicyCategory;
  source: string;
  publishedAt: string;
  createdAt: string;
}

export type PolicyCategory = 
  | 'tax'          // 税务政策
  | 'property'     // 房产政策
  | 'immigration'  // 移民政策
  | 'law';         // 法律法规

// ============ 通用类型 ============

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// API 响应
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 导航参数类型
export type RootStackParamList = {
  Home: undefined;
  PropertyList: undefined;
  PropertyDetail: { propertyId: string };
  AddProperty: undefined;
  EditProperty: { propertyId: string };
  TaxCenter: undefined;
  TaxDetail: { taxId: string };
  DocumentList: undefined;
  DocumentDetail: { documentId: string };
  AddDocument: { propertyId?: string };
  PolicyList: undefined;
  PolicyDetail: { articleId: string };
  Profile: undefined;
  Chat: { chatId?: string };
  TaxConsultation: undefined;
};
