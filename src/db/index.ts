import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const DB_PATH = path.join(process.cwd(), "db.json");

interface Vendor {
  id: string;
  companyName: string;
  logoUrl: string;
  aboutUs: string;
  categories: string[];
  address: string;
  city: string;
  location?: { lat: number; lng: number };
  phones: { label: string; number: string }[];
  workingHours: string;
  website: string;
  status: "pending_review" | "approved" | "rejected";
  createdAt: string;
}

interface Product {
  id: string;
  vendorId: string;
  category: string;
  brand: string;
  model: string;
  specs: any;
  price: number;
  currency: string;
  images: string[];
  description: string;
  inStock: boolean;
  warrantyYears: number;
  createdAt: string;
}


export interface User {
  id: string;
  phone: string;
  name: string;
  createdAt: string;
  activeSubscriptionId: string | null;
}

export interface OTP {
  phone: string;
  code: string;
  expiresAt: number;
}

export interface Professional {
  id: string;
  fullName: string;
  phone: string;
  specialties: string[];
  serviceCities: string[];
  yearsExperience: number;
  bio: string;
  profileImageUrl: string;
  certifications: { title: string; imageUrl: string }[];
  status: "pending_review" | "approved" | "rejected";
  rating: number | null;
  createdAt: string;
}

export interface Ad {
  id: string;
  ownerType: "vendor" | "professional";
  ownerId: string;
  title: string;
  imageUrl: string;
  linkTo: string;
  placement: string;
  startDate: string;
  endDate: string;
  status: "pending_review" | "active" | "expired" | "rejected";
  planId: string;
  createdAt: string;
}

export interface AnalysisHistory {
  id: string;
  userId: string;
  createdAt: string;
  input: any;
  resultSummary: string;
  fullResult: any;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceIRR: number;
  durationDays: number | null;
  features: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  authority: string | null;
  status: "pending" | "success" | "failed";
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface CityIrradianceCache {
  city: string;
  sunHours: number;
  coords: { lat: number; lon: number };
  fetchedAt: number;
  monthlySunHours?: Record<string, number>;
}

interface DB {
  vendors: Vendor[];
  products: Product[];
  users: User[];
  otps: OTP[];
  professionals: Professional[];
  ads: Ad[];
  analysisHistory: AnalysisHistory[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  subscriptionPlans: SubscriptionPlan[];
  cityIrradianceCache: CityIrradianceCache[];
}

const defaultDB: DB = {

  users: [],
  otps: [],
  professionals: [],
  ads: [],
  analysisHistory: [],
  transactions: [],
  subscriptions: [],
  cityIrradianceCache: [],
  subscriptionPlans: [
    { id: "plan_free", name: "رایگان", priceIRR: 0, durationDays: null, features: ["۳ تحلیل رایگان در ماه"] },
    { id: "plan_pro", name: "حرفه‌ای", priceIRR: 990000, durationDays: 30, features: ["تحلیل نامحدود", "دسترسی به تاریخچه کامل", "اولویت در نمایش پیشنهاد فروشندگان"] }
  ],

  vendors: [
    {
      id: "vendor_001",
      companyName: "انرژی نوین",
      logoUrl: "",
      aboutUs: "ارائه‌دهنده راهکارهای انرژی تجدیدپذیر",
      categories: ["solar_panel", "inverter", "battery"],
      address: "خیابان ولیعصر",
      city: "تهران",
      phones: [{ label: "فروش", number: "021-12345678" }],
      workingHours: "۸ الی ۱۷",
      website: "https://example.com",
      status: "approved",
      createdAt: new Date().toISOString(),
    }
  ],
  products: [
    {
      id: "prod_001",
      vendorId: "vendor_001",
      category: "solar_panel",
      brand: "JA Solar",
      model: "JAM54S31-550/MR",
      specs: { powerWatt: 550, widthM: 1.13, heightM: 2.27, type: "monocrystalline" },
      price: 4500000,
      currency: "IRR",
      images: [],
      description: "پنل خورشیدی 550 وات مونوکریستال هالف سل",
      inStock: true,
      warrantyYears: 12,
      createdAt: new Date().toISOString(),
    },
    {
      id: "prod_001b",
      vendorId: "vendor_001",
      category: "solar_panel",
      brand: "Yingli",
      model: "YL300P-29b",
      specs: { powerWatt: 300, widthM: 0.99, heightM: 1.64, type: "polycrystalline" },
      price: 2000000,
      currency: "IRR",
      images: [],
      description: "پنل خورشیدی 300 وات پلی کریستال (اقتصادی)",
      inStock: true,
      warrantyYears: 10,
      createdAt: new Date().toISOString(),
    },
    {
      id: "prod_001c",
      vendorId: "vendor_001",
      category: "solar_panel",
      brand: "SunPower",
      model: "Maxeon 6",
      specs: { powerWatt: 475, widthM: 1.04, heightM: 1.81, type: "monocrystalline" },
      price: 6500000,
      currency: "IRR",
      images: [],
      description: "پنل خورشیدی 475 وات راندمان بالا (کم‌فضا)",
      inStock: true,
      warrantyYears: 25,
      createdAt: new Date().toISOString(),
    },
    {
      id: "prod_002",
      vendorId: "vendor_001",
      category: "generator",
      brand: "Hyundai",
      model: "HG5355-PG",
      specs: { kva: 3, fuelType: "petrol", phase: 1 },
      price: 15000000,
      currency: "IRR",
      images: [],
      description: "موتور برق 3 کیلووات هیوندای",
      inStock: true,
      warrantyYears: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: "prod_003",
      vendorId: "vendor_001",
      category: "powerbank",
      brand: "EcoFlow",
      model: "DELTA Max",
      specs: { capacityKwh: 2, outputWatt: 2400 },
      price: 85000000,
      currency: "IRR",
      images: [],
      description: "پاوربانک خانگی 2 کیلووات ساعت با خروجی 2400 وات",
      inStock: true,
      warrantyYears: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: "prod_004",
      vendorId: "vendor_001",
      category: "inverter",
      brand: "Growatt",
      model: "MIN 5000TL-X",
      specs: { powerKw: 5, phase: 1, mode: "on-grid" },
      price: 32000000,
      currency: "IRR",
      images: [],
      description: "اینورتر متصل به شبکه 5 کیلووات تک فاز",
      inStock: true,
      warrantyYears: 5,
      createdAt: new Date().toISOString(),
    }
  ]
};

function readDB(): DB {
  if (!fs.existsSync(DB_PATH)) {
    writeDB(defaultDB);
    return defaultDB;
  }
  const data = fs.readFileSync(DB_PATH, "utf-8");
  try {
    return JSON.parse(data) as DB;
  } catch {
    return defaultDB;
  }
}

function writeDB(data: DB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export const db = {
  getCityIrradianceCache: (city: string) => readDB().cityIrradianceCache?.find(c => c.city === city),
  setCityIrradianceCache: (cache: CityIrradianceCache) => {
    const data = readDB();
    if (!data.cityIrradianceCache) data.cityIrradianceCache = [];
    const index = data.cityIrradianceCache.findIndex(c => c.city === cache.city);
    if (index !== -1) {
      data.cityIrradianceCache[index] = cache;
    } else {
      data.cityIrradianceCache.push(cache);
    }
    writeDB(data);
  },

  getUsers: () => readDB().users,
  getUserByPhone: (phone: string) => readDB().users.find(u => u.phone === phone),
  getUserById: (id: string) => readDB().users.find(u => u.id === id),
  createUser: (user: Omit<User, "id" | "createdAt">) => {
    const data = readDB();
    const newUser: User = { ...user, id: uuidv4(), createdAt: new Date().toISOString() };
    data.users.push(newUser);
    writeDB(data);
    return newUser;
  },
  updateUser: (id: string, updates: Partial<User>) => {
    const data = readDB();
    const index = data.users.findIndex(u => u.id === id);
    if (index !== -1) {
      data.users[index] = { ...data.users[index], ...updates };
      writeDB(data);
      return data.users[index];
    }
    return null;
  },
  saveOTP: (phone: string, code: string) => {
    const data = readDB();
    data.otps = data.otps.filter(o => o.phone !== phone);
    data.otps.push({ phone, code, expiresAt: Date.now() + 2 * 60 * 1000 });
    writeDB(data);
  },
  verifyOTP: (phone: string, code: string) => {
    const data = readDB();
    const otp = data.otps.find(o => o.phone === phone && o.code === code);
    if (otp && otp.expiresAt > Date.now()) {
      data.otps = data.otps.filter(o => o.phone !== phone);
      writeDB(data);
      return true;
    }
    return false;
  },
  getProfessionals: () => readDB().professionals,
  getProfessionalById: (id: string) => readDB().professionals.find(p => p.id === id),
  createProfessional: (professional: Omit<Professional, "id" | "createdAt" | "status">) => {
    const data = readDB();
    const newPro: Professional = { ...professional, id: uuidv4(), status: "pending_review", createdAt: new Date().toISOString(), rating: null };
    data.professionals.push(newPro);
    writeDB(data);
    return newPro;
  },
  getAds: (placement?: string) => {
    const ads = readDB().ads.filter(a => a.status === "active");
    if (placement) return ads.filter(a => a.placement === placement);
    return ads;
  },
  createAd: (ad: Omit<Ad, "id" | "createdAt" | "status">) => {
    const data = readDB();
    const newAd: Ad = { ...ad, id: uuidv4(), status: "pending_review", createdAt: new Date().toISOString() };
    data.ads.push(newAd);
    writeDB(data);
    return newAd;
  },
  getHistoryByUserId: (userId: string) => {
    return readDB().analysisHistory.filter(h => h.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  addHistory: (history: Omit<AnalysisHistory, "id" | "createdAt">) => {
    const data = readDB();
    const newHist: AnalysisHistory = { ...history, id: uuidv4(), createdAt: new Date().toISOString() };
    data.analysisHistory.push(newHist);
    writeDB(data);
    return newHist;
  },
  getSubscriptionPlans: () => readDB().subscriptionPlans,
  getSubscriptionPlanById: (id: string) => readDB().subscriptionPlans.find(p => p.id === id),
  createTransaction: (tx: Omit<Transaction, "id" | "createdAt" | "status" | "authority">) => {
    const data = readDB();
    const newTx: Transaction = { ...tx, id: uuidv4(), authority: null, status: "pending", createdAt: new Date().toISOString() };
    data.transactions.push(newTx);
    writeDB(data);
    return newTx;
  },
  updateTransactionAuthority: (id: string, authority: string) => {
    const data = readDB();
    const tx = data.transactions.find(t => t.id === id);
    if (tx) {
      tx.authority = authority;
      writeDB(data);
      return tx;
    }
    return null;
  },
  getTransactionByAuthority: (authority: string) => readDB().transactions.find(t => t.authority === authority),
  updateTransactionStatus: (id: string, status: Transaction["status"]) => {
    const data = readDB();
    const tx = data.transactions.find(t => t.id === id);
    if (tx) {
      tx.status = status;
      writeDB(data);
      return tx;
    }
    return null;
  },
  createSubscription: (sub: Omit<Subscription, "id" | "createdAt">) => {
    const data = readDB();
    const newSub: Subscription = { ...sub, id: uuidv4(), createdAt: new Date().toISOString() };
    data.subscriptions.push(newSub);
    writeDB(data);
    return newSub;
  },
  getSubscriptionById: (id: string) => readDB().subscriptions.find(s => s.id === id),

  getVendors: () => readDB().vendors,
  getVendorById: (id: string) => readDB().vendors.find((v) => v.id === id),
  createVendor: (vendor: Omit<Vendor, "id" | "createdAt" | "status">) => {
    const data = readDB();
    const newVendor: Vendor = {
      ...vendor,
      id: uuidv4(),
      status: "pending_review",
      createdAt: new Date().toISOString(),
    };
    data.vendors.push(newVendor);
    writeDB(data);
    return newVendor;
  },
  getProducts: () => readDB().products,
  createProduct: (product: Omit<Product, "id" | "createdAt">) => {
    const data = readDB();
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    data.products.push(newProduct);
    writeDB(data);
    return newProduct;
  }
};
