// 房产类型定义

// 房产信息
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

// 税务咨询
export interface TaxConsultation {
  id: string;
  userId: string;
  question: string;
  answer?: string;
  status: 'pending' | 'answered';
  createdAt: string;
}
