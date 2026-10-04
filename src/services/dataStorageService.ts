import { DataPackage, UserAccount, DataOrder, MobileNetwork } from '../types';
import { INITIAL_DATA_PACKAGES } from '../data/seedDataPackages';

const STORAGE_KEYS = {
  PACKAGES: 'spendless_data_packages_v3',
  USER: 'spendless_data_user_v3',
  ORDERS: 'spendless_data_orders_v3',
  THEME: 'spendless_data_theme_v3',
};

// Current active user: John Evans Cole (Ghana)
export const DEFAULT_USER: UserAccount = {
  id: 'usr-john-evans-cole',
  name: 'John Evans Cole',
  email: 'johnevanscole@gmail.com',
  phone: '0244128990',
  location: 'Accra, Ghana',
  avatar: '/src/assets/images/ferrari_avatar_1791118371533.jpg',
  role: 'both',
  bio: 'Accra data bundle agent & subscriber. Buying bulk 1-120GB packages with instant MoMo delivery.',
  balance: 1450.0, // MoMo wallet balance in GH₵
  agentStockGb: 2450, // wholesale data pool in GB
  isVerified: true,
};

// Format currency as Ghana Cedis (GH₵)
export function formatGHS(amount: number): string {
  if (amount === 0) return 'FREE';
  return `GH₵ ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Detect Ghana Telco network from phone prefix
export function detectGhanaNetwork(phone: string): MobileNetwork {
  const clean = phone.replace(/[^0-9]/g, '');
  // Format to standard 10 digit (024...) or handle 233
  let localNum = clean;
  if (clean.startsWith('233') && clean.length >= 12) {
    localNum = '0' + clean.slice(3);
  }

  const prefix = localNum.slice(0, 3);
  // MTN: 024, 054, 055, 059, 053
  if (['024', '054', '055', '059', '053'].includes(prefix)) {
    return 'mtn';
  }
  // Telecel: 020, 050
  if (['020', '050'].includes(prefix)) {
    return 'telecel';
  }
  // AirtelTigo: 027, 057, 026
  if (['027', '057', '026'].includes(prefix)) {
    return 'airteltigo';
  }
  return 'mtn';
}

// Calculate realistic price for custom GB (1 to 120 GB)
export function calculateCustomGbPrice(gb: number, network: MobileNetwork = 'mtn'): { price: number; agentCost: number } {
  const cleanGb = Math.max(1, Math.min(120, Math.round(gb)));
  let baseRatePerGb = 4.8;
  if (cleanGb > 100) baseRatePerGb = 3.42;
  else if (cleanGb > 50) baseRatePerGb = 3.7;
  else if (cleanGb > 20) baseRatePerGb = 3.95;
  else if (cleanGb > 10) baseRatePerGb = 4.3;
  else if (cleanGb > 5) baseRatePerGb = 4.4;

  if (network === 'telecel') baseRatePerGb *= 0.96;
  if (network === 'airteltigo') baseRatePerGb *= 0.94;

  const price = Math.round(cleanGb * baseRatePerGb * 10) / 10;
  const agentCost = Math.round(price * 0.85 * 10) / 10;
  return { price, agentCost };
}

export const DataStorageService = {
  // Packages
  getPackages(): DataPackage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(INITIAL_DATA_PACKAGES));
        return INITIAL_DATA_PACKAGES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_DATA_PACKAGES;
    }
  },

  savePackages(packages: DataPackage[]) {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  },

  getPackageById(id: string): DataPackage | undefined {
    const list = this.getPackages();
    return list.find((p) => p.id === id);
  },

  createPackage(pkg: Omit<DataPackage, 'id' | 'totalSold'>): DataPackage {
    const list = this.getPackages();
    const newPkg: DataPackage = {
      ...pkg,
      id: `pkg-${pkg.network}-${pkg.capacityGb}gb-${Date.now().toString(36)}`,
      totalSold: 0,
    };
    list.unshift(newPkg);
    this.savePackages(list);
    return newPkg;
  },

  updatePackage(id: string, updates: Partial<DataPackage>): DataPackage | null {
    const list = this.getPackages();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    this.savePackages(list);
    return list[index];
  },

  toggleUnlistPackage(id: string): DataPackage | null {
    const list = this.getPackages();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;
    list[index].status = list[index].status === 'active' ? 'unlisted' : 'active';
    this.savePackages(list);
    return list[index];
  },

  deletePackage(id: string): boolean {
    const list = this.getPackages();
    const filtered = list.filter((p) => p.id !== id);
    if (filtered.length !== list.length) {
      this.savePackages(filtered);
      return true;
    }
    return false;
  },

  // User
  getCurrentUser(): UserAccount {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
        return DEFAULT_USER;
      }
      const parsed = JSON.parse(data);
      if (!parsed.avatar || parsed.avatar.includes('unsplash.com')) {
        parsed.avatar = DEFAULT_USER.avatar;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return DEFAULT_USER;
    }
  },

  saveCurrentUser(user: UserAccount) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // Update user balance (add or deduct)
  updateBalance(deltaGhs: number): UserAccount {
    const user = this.getCurrentUser();
    user.balance = Math.max(0, Math.round((user.balance + deltaGhs) * 100) / 100);
    this.saveCurrentUser(user);
    return user;
  },

  // Generate authentic telco SMS text
  generateSmsText(order: {
    network: MobileNetwork;
    capacityGb: number;
    recipientPhone: string;
    amountPaid: number;
    transactionRef: string;
  }): string {
    const networkName = order.network === 'mtn' ? 'MTN' : order.network === 'telecel' ? 'Telecel' : 'AirtelTigo';
    const ussdCheck = order.network === 'mtn' ? '*138#' : order.network === 'telecel' ? '*124#' : '*124#';
    return `Data Mart S.M.S: You have received ${order.capacityGb}GB ${networkName} Non-Expiry Data on ${order.recipientPhone}. Cost: GH₵ ${order.amountPaid.toFixed(2)}. Dial ${ussdCheck} to check balance. Ref: ${order.transactionRef}. Thank you!`;
  },

  // Orders
  getOrders(): DataOrder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) {
        // Default historical orders for John Evans Cole
        const seedOrders: DataOrder[] = [
          {
            id: 'ord-gh-9910',
            packageId: 'pkg-mtn-10gb',
            packageName: '10 GB Data Mart Power Bundle',
            network: 'mtn',
            capacityGb: 10,
            recipientPhone: '0244128990',
            recipientName: 'John Evans Cole',
            amountPaid: 43.0,
            paymentMethod: 'mtn_momo',
            momoNumber: '0244128990',
            transactionRef: 'momo_tx_8849102',
            smsReference: 'MTN-DATA-GH-491029',
            deliveryStatus: 'delivered',
            deliveredAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            validity: 'Non-Expiry',
          },
          {
            id: 'ord-gh-9911',
            packageId: 'pkg-tel-20gb',
            packageName: '20 GB Telecel Red Prime',
            network: 'telecel',
            capacityGb: 20,
            recipientPhone: '0205819204',
            recipientName: 'Sister Grace (Kumasi)',
            amountPaid: 75.0,
            paymentMethod: 'telecel_cash',
            momoNumber: '0244128990',
            transactionRef: 'telecel_tx_1194012',
            smsReference: 'TEL-DATA-GH-881920',
            deliveryStatus: 'delivered',
            deliveredAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            validity: 'Non-Expiry',
          },
          {
            id: 'ord-gh-9912',
            packageId: 'pkg-mtn-50gb',
            packageName: '50 GB Data Mart Titanium Bundle',
            network: 'mtn',
            capacityGb: 50,
            recipientPhone: '0244128990',
            recipientName: 'John Evans Cole (Office Router)',
            amountPaid: 185.0,
            paymentMethod: 'mtn_momo',
            momoNumber: '0244128990',
            transactionRef: 'momo_tx_5591023',
            smsReference: 'MTN-DATA-GH-339102',
            deliveryStatus: 'delivered',
            deliveredAt: new Date(Date.now() - 3600000 * 72).toISOString(),
            validity: 'Non-Expiry',
          },
        ];
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(seedOrders));
        return seedOrders;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  addOrder(order: DataOrder) {
    const orders = this.getOrders();
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Update package sales counter
    const packages = this.getPackages();
    const pkg = packages.find((p) => p.id === order.packageId);
    if (pkg) {
      pkg.totalSold = (pkg.totalSold || 0) + 1;
      this.savePackages(packages);
    }
  },

  removeOrder(orderId: string) {
    const orders = this.getOrders().filter((o) => o.id !== orderId);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return orders;
  },

  // Theme
  getTheme(): 'dark' | 'light' {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  },

  setTheme(theme: 'dark' | 'light') {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },
};
