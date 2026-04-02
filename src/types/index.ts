// ===== Enums / Literal Types =====
export type SiteConfigType = 'national' | 'group_of_sites';
export type Circuit = 'direct' | 'stock';
export type SiteType = 'magasin' | 'entrepot';
export type Incoterm = 'EXW' | 'FCA' | 'DAP' | 'DDP';

// ===== Core Entities =====
export interface Site {
  id: string;
  name: string;
  city: string;
  type: SiteType;
}

export interface SiteGroup {
  id: string;
  name: string;
  siteType: SiteType;
  siteIds: string[];
}

// A "grappe" is a cluster of site groups
export interface Grappe {
  id: string;
  name: string;
  supplierId: string;
  siteGroups: SiteGroup[];
}

export interface Supplier {
  id: string;
  name: string;
  siteConfigType: SiteConfigType;
  supportedCircuits: Circuit[];
  siteIds: string[];
  defaultGrappeIds: string[];
}

export interface Reference {
  id: string;
  ean: string;
  label: string;
  supplierRef: string;
  purchaseConditionId: string;
}

export interface PurchaseCondition {
  id: string;
  supplierId: string;
  circuit: Circuit;
  incoterm: Incoterm;
  grappeId: string | null;
  siteGroupId: string | null;
  siteIds: string[];
  referenceIds: string[];
}

// ===== Change Tracking =====
export type ChangeType = 'supplier_change' | 'circuit_change' | 'site_assignment' | 'config_change';

export interface PendingChange {
  id: string;
  type: ChangeType;
  referenceIds: string[];
  description: string;
  before: {
    supplierId?: string;
    supplierName?: string;
    circuit?: Circuit;
    siteConfigType?: SiteConfigType;
    siteIds?: string[];
    grappeId?: string | null;
    ean?: string;
    supplierRef?: string;
  };
  after: {
    supplierId?: string;
    supplierName?: string;
    circuit?: Circuit;
    siteConfigType?: SiteConfigType;
    siteIds?: string[];
    grappeId?: string | null;
    ean?: string;
    supplierRef?: string;
  };
  timestamp: number;
}

// ===== UI State =====
export type PageId = 'references' | 'suppliers' | 'grappes' | 'recap';

export interface ReferenceFilters {
  search: string;
  supplierId: string | null;
  circuit: Circuit | null;
  siteConfigType: SiteConfigType | null;
}
