import { Reference, PurchaseCondition, Circuit, Incoterm } from '../types';
import { suppliers, allGrappes } from './suppliers';
import { frenchStoreIds, warehouseIds, spanishStoreIds } from './sites';

const incoterms: Incoterm[] = ['EXW', 'FCA', 'DAP', 'DDP'];

function generateEAN(index: number): string {
  const base = (3000000000000 + index).toString();
  return base.slice(0, 13);
}

function generateSupplierRef(supplierPrefix: string, index: number): string {
  return `${supplierPrefix}-${String(index).padStart(5, '0')}`;
}

// Product categories for realistic labels
const categories = [
  'Robinet mitigeur', 'Douche thermostatique', 'Colonne de douche', 'Barre de douche',
  'Pomme de douche', 'Flexible de douche', 'Mitigeur lavabo', 'Mitigeur évier',
  'Mitigeur bain-douche', 'Robinet mural', 'Douchette', 'Inverseur',
  'Cartouche thermostatique', 'Aérateur', 'Raccord', 'Bonde',
  'Siphon', 'Plaque de commande', 'Bâti-support', 'Réservoir WC',
  'Cuvette WC', 'Abattant WC', 'Lavabo', 'Vasque',
  'Plan vasque', 'Meuble sous-vasque', 'Colonne lavabo', 'Receveur de douche',
  'Paroi de douche', 'Porte de douche', 'Baignoire', 'Tablier de baignoire',
];

const materials = ['Chrome', 'Inox', 'Blanc', 'Noir mat', 'Laiton', 'Nickel brossé'];
const sizes = ['Ø15', 'Ø20', 'Ø25', 'Ø32', 'Ø40', '60cm', '80cm', '90cm', '120cm', '140cm', '160cm'];

function generateLabel(index: number): string {
  const cat = categories[index % categories.length];
  const mat = materials[index % materials.length];
  const size = sizes[index % sizes.length];
  return `${cat} ${mat} ${size}`;
}

export const references: Reference[] = [];
export const purchaseConditions: PurchaseCondition[] = [];

let refIndex = 0;
let pcIndex = 0;

// ===== Grohe España: 100 refs, group_of_sites, direct =====
// Grappe 1 (3 groups): 77 refs
const groheGrappe1 = allGrappes.find(g => g.id === 'grappe-grohe-1')!;
const grohePC1: PurchaseCondition = {
  id: `pc-${++pcIndex}`,
  supplierId: 'supplier-grohe',
  circuit: 'direct',
  incoterm: 'DAP',
  grappeId: 'grappe-grohe-1',
  siteGroupId: null,
  siteIds: [...spanishStoreIds],
  referenceIds: [],
};
for (let i = 0; i < 77; i++) {
  const ref: Reference = {
    id: `ref-${++refIndex}`,
    ean: generateEAN(refIndex),
    label: `Grohe ${generateLabel(refIndex)}`,
    supplierRef: generateSupplierRef('GRH', refIndex),
    purchaseConditionId: grohePC1.id,
  };
  references.push(ref);
  grohePC1.referenceIds.push(ref.id);
}
purchaseConditions.push(grohePC1);

// Grappe 2 (2 groups): 18 refs
const grohePC2: PurchaseCondition = {
  id: `pc-${++pcIndex}`,
  supplierId: 'supplier-grohe',
  circuit: 'direct',
  incoterm: 'DAP',
  grappeId: 'grappe-grohe-2',
  siteGroupId: null,
  siteIds: [...spanishStoreIds],
  referenceIds: [],
};
for (let i = 0; i < 18; i++) {
  const ref: Reference = {
    id: `ref-${++refIndex}`,
    ean: generateEAN(refIndex),
    label: `Grohe ${generateLabel(refIndex)}`,
    supplierRef: generateSupplierRef('GRH', refIndex),
    purchaseConditionId: grohePC2.id,
  };
  references.push(ref);
  grohePC2.referenceIds.push(ref.id);
}
purchaseConditions.push(grohePC2);

// Grappe 3 (1 group, all 15 sites): 5 refs
const grohePC3: PurchaseCondition = {
  id: `pc-${++pcIndex}`,
  supplierId: 'supplier-grohe',
  circuit: 'direct',
  incoterm: 'DAP',
  grappeId: 'grappe-grohe-3',
  siteGroupId: null,
  siteIds: [...spanishStoreIds],
  referenceIds: [],
};
for (let i = 0; i < 5; i++) {
  const ref: Reference = {
    id: `ref-${++refIndex}`,
    ean: generateEAN(refIndex),
    label: `Grohe ${generateLabel(refIndex)}`,
    supplierRef: generateSupplierRef('GRH', refIndex),
    purchaseConditionId: grohePC3.id,
  };
  references.push(ref);
  grohePC3.referenceIds.push(ref.id);
}
purchaseConditions.push(grohePC3);

// ===== Generate refs for other suppliers to reach 8000 =====
interface SupplierConfig {
  supplierId: string;
  prefix: string;
  labelPrefix: string;
  circuit: Circuit;
  incoterm: Incoterm;
  grappeId: string | null;
  siteIds: string[];
  count: number;
}

const otherConfigs: SupplierConfig[] = [
  // Roca: national, direct - 1500 refs
  { supplierId: 'supplier-roca', prefix: 'ROC', labelPrefix: 'Roca', circuit: 'direct', incoterm: 'FCA', grappeId: null, siteIds: [...frenchStoreIds], count: 1500 },
  // Roca: national, stock - 500 refs
  { supplierId: 'supplier-roca', prefix: 'ROC', labelPrefix: 'Roca', circuit: 'stock', incoterm: 'FCA', grappeId: null, siteIds: [...warehouseIds], count: 500 },
  // Hansgrohe: group_of_sites, direct - 1200 refs
  { supplierId: 'supplier-hansgrohe', prefix: 'HAN', labelPrefix: 'Hansgrohe', circuit: 'direct', incoterm: 'DAP', grappeId: 'grappe-hans-1', siteIds: [...frenchStoreIds], count: 1200 },
  // Ideal Standard: national, stock - 1000 refs
  { supplierId: 'supplier-ideal', prefix: 'IDS', labelPrefix: 'Ideal Standard', circuit: 'stock', incoterm: 'EXW', grappeId: null, siteIds: [...warehouseIds], count: 1000 },
  // Jacob Delafon: group_of_sites, direct - 1000 refs
  { supplierId: 'supplier-jd', prefix: 'JDF', labelPrefix: 'Jacob Delafon', circuit: 'direct', incoterm: 'DDP', grappeId: 'grappe-jd-direct', siteIds: [...frenchStoreIds], count: 1000 },
  // Jacob Delafon: group_of_sites, stock - 500 refs
  { supplierId: 'supplier-jd', prefix: 'JDF', labelPrefix: 'Jacob Delafon', circuit: 'stock', incoterm: 'DDP', grappeId: 'grappe-jd-stock', siteIds: [...warehouseIds], count: 500 },
  // Duravit: national, direct - 800 refs
  { supplierId: 'supplier-duravit', prefix: 'DUR', labelPrefix: 'Duravit', circuit: 'direct', incoterm: 'FCA', grappeId: null, siteIds: [...frenchStoreIds], count: 800 },
  // Villeroy & Boch: national, stock - 600 refs
  { supplierId: 'supplier-villeroy', prefix: 'VIL', labelPrefix: 'Villeroy & Boch', circuit: 'stock', incoterm: 'EXW', grappeId: null, siteIds: [...warehouseIds], count: 600 },
  // Geberit: group_of_sites, stock - 800 refs
  { supplierId: 'supplier-geberit', prefix: 'GEB', labelPrefix: 'Geberit', circuit: 'stock', incoterm: 'DAP', grappeId: 'grappe-geb-1', siteIds: [...warehouseIds], count: 800 },
];

for (const config of otherConfigs) {
  const pc: PurchaseCondition = {
    id: `pc-${++pcIndex}`,
    supplierId: config.supplierId,
    circuit: config.circuit,
    incoterm: config.incoterm,
    grappeId: config.grappeId,
    siteGroupId: null,
    siteIds: config.siteIds,
    referenceIds: [],
  };

  for (let i = 0; i < config.count; i++) {
    const ref: Reference = {
      id: `ref-${++refIndex}`,
      ean: generateEAN(refIndex),
      label: `${config.labelPrefix} ${generateLabel(refIndex)}`,
      supplierRef: generateSupplierRef(config.prefix, refIndex),
      purchaseConditionId: pc.id,
    };
    references.push(ref);
    pc.referenceIds.push(ref.id);
  }

  purchaseConditions.push(pc);
}
