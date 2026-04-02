import { AppState } from './reducer';
import { Reference, PurchaseCondition, Supplier, Site, ReferenceFilters } from '../types';

export interface EnrichedReference {
  reference: Reference;
  purchaseCondition: PurchaseCondition;
  supplier: Supplier;
  siteCount: number;
}

export function getEnrichedReferences(state: AppState): EnrichedReference[] {
  const { references, purchaseConditions, suppliers } = state.data;
  const result: EnrichedReference[] = [];

  for (const ref of Object.values(references)) {
    const pc = purchaseConditions[ref.purchaseConditionId];
    if (!pc) continue;
    const supplier = suppliers[pc.supplierId];
    if (!supplier) continue;

    result.push({
      reference: ref,
      purchaseCondition: pc,
      supplier,
      siteCount: pc.siteIds.length,
    });
  }

  return result;
}

export function getFilteredReferences(
  enrichedRefs: EnrichedReference[],
  filters: ReferenceFilters
): EnrichedReference[] {
  let result = enrichedRefs;

  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(
      er =>
        er.reference.id.toLowerCase().includes(search) ||
        er.reference.label.toLowerCase().includes(search) ||
        er.reference.ean.includes(search) ||
        er.supplier.name.toLowerCase().includes(search)
    );
  }

  if (filters.supplierId) {
    result = result.filter(er => er.purchaseCondition.supplierId === filters.supplierId);
  }

  if (filters.circuit) {
    result = result.filter(er => er.purchaseCondition.circuit === filters.circuit);
  }

  if (filters.siteConfigType) {
    result = result.filter(er => er.supplier.siteConfigType === filters.siteConfigType);
  }

  return result;
}

export function getUnassignedReferenceAlerts(state: AppState): { refId: string; refLabel: string; siteName: string }[] {
  // References that lost sites compared to their original state
  const alerts: { refId: string; refLabel: string; siteName: string }[] = [];
  // This would compare with original state - simplified for prototype
  return alerts;
}

export function getUnassignedSiteAlerts(state: AppState): { siteId: string; siteName: string; supplierId: string; supplierName: string }[] {
  const alerts: { siteId: string; siteName: string; supplierId: string; supplierName: string }[] = [];
  // This would check sites that were previously assigned - simplified for prototype
  return alerts;
}

export function getSitesForCircuit(state: AppState, circuit: 'direct' | 'stock'): Site[] {
  const { sites } = state.data;
  return Object.values(sites).filter(s =>
    circuit === 'direct' ? s.type === 'magasin' : s.type === 'entrepot'
  );
}
