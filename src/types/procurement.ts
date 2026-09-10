export type BOQStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'SUPERSEDED' | 'ARCHIVED';
export type BOQCategory = 'SOLAR_PANEL' | 'INVERTER' | 'BATTERY' | 'GENERATOR' | 'MOUNTING_STRUCTURE' | 'DC_CABLE' | 'AC_CABLE' | 'CONNECTOR' | 'COMBINER_BOX' | 'DC_PROTECTION' | 'AC_PROTECTION' | 'TRANSFORMER' | 'METERING' | 'MONITORING_SYSTEM' | 'EARTHING' | 'LIGHTNING_PROTECTION' | 'SWITCHGEAR' | 'CONTROL_PANEL' | 'CIVIL_MATERIAL' | 'SPARE_PART' | 'OTHER';
export type BOQUnit = 'PCS' | 'SET' | 'METER' | 'KM' | 'KG' | 'TON' | 'LOT' | 'KWH' | 'KW' | 'KVA' | 'M2' | 'OTHER';

export interface BOQItem {
  id: string;
  boqId: string;
  projectId: string;
  category: BOQCategory;
  itemType?: string;
  description: string;
  manufacturerPreference?: string;
  brandPreference?: string;
  modelPreference?: string;
  technicalSpecification?: string;
  quantity: number;
  unit: BOQUnit;
  estimatedUnitPrice?: number;
  estimatedTotalPrice?: number;
  currency?: string;
  requiredDeliveryDate?: string;
  requiredWarrantyYears?: number;
  isSubstitutionAllowed: boolean;
  approvedEquivalentNotes?: string;
  engineeringReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillOfQuantities {
  id: string;
  boqCode: string;
  projectId: string;
  contractId?: string;
  engineeringDesignId?: string;
  title: string;
  status: BOQStatus;
  version: string;
  currencyPreference: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  changeSummary?: string;
}

export type ProcurementRFQStatus = 'DRAFT' | 'PUBLISHED' | 'OPEN' | 'QUOTES_RECEIVED' | 'CLOSED' | 'AWARDED' | 'CANCELLED';
export type ProcurementRFQVisibility = 'INVITED_ONLY' | 'VERIFIED_VENDORS' | 'PUBLIC_MARKETPLACE';

export interface ProcurementPackage {
  id: string;
  projectId: string;
  boqId: string;
  name: string;
  packageType?: string;
  boqItemIds: string[];
  status: string;
}

export interface ProcurementRFQ {
  id: string;
  procurementRfqCode: string;
  projectId: string;
  boqId: string;
  createdByUserId: string;
  status: ProcurementRFQStatus;
  title: string;
  description?: string;
  submissionDeadline?: string;
  deliveryLocation?: string;
  currency: string;
  paymentTermPreference?: string;
  deliveryTerm?: string;
  warrantyRequirement?: string;
  visibility: ProcurementRFQVisibility;
  includedBoqItemIds: string[]; 
  createdAt: string;
  publishedAt?: string;
  closedAt?: string;
}

export type SupplierInvitationStatus = 'INVITED' | 'VIEWED' | 'DECLINED' | 'QUOTE_SUBMITTED' | 'EXPIRED';

export interface SupplierInvitation {
  id: string;
  procurementRfqId: string;
  vendorId: string;
  status: SupplierInvitationStatus;
  invitedAt: string;
  viewedAt?: string;
  respondedAt?: string;
}

export type VendorQuoteStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';
export type StockStatus = 'IN_STOCK' | 'LIMITED' | 'ORDER_REQUIRED' | 'IMPORT_REQUIRED' | 'UNKNOWN';

export interface VendorQuoteItem {
  id: string;
  quoteId: string;
  boqItemId: string;
  offeredBrand?: string;
  offeredModel?: string;
  technicalSpecification?: string;
  quantity: number;
  unit: BOQUnit;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  countryOfOrigin?: string;
  warrantyYears?: number;
  deliveryLeadTimeDays?: number;
  stockStatus: StockStatus;
  isEquivalent: boolean;
  equivalenceNotes?: string;
  complianceStatus?: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'REQUIRES_REVIEW';
  complianceNotes?: string;
}

export interface VendorQuote {
  id: string;
  quoteCode: string;
  procurementRfqId: string;
  projectId: string;
  vendorId: string;
  status: VendorQuoteStatus;
  currency: string;
  subtotal: number;
  tax: number;
  transportationCost: number;
  otherCost: number;
  totalPrice: number;
  deliveryLeadTimeDays?: number;
  validUntil?: string;
  paymentTerms?: string;
  warrantySummary?: string;
  assumptions?: string;
  exclusions?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  
  // Risk flags computed upon submission/review
  riskFlags?: string[]; 
  hooshyarScore?: number;
}

export interface VendorQuoteRevision {
  id: string;
  quoteId: string;
  revisionNumber: number;
  snapshot: any; 
  changeSummary?: string;
  createdAt: string;
}

export type SupplierAwardStatus = 'AWARDED' | 'CANCELLED';

export interface SupplierAward {
  id: string;
  projectId: string;
  procurementRfqId: string;
  vendorQuoteId: string;
  boqItemIds: string[]; 
  awardedValue: number;
  status: SupplierAwardStatus;
  createdAt: string;
}

export type PurchaseOrderStatus = 'DRAFT' | 'ISSUED' | 'ACKNOWLEDGED' | 'IN_PRODUCTION' | 'READY_TO_SHIP' | 'IN_TRANSIT' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'CANCELLED' | 'CLOSED';

export interface PurchaseOrder {
  id: string;
  poCode: string;
  projectId: string;
  contractId?: string;
  vendorId: string;
  supplierAwardId: string;
  status: PurchaseOrderStatus;
  currency: string;
  totalValue: number;
  issueDate?: string;
  expectedDeliveryDate?: string;
  deliveryLocation?: string;
  paymentTermsSummary?: string;
  warrantySummary?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  boqItemId: string;
  vendorQuoteItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type DeliveryStatus = 'EXPECTED' | 'PARTIAL' | 'RECEIVED' | 'REJECTED' | 'DAMAGED';

export interface DeliveryRecord {
  id: string;
  purchaseOrderId: string;
  projectId: string;
  deliveryNumber: string;
  status: DeliveryStatus;
  deliveryDate?: string;
  receivedByUserId?: string;
  notes?: string;
  createdAt: string;
}

export interface DeliveryItem {
  id: string;
  deliveryRecordId: string;
  purchaseOrderItemId: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  damageNotes?: string;
  serialNumbers?: string[];
}

export interface EquipmentWarranty {
  id: string;
  projectId: string;
  purchaseOrderId: string;
  boqItemId: string;
  manufacturer: string;
  model: string;
  warrantyStart?: string;
  warrantyEnd?: string;
  warrantyType?: string;
  documentId?: string;
}
