import { Circuit, ReferenceFilters, SiteConfigType, PageId, Grappe, SiteGroup, Supplier } from '../types';

export type Action =
  | { type: 'SET_PAGE'; page: PageId }
  | { type: 'SET_FILTERS'; filters: Partial<ReferenceFilters> }
  | { type: 'SELECT_REFERENCES'; ids: string[] }
  | { type: 'DESELECT_REFERENCES'; ids: string[] }
  | { type: 'SELECT_ALL_FILTERED'; ids: string[] }
  | { type: 'DESELECT_ALL' }
  | {
      type: 'CHANGE_SUPPLIER';
      referenceIds: string[];
      newSupplierId: string;
      newCircuit: Circuit;
      newGrappeId: string | null;
      barcodeUpdates: Record<string, { ean: string; supplierRef: string }>;
    }
  | {
      type: 'CHANGE_CIRCUIT';
      referenceIds: string[];
      newCircuit: Circuit;
      newSiteIds: string[];
      newGrappeId: string | null;
    }
  | {
      type: 'CHANGE_SITES';
      referenceIds: string[];
      newSiteIds: string[];
      newGrappeId: string | null;
    }
  | {
      type: 'CHANGE_SUPPLIER_CONFIG';
      supplierId: string;
      newConfigType: SiteConfigType;
      newGrappes?: Grappe[];
    }
  | {
      type: 'ADD_GRAPPE';
      grappe: Grappe;
    }
  | {
      type: 'UPDATE_GRAPPE';
      grappe: Grappe;
    }
  | {
      type: 'DELETE_GRAPPE';
      grappeId: string;
    }
  | {
      type: 'ADD_SITE_GROUP';
      grappeId: string;
      siteGroup: SiteGroup;
    }
  | {
      type: 'UPDATE_SITE_GROUP';
      grappeId: string;
      siteGroup: SiteGroup;
    }
  | {
      type: 'DELETE_SITE_GROUP';
      grappeId: string;
      siteGroupId: string;
    }
  | {
      type: 'MOVE_SITES';
      grappeId: string;
      fromGroupId: string;
      toGroupId: string;
      siteIds: string[];
    }
  | {
      type: 'UPDATE_SUPPLIER';
      supplier: Supplier;
    }
  | { type: 'CLEAR_CHANGES' };
