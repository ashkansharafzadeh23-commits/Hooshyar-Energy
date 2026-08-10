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

interface DB {
  vendors: Vendor[];
  products: Product[];
}

const defaultDB: DB = {
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
