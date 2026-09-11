import fs from "fs";

import { EnergyProject, ProjectMember, ProjectDocument, ProjectActivity } from '../types/project.js';
import { Organization } from '../types/organization.js';
import { ProjectFinancialModel, FinancialAssumptionSet, FinancialScenario, ProjectProposal } from '../types/finance.js';
import { InvestmentOpportunity, LandProfile, InvestorProfile, ProjectMatch, ProjectReadinessScore } from '../types/investment.js';
import { BillOfQuantities, BOQItem, ProcurementRFQ, ProcurementPackage, SupplierInvitation, VendorQuote, VendorQuoteItem, VendorQuoteRevision, SupplierAward, PurchaseOrder, PurchaseOrderItem, DeliveryRecord, DeliveryItem } from '../types/procurement.js';
import { EnergyAsset, AssetComponent, EquipmentWarranty, CommissioningRecord, CommissioningTest, AssetOwnershipRecord, AssetPassportSnapshot, AssetPerformanceBaseline, ProjectHandover, FinalProjectCostSummary } from '../types/asset.js';
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { ProjectContract, ContractParty, ContractRevision, ProjectMilestone, MilestoneDependency, ApprovalRequest, ChangeRequest, ProjectBaseline } from '../types/execution.js';

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



export interface SolarAsset {
  id: string;
  projectId?: string | null;
  projectName: string;
  ownerId: string;
  epcCompanyId: string | null;
  location: { city: string; lat: number | null; lon: number | null };
  capacityKw: number;
  technology: string;
  commissionDate: string | null;
  projectStatus: "DRAFT" | "SUBMITTED" | "DOCUMENT_REVIEW" | "APPROVED" | "REJECTED";
  projectValueIRR: number | null;
  expectedAnnualGenerationKwh: number | null;
  projectLifetimeYears: number;
  verificationStatus: "not_verified" | "pending_review" | "verified";
  createdAt: string;
  updatedAt: string;
}

export interface AssetDocument {
  id: string;
  assetId: string;
  documentType: "ownership" | "permit" | "epc_contract" | "om_contract" | "equipment_invoice" | "other";
  fileUrl: string;
  uploadedBy: string;
  verificationStatus: "pending_review" | "verified" | "rejected";
  verificationNotes: string;
  createdAt: string;
}

export interface AssetAuditLog {
  id: string;
  assetId: string;
  userId: string;
  action: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}

export interface User {
  roles?: string[]; // e.g. ["customer", "PROJECT_OWNER", "ADMIN"]
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
  projectId?: string | null;
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
  energyAssets?: EnergyAsset[];
  assetComponents?: AssetComponent[];
  
  commissioningRecords?: CommissioningRecord[];
  commissioningTests?: CommissioningTest[];
  assetOwnershipRecords?: AssetOwnershipRecord[];
  assetPassportSnapshots?: AssetPassportSnapshot[];
  assetPerformanceBaselines?: AssetPerformanceBaseline[];
  projectHandovers?: ProjectHandover[];
  finalProjectCostSummaries?: FinalProjectCostSummary[];
  boqs?: BillOfQuantities[];
  boqItems?: BOQItem[];
  procurementPackages?: ProcurementPackage[];
  procurementRfqs?: ProcurementRFQ[];
  supplierInvitations?: SupplierInvitation[];
  vendorQuotes?: VendorQuote[];
  vendorQuoteItems?: VendorQuoteItem[];
  vendorQuoteRevisions?: VendorQuoteRevision[];
  supplierAwards?: SupplierAward[];
  purchaseOrders?: PurchaseOrder[];
  purchaseOrderItems?: PurchaseOrderItem[];
  deliveryRecords?: DeliveryRecord[];
  deliveryItems?: DeliveryItem[];
  equipmentWarranties?: EquipmentWarranty[];
  projectContracts?: ProjectContract[];
  projectMilestones?: ProjectMilestone[];
  approvalRequests?: ApprovalRequest[];
  energyProjects?: EnergyProject[];
  projectMembers?: ProjectMember[];
  projectDocuments?: ProjectDocument[];
  projectActivities?: ProjectActivity[];
  organizations?: Organization[];
  financialModels?: ProjectFinancialModel[];
  financialAssumptionSets?: FinancialAssumptionSet[];
  financialScenarios?: FinancialScenario[];
  projectProposals?: ProjectProposal[];
  investmentOpportunities?: InvestmentOpportunity[];
  landProfiles?: LandProfile[];
  investorProfiles?: InvestorProfile[];
  projectMatches?: ProjectMatch[];
  projectReadinessScores?: ProjectReadinessScore[];
  solarAssets: SolarAsset[];
  assetDocuments: AssetDocument[];
  assetAuditLogs: AssetAuditLog[];
  vendors: Vendor[];
  products: Product[];
  users: User[];
  otps: OTP[];
  professionals: Professional[];
  ads: Ad[];
  analysisHistory: AnalysisHistory[];
  aiRecommendationLogs?: any[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  subscriptionPlans: SubscriptionPlan[];
  cityIrradianceCache: CityIrradianceCache[];
}

const defaultDB: DB = {
  solarAssets: [],
  assetDocuments: [],
  assetAuditLogs: [],

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
  ],
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

export const db: any = {

  // Execution & Workspace
  getProjectContracts: (projectId: string) => readDB().projectContracts?.filter(c => c.projectId === projectId) || [],
  getContractById: (id: string) => readDB().projectContracts?.find(c => c.id === id),
  createContract: (contract: Omit<ProjectContract, "id" | "createdAt" | "updatedAt">) => {
    const data = readDB();
    if (!data.projectContracts) data.projectContracts = [];
    const newContract = { ...contract, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    data.projectContracts.push(newContract as ProjectContract);
    writeDB(data);
    return newContract;
  },
  updateContract: (id: string, updates: Partial<ProjectContract>) => {
    const data = readDB();
    if (!data.projectContracts) data.projectContracts = [];
    const index = data.projectContracts.findIndex(c => c.id === id);
    if (index !== -1) {
      data.projectContracts[index] = { ...data.projectContracts[index], ...updates, updatedAt: new Date().toISOString() };
      writeDB(data);
      return data.projectContracts[index];
    }
    return null;
  },
  getProjectMilestones: (projectId: string) => readDB().projectMilestones?.filter(m => m.projectId === projectId) || [],
  createMilestone: (milestone: Omit<ProjectMilestone, "id" | "createdAt" | "updatedAt">) => {
    const data = readDB();
    if (!data.projectMilestones) data.projectMilestones = [];
    const newMilestone = { ...milestone, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    data.projectMilestones.push(newMilestone as ProjectMilestone);
    writeDB(data);
    return newMilestone;
  },
  updateMilestone: (id: string, updates: Partial<ProjectMilestone>) => {
    const data = readDB();
    if (!data.projectMilestones) data.projectMilestones = [];
    const index = data.projectMilestones.findIndex(m => m.id === id);
    if (index !== -1) {
      data.projectMilestones[index] = { ...data.projectMilestones[index], ...updates, updatedAt: new Date().toISOString() };
      writeDB(data);
      return data.projectMilestones[index];
    }
    return null;
  },
  getApprovalRequests: (projectId: string) => readDB().approvalRequests?.filter(a => a.projectId === projectId) || [],
  createApprovalRequest: (req: Omit<ApprovalRequest, "id" | "requestedAt">) => {
    const data = readDB();
    if (!data.approvalRequests) data.approvalRequests = [];
    const newReq = { ...req, id: uuidv4(), requestedAt: new Date().toISOString() };
    data.approvalRequests.push(newReq as ApprovalRequest);
    writeDB(data);
    return newReq;
  },
  updateApprovalRequest: (id: string, updates: Partial<ApprovalRequest>) => {
    const data = readDB();
    if (!data.approvalRequests) data.approvalRequests = [];
    const index = data.approvalRequests.findIndex(a => a.id === id);
    if (index !== -1) {
      data.approvalRequests[index] = { ...data.approvalRequests[index], ...updates };
      writeDB(data);
      return data.approvalRequests[index];
    }
    return null;
  },

  getEnergyProjects: () => readDB().energyProjects || [],
  getEnergyProjectById: (id: string) => readDB().energyProjects?.find(p => p.id === id),
  createEnergyProject: (project: Omit<EnergyProject, "id" | "createdAt" | "updatedAt">) => {
    const data = readDB();
    if (!data.energyProjects) data.energyProjects = [];
    const newProject = { ...project, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    data.energyProjects.push(newProject as EnergyProject);
    writeDB(data);
    return newProject as EnergyProject;
  },
  updateEnergyProject: (id: string, updates: Partial<EnergyProject>) => {
    const data = readDB();
    if (!data.energyProjects) data.energyProjects = [];
    const index = data.energyProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      data.energyProjects[index] = { ...data.energyProjects[index], ...updates, updatedAt: new Date().toISOString() };
      writeDB(data);
      return data.energyProjects[index];
    }
    return null;
  },
  
  getProjectMembers: (projectId: string) => (readDB().projectMembers || []).filter(m => m.projectId === projectId),
  createProjectMember: (member: Omit<ProjectMember, "id" | "createdAt">) => {
    const data = readDB();
    if (!data.projectMembers) data.projectMembers = [];
    const newMember = { ...member, id: uuidv4(), createdAt: new Date().toISOString() };
    data.projectMembers.push(newMember as ProjectMember);
    writeDB(data);
    return newMember as ProjectMember;
  },

  getProjectDocuments: (projectId: string) => (readDB().projectDocuments || []).filter(d => d.projectId === projectId),
  createProjectDocument: (doc: Omit<ProjectDocument, "id" | "createdAt">) => {
    const data = readDB();
    if (!data.projectDocuments) data.projectDocuments = [];
    const newDoc = { ...doc, id: uuidv4(), createdAt: new Date().toISOString() };
    data.projectDocuments.push(newDoc as ProjectDocument);
    writeDB(data);
    return newDoc as ProjectDocument;
  },

  getProjectActivities: (projectId: string) => (readDB().projectActivities || []).filter(a => a.projectId === projectId),
  createProjectActivity: (activity: Omit<ProjectActivity, "id" | "createdAt">) => {
    const data = readDB();
    if (!data.projectActivities) data.projectActivities = [];
    const newActivity = { ...activity, id: uuidv4(), createdAt: new Date().toISOString() };
    data.projectActivities.push(newActivity as ProjectActivity);
    writeDB(data);
    return newActivity as ProjectActivity;
  },

  getOrganizations: () => readDB().organizations || [],
  getOrganizationById: (id: string) => readDB().organizations?.find(o => o.id === id),
  createOrganization: (org: Omit<Organization, "id" | "createdAt" | "updatedAt">) => {
    const data = readDB();
    if (!data.organizations) data.organizations = [];
    const newOrg = { ...org, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    data.organizations.push(newOrg as Organization);
    writeDB(data);
    return newOrg as Organization;
  },
  
  updateAnalysisHistoryProjectId: (id: string, projectId: string) => {
    const data = readDB();
    const index = data.analysisHistory.findIndex(h => h.id === id);
    if (index !== -1) {
      data.analysisHistory[index].projectId = projectId;
      writeDB(data);
      return data.analysisHistory[index];
    }
    return null;
  },
  getAnalysisHistoryById: (id: string) => readDB().analysisHistory.find(h => h.id === id),


  getSolarAssets: () => readDB().solarAssets || [],
  getSolarAssetById: (id: string) => readDB().solarAssets?.find(a => a.id === id),
  createSolarAsset: (asset: Omit<SolarAsset, "id" | "createdAt" | "updatedAt">) => {
    const data = readDB();
    if (!data.solarAssets) data.solarAssets = [];
    const newAsset: SolarAsset = { ...asset, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    data.solarAssets.push(newAsset);
    writeDB(data);
    return newAsset;
  },
  updateSolarAsset: (id: string, updates: Partial<SolarAsset>) => {
    const data = readDB();
    if (!data.solarAssets) data.solarAssets = [];
    const index = data.solarAssets.findIndex(a => a.id === id);
    if (index !== -1) {
      data.solarAssets[index] = { ...data.solarAssets[index], ...updates, updatedAt: new Date().toISOString() };
      writeDB(data);
      return data.solarAssets[index];
    }
    return null;
  },
  getAssetDocuments: (assetId: string) => (readDB().assetDocuments || []).filter(d => d.assetId === assetId),
  createAssetDocument: (doc: Omit<AssetDocument, "id" | "createdAt">) => {
    const data = readDB();
    if (!data.assetDocuments) data.assetDocuments = [];
    const newDoc: AssetDocument = { ...doc, id: uuidv4(), createdAt: new Date().toISOString() };
    data.assetDocuments.push(newDoc);
    writeDB(data);
    return newDoc;
  },
  createAssetAuditLog: (log: Omit<AssetAuditLog, "id" | "timestamp">) => {
    const data = readDB();
    if (!data.assetAuditLogs) data.assetAuditLogs = [];
    const newLog: AssetAuditLog = { ...log, id: uuidv4(), timestamp: new Date().toISOString() };
    data.assetAuditLogs.push(newLog);
    writeDB(data);
    return newLog;
  },

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
  addRecommendationLog: (log: any) => {
    const data = readDB();
    if (!data.aiRecommendationLogs) data.aiRecommendationLogs = [];
    data.aiRecommendationLogs.push({ ...log, id: uuidv4(), createdAt: new Date().toISOString() });
    writeDB(data);
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
  },
  // Finance methods
  getFinancialModelsByProjectId: (projectId: string) => (readDB().financialModels || []).filter(m => m.projectId === projectId),
  getFinancialModelById: (id: string) => (readDB().financialModels || []).find(m => m.id === id),
  createFinancialModel: (model: Omit<ProjectFinancialModel, "id" | "createdAt" | "updatedAt">) => {
    const data = readDB();
    if (!data.financialModels) data.financialModels = [];
    const newModel: ProjectFinancialModel = { ...model, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    data.financialModels.push(newModel);
    writeDB(data);
    return newModel;
  },
  updateFinancialModel: (id: string, updates: Partial<ProjectFinancialModel>) => {
    const data = readDB();
    if (!data.financialModels) data.financialModels = [];
    const index = data.financialModels.findIndex(m => m.id === id);
    if (index !== -1) {
      data.financialModels[index] = { ...data.financialModels[index], ...updates, updatedAt: new Date().toISOString() };
      writeDB(data);
      return data.financialModels[index];
    }
    return null;
  },
  
  getFinancialAssumptionSetById: (id: string) => (readDB().financialAssumptionSets || []).find(a => a.id === id),
  createFinancialAssumptionSet: (set: Omit<FinancialAssumptionSet, "id" | "createdAt" | "updatedAt">) => {
    const data = readDB();
    if (!data.financialAssumptionSets) data.financialAssumptionSets = [];
    const newSet: FinancialAssumptionSet = { ...set, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    data.financialAssumptionSets.push(newSet);
    writeDB(data);
    return newSet;
  },

  getFinancialScenariosByModelId: (modelId: string) => (readDB().financialScenarios || []).filter(s => s.financialModelId === modelId),
  createFinancialScenario: (scenario: Omit<FinancialScenario, "id" | "createdAt" | "updatedAt">) => {
    const data = readDB();
    if (!data.financialScenarios) data.financialScenarios = [];
    const newScenario: FinancialScenario = { ...scenario, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    data.financialScenarios.push(newScenario);
    writeDB(data);
    return newScenario;
  },
  
  getProjectProposalsByProjectId: (projectId: string) => (readDB().projectProposals || []).filter(p => p.projectId === projectId),
  createProjectProposal: (proposal: Omit<ProjectProposal, "id" | "createdAt">) => {
    const data = readDB();
    if (!data.projectProposals) data.projectProposals = [];
    const newProposal: ProjectProposal = { ...proposal, id: uuidv4(), createdAt: new Date().toISOString() };
    data.projectProposals.push(newProposal);
    writeDB(data);
    return newProposal;
  },
  // Investment Methods
  getInvestmentOpportunities: () => readDB().investmentOpportunities || [],
  getInvestmentOpportunityById: (id: string) => (readDB().investmentOpportunities || []).find(o => o.id === id),
  createInvestmentOpportunity: (opp: Omit<InvestmentOpportunity, "id" | "createdAt" | "updatedAt">) => {
    const data = readDB();
    if (!data.investmentOpportunities) data.investmentOpportunities = [];
    const newOpp: InvestmentOpportunity = { ...opp, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    data.investmentOpportunities.push(newOpp);
    writeDB(data);
    return newOpp;
  },
  updateInvestmentOpportunity: (id: string, updates: Partial<InvestmentOpportunity>) => {
    const data = readDB();
    if (!data.investmentOpportunities) data.investmentOpportunities = [];
    const index = data.investmentOpportunities.findIndex(o => o.id === id);
    if (index !== -1) {
      data.investmentOpportunities[index] = { ...data.investmentOpportunities[index], ...updates, updatedAt: new Date().toISOString() };
      writeDB(data);
      return data.investmentOpportunities[index];
    }
    return null;
  },

  getInvestorProfiles: () => readDB().investorProfiles || [],
  getInvestorProfileById: (id: string) => (readDB().investorProfiles || []).find(p => p.id === id),
  getInvestorProfileByUserId: (userId: string) => (readDB().investorProfiles || []).find(p => p.userId === userId),
  createInvestorProfile: (profile: Omit<InvestorProfile, "id" | "createdAt" | "updatedAt">) => {
    const data = readDB();
    if (!data.investorProfiles) data.investorProfiles = [];
    const newProfile: InvestorProfile = { ...profile, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    data.investorProfiles.push(newProfile);
    writeDB(data);
    return newProfile;
  },
  
  getProjectMatchesForInvestor: (investorProfileId: string) => (readDB().projectMatches || []).filter(m => m.investorProfileId === investorProfileId),
  getProjectMatchesForOpportunity: (opportunityId: string) => (readDB().projectMatches || []).filter(m => m.opportunityId === opportunityId),
  createProjectMatch: (match: Omit<ProjectMatch, "id" | "createdAt" | "updatedAt">) => {
    const data = readDB();
    if (!data.projectMatches) data.projectMatches = [];
    const newMatch: ProjectMatch = { ...match, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    data.projectMatches.push(newMatch);
    writeDB(data);
    return newMatch;
  },
  updateProjectMatch: (id: string, updates: Partial<ProjectMatch>) => {
    const data = readDB();
    if (!data.projectMatches) data.projectMatches = [];
    const index = data.projectMatches.findIndex(m => m.id === id);
    if (index !== -1) {
      data.projectMatches[index] = { ...data.projectMatches[index], ...updates, updatedAt: new Date().toISOString() };
      writeDB(data);
      return data.projectMatches[index];
    }
    return null;
  },
  // Procurement
  getBOQs: (projectId: string) => readDB().boqs?.filter((b: any) => b.projectId === projectId) || [],
  getBOQById: (id: string) => readDB().boqs?.find((b: any) => b.id === id),
  createBOQ: (boq: any) => { const d = readDB(); if(!d.boqs) d.boqs = []; const n = { ...boq, id: require('uuid').v4(), boqCode: 'BOQ-HSE-' + Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; d.boqs.push(n); writeDB(d); return n; },
  updateBOQ: (id: string, updates: any) => { const d = readDB(); if(!d.boqs) d.boqs = []; const idx = d.boqs.findIndex((b: any) => b.id === id); if(idx > -1) { d.boqs[idx] = { ...d.boqs[idx], ...updates, updatedAt: new Date().toISOString() }; writeDB(d); return d.boqs[idx]; } return null; },
  getBOQItems: (boqId: string) => readDB().boqItems?.filter((i: any) => i.boqId === boqId) || [],
  createBOQItem: (item: any) => { const d = readDB(); if(!d.boqItems) d.boqItems = []; const n = { ...item, id: require('uuid').v4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; d.boqItems.push(n); writeDB(d); return n; },
  updateBOQItem: (id: string, updates: any) => { const d = readDB(); if(!d.boqItems) d.boqItems = []; const idx = d.boqItems.findIndex((i: any) => i.id === id); if(idx > -1) { d.boqItems[idx] = { ...d.boqItems[idx], ...updates, updatedAt: new Date().toISOString() }; writeDB(d); return d.boqItems[idx]; } return null; },
  deleteBOQItem: (id: string) => { const d = readDB(); if(!d.boqItems) return; d.boqItems = d.boqItems.filter((i: any) => i.id !== id); writeDB(d); },
  getProcurementRFQs: (projectId: string) => readDB().procurementRfqs?.filter((r: any) => r.projectId === projectId) || [],
  getProcurementRFQById: (id: string) => readDB().procurementRfqs?.find((r: any) => r.id === id),
  createProcurementRFQ: (rfq: any) => { const d = readDB(); if(!d.procurementRfqs) d.procurementRfqs = []; const n = { ...rfq, id: require('uuid').v4(), procurementRfqCode: 'PRFQ-HSE-' + Date.now(), createdAt: new Date().toISOString() }; d.procurementRfqs.push(n); writeDB(d); return n; },
  updateProcurementRFQ: (id: string, updates: any) => { const d = readDB(); if(!d.procurementRfqs) d.procurementRfqs = []; const idx = d.procurementRfqs.findIndex((r: any) => r.id === id); if(idx > -1) { d.procurementRfqs[idx] = { ...d.procurementRfqs[idx], ...updates }; writeDB(d); return d.procurementRfqs[idx]; } return null; },
  getSupplierInvitations: (rfqId: string) => readDB().supplierInvitations?.filter((i: any) => i.procurementRfqId === rfqId) || [],
  getSupplierInvitationByVendorId: (vendorId: string) => readDB().supplierInvitations?.filter((i: any) => i.vendorId === vendorId) || [],
  createSupplierInvitation: (inv: any) => { const d = readDB(); if(!d.supplierInvitations) d.supplierInvitations = []; const n = { ...inv, id: require('uuid').v4(), invitedAt: new Date().toISOString() }; d.supplierInvitations.push(n); writeDB(d); return n; },
  updateSupplierInvitation: (id: string, updates: any) => { const d = readDB(); if(!d.supplierInvitations) d.supplierInvitations = []; const idx = d.supplierInvitations.findIndex((i: any) => i.id === id); if(idx > -1) { d.supplierInvitations[idx] = { ...d.supplierInvitations[idx], ...updates }; writeDB(d); return d.supplierInvitations[idx]; } return null; },
  getVendorQuotes: (rfqId: string) => readDB().vendorQuotes?.filter((q: any) => q.procurementRfqId === rfqId) || [],
  getVendorQuoteById: (id: string) => readDB().vendorQuotes?.find((q: any) => q.id === id),
  createVendorQuote: (quote: any) => { const d = readDB(); if(!d.vendorQuotes) d.vendorQuotes = []; const n = { ...quote, id: require('uuid').v4(), quoteCode: 'VQ-HSE-' + Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; d.vendorQuotes.push(n); writeDB(d); return n; },
  updateVendorQuote: (id: string, updates: any) => { const d = readDB(); if(!d.vendorQuotes) d.vendorQuotes = []; const idx = d.vendorQuotes.findIndex((q: any) => q.id === id); if(idx > -1) { d.vendorQuotes[idx] = { ...d.vendorQuotes[idx], ...updates, updatedAt: new Date().toISOString() }; writeDB(d); return d.vendorQuotes[idx]; } return null; },
  getVendorQuoteItems: (quoteId: string) => readDB().vendorQuoteItems?.filter((i: any) => i.quoteId === quoteId) || [],
  createVendorQuoteItem: (item: any) => { const d = readDB(); if(!d.vendorQuoteItems) d.vendorQuoteItems = []; const n = { ...item, id: require('uuid').v4() }; d.vendorQuoteItems.push(n); writeDB(d); return n; },
  updateVendorQuoteItem: (id: string, updates: any) => { const d = readDB(); if(!d.vendorQuoteItems) d.vendorQuoteItems = []; const idx = d.vendorQuoteItems.findIndex((i: any) => i.id === id); if(idx > -1) { d.vendorQuoteItems[idx] = { ...d.vendorQuoteItems[idx], ...updates }; writeDB(d); return d.vendorQuoteItems[idx]; } return null; },
  getSupplierAwards: (rfqId: string) => readDB().supplierAwards?.filter((a: any) => a.procurementRfqId === rfqId) || [],
  createSupplierAward: (award: any) => { const d = readDB(); if(!d.supplierAwards) d.supplierAwards = []; const n = { ...award, id: require('uuid').v4(), createdAt: new Date().toISOString() }; d.supplierAwards.push(n); writeDB(d); return n; },
  updateSupplierAward: (id: string, updates: any) => { const d = readDB(); if(!d.supplierAwards) d.supplierAwards = []; const idx = d.supplierAwards.findIndex((a: any) => a.id === id); if(idx > -1) { d.supplierAwards[idx] = { ...d.supplierAwards[idx], ...updates }; writeDB(d); return d.supplierAwards[idx]; } return null; },
  getPurchaseOrders: (projectId: string) => readDB().purchaseOrders?.filter((p: any) => p.projectId === projectId) || [],
  getPurchaseOrderById: (id: string) => readDB().purchaseOrders?.find((p: any) => p.id === id),
  createPurchaseOrder: (po: any) => { const d = readDB(); if(!d.purchaseOrders) d.purchaseOrders = []; const n = { ...po, id: require('uuid').v4(), poCode: 'PO-HSE-' + Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; d.purchaseOrders.push(n); writeDB(d); return n; },
  updatePurchaseOrder: (id: string, updates: any) => { const d = readDB(); if(!d.purchaseOrders) d.purchaseOrders = []; const idx = d.purchaseOrders.findIndex((p: any) => p.id === id); if(idx > -1) { d.purchaseOrders[idx] = { ...d.purchaseOrders[idx], ...updates, updatedAt: new Date().toISOString() }; writeDB(d); return d.purchaseOrders[idx]; } return null; },
  getPurchaseOrderItems: (poId: string) => readDB().purchaseOrderItems?.filter((i: any) => i.purchaseOrderId === poId) || [],
  createPurchaseOrderItem: (item: any) => { const d = readDB(); if(!d.purchaseOrderItems) d.purchaseOrderItems = []; const n = { ...item, id: require('uuid').v4() }; d.purchaseOrderItems.push(n); writeDB(d); return n; },
  getDeliveryRecords: (poId: string) => readDB().deliveryRecords?.filter((d: any) => d.purchaseOrderId === poId) || [],
  createDeliveryRecord: (rec: any) => { const d = readDB(); if(!d.deliveryRecords) d.deliveryRecords = []; const n = { ...rec, id: require('uuid').v4(), createdAt: new Date().toISOString() }; d.deliveryRecords.push(n); writeDB(d); return n; },
  updateDeliveryRecord: (id: string, updates: any) => { const d = readDB(); if(!d.deliveryRecords) d.deliveryRecords = []; const idx = d.deliveryRecords.findIndex((dr: any) => dr.id === id); if(idx > -1) { d.deliveryRecords[idx] = { ...d.deliveryRecords[idx], ...updates }; writeDB(d); return d.deliveryRecords[idx]; } return null; },
  // Asset
  getAssets: () => readDB().energyAssets || [],
  getAssetById: (id: string) => readDB().energyAssets?.find((a: any) => a.id === id),
  getAssetsByProjectId: (projectId: string) => readDB().energyAssets?.filter((a: any) => a.projectId === projectId) || [],
  createAsset: (asset: any) => { const d = readDB(); if(!d.energyAssets) d.energyAssets = []; const n = { ...asset, id: require('uuid').v4(), assetCode: 'HEA-IR-' + Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; d.energyAssets.push(n); writeDB(d); return n; },
  updateAsset: (id: string, updates: any) => { const d = readDB(); if(!d.energyAssets) d.energyAssets = []; const idx = d.energyAssets.findIndex((a: any) => a.id === id); if(idx > -1) { d.energyAssets[idx] = { ...d.energyAssets[idx], ...updates, updatedAt: new Date().toISOString() }; writeDB(d); return d.energyAssets[idx]; } return null; },
  getAssetComponents: (assetId: string) => readDB().assetComponents?.filter((c: any) => c.assetId === assetId) || [],
  createAssetComponent: (comp: any) => { const d = readDB(); if(!d.assetComponents) d.assetComponents = []; const n = { ...comp, id: require('uuid').v4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; d.assetComponents.push(n); writeDB(d); return n; },
  updateAssetComponent: (id: string, updates: any) => { const d = readDB(); if(!d.assetComponents) d.assetComponents = []; const idx = d.assetComponents.findIndex((c: any) => c.id === id); if(idx > -1) { d.assetComponents[idx] = { ...d.assetComponents[idx], ...updates, updatedAt: new Date().toISOString() }; writeDB(d); return d.assetComponents[idx]; } return null; },
  getEquipmentWarranties: (assetId: string) => readDB().equipmentWarranties?.filter((w: any) => w.assetId === assetId) || [],
  createEquipmentWarranty: (warranty: any) => { const d = readDB(); if(!d.equipmentWarranties) d.equipmentWarranties = []; const n = { ...warranty, id: require('uuid').v4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; d.equipmentWarranties.push(n); writeDB(d); return n; },
  updateEquipmentWarranty: (id: string, updates: any) => { const d = readDB(); if(!d.equipmentWarranties) d.equipmentWarranties = []; const idx = d.equipmentWarranties.findIndex((w: any) => w.id === id); if(idx > -1) { d.equipmentWarranties[idx] = { ...d.equipmentWarranties[idx], ...updates, updatedAt: new Date().toISOString() }; writeDB(d); return d.equipmentWarranties[idx]; } return null; },
  getCommissioningRecords: (projectId: string) => readDB().commissioningRecords?.filter((r: any) => r.projectId === projectId) || [],
  createCommissioningRecord: (record: any) => { const d = readDB(); if(!d.commissioningRecords) d.commissioningRecords = []; const n = { ...record, id: require('uuid').v4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; d.commissioningRecords.push(n); writeDB(d); return n; },
  updateCommissioningRecord: (id: string, updates: any) => { const d = readDB(); if(!d.commissioningRecords) d.commissioningRecords = []; const idx = d.commissioningRecords.findIndex((r: any) => r.id === id); if(idx > -1) { d.commissioningRecords[idx] = { ...d.commissioningRecords[idx], ...updates, updatedAt: new Date().toISOString() }; writeDB(d); return d.commissioningRecords[idx]; } return null; },
  getCommissioningTests: (recordId: string) => readDB().commissioningTests?.filter((t: any) => t.commissioningRecordId === recordId) || [],
  createCommissioningTest: (test: any) => { const d = readDB(); if(!d.commissioningTests) d.commissioningTests = []; const n = { ...test, id: require('uuid').v4() }; d.commissioningTests.push(n); writeDB(d); return n; },
  updateCommissioningTest: (id: string, updates: any) => { const d = readDB(); if(!d.commissioningTests) d.commissioningTests = []; const idx = d.commissioningTests.findIndex((t: any) => t.id === id); if(idx > -1) { d.commissioningTests[idx] = { ...d.commissioningTests[idx], ...updates }; writeDB(d); return d.commissioningTests[idx]; } return null; },
  getProjectHandover: (projectId: string) => readDB().projectHandovers?.find((h: any) => h.projectId === projectId),
  createProjectHandover: (handover: any) => { const d = readDB(); if(!d.projectHandovers) d.projectHandovers = []; const n = { ...handover, id: require('uuid').v4() }; d.projectHandovers.push(n); writeDB(d); return n; },
  updateProjectHandover: (id: string, updates: any) => { const d = readDB(); if(!d.projectHandovers) d.projectHandovers = []; const idx = d.projectHandovers.findIndex((h: any) => h.id === id); if(idx > -1) { d.projectHandovers[idx] = { ...d.projectHandovers[idx], ...updates }; writeDB(d); return d.projectHandovers[idx]; } return null; },
  getAssetPassportSnapshots: (assetId: string) => readDB().assetPassportSnapshots?.filter((s: any) => s.assetId === assetId) || [],
  createAssetPassportSnapshot: (snapshot: any) => { const d = readDB(); if(!d.assetPassportSnapshots) d.assetPassportSnapshots = []; const n = { ...snapshot, id: require('uuid').v4(), generatedAt: new Date().toISOString() }; d.assetPassportSnapshots.push(n); writeDB(d); return n; }
};
