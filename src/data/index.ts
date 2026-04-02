import { Site, Supplier, Reference, PurchaseCondition, Grappe } from '../types';
import { allSites } from './sites';
import { suppliers, allGrappes } from './suppliers';
import { references, purchaseConditions } from './references';

export interface AppData {
  sites: Record<string, Site>;
  suppliers: Record<string, Supplier>;
  references: Record<string, Reference>;
  purchaseConditions: Record<string, PurchaseCondition>;
  grappes: Record<string, Grappe>;
}

function toRecord<T extends { id: string }>(items: T[]): Record<string, T> {
  const record: Record<string, T> = {};
  for (const item of items) {
    record[item.id] = item;
  }
  return record;
}

export const initialData: AppData = {
  sites: toRecord(allSites),
  suppliers: toRecord(suppliers),
  references: toRecord(references),
  purchaseConditions: toRecord(purchaseConditions),
  grappes: toRecord(allGrappes),
};

// Quick access arrays
export { allSites, suppliers, allGrappes, references, purchaseConditions };
