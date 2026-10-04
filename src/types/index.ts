export type MobileNetwork = 'mtn' | 'telecel' | 'airteltigo';

export interface DataPackage {
  id: string;
  name: string;
  network: MobileNetwork;
  capacityGb: number; // 1 to 120 GB
  retailPrice: number; // in GH₵
  agentCost: number; // wholesale cost in GH₵
  validity: 'Non-Expiry' | '30 Days' | '7 Days' | 'Midnight';
  description: string;
  isPopular?: boolean;
  status: 'active' | 'unlisted';
  totalSold: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  role: 'agent_seller' | 'buyer' | 'both';
  bio: string;
  balance: number; // MoMo wallet balance in GH₵
  agentStockGb: number; // wholesale data inventory pool in GB
  isVerified: boolean;
}

export interface DataOrder {
  id: string;
  packageId: string;
  packageName: string;
  network: MobileNetwork;
  capacityGb: number;
  recipientPhone: string;
  recipientName?: string;
  amountPaid: number;
  paymentMethod: 'mtn_momo' | 'telecel_cash' | 'airteltigo_money' | 'wallet_balance';
  momoNumber: string;
  paymentCode?: string;
  transactionRef: string;
  smsReference: string;
  deliveryStatus: 'delivered' | 'pending' | 'failed';
  deliveredAt: string;
  validity: string;
}

export interface AgentMetric {
  date: string;
  gbDelivered: number;
  revenueGhs: number;
  profitGhs: number;
}
