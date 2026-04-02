import { Supplier, Grappe, SiteGroup } from '../types';
import { spanishStoreIds, frenchStoreIds, warehouseIds } from './sites';

// ===== Grohe España S.A. - group_of_sites, direct =====
// 3 site groups for grappe 1 (77 refs): 8+4+3 = 15 sites
const groheGroup1A: SiteGroup = {
  id: 'sg-grohe-1a',
  name: 'Zona Norte',
  siteType: 'magasin',
  siteIds: spanishStoreIds.slice(0, 8), // Madrid, Barcelona, Valencia, Sevilla, Zaragoza, Málaga, Bilbao, Murcia
};
const groheGroup1B: SiteGroup = {
  id: 'sg-grohe-1b',
  name: 'Zona Centro',
  siteType: 'magasin',
  siteIds: spanishStoreIds.slice(8, 12), // Palma, Las Palmas, Alicante, Córdoba
};
const groheGroup1C: SiteGroup = {
  id: 'sg-grohe-1c',
  name: 'Zona Sur',
  siteType: 'magasin',
  siteIds: spanishStoreIds.slice(12, 15), // Valladolid, Vigo, Gijón
};

// 2 site groups for grappe 2 (18 refs): 9+6 = 15 sites
const groheGroup2A: SiteGroup = {
  id: 'sg-grohe-2a',
  name: 'Zona Metropolitana',
  siteType: 'magasin',
  siteIds: spanishStoreIds.slice(0, 9),
};
const groheGroup2B: SiteGroup = {
  id: 'sg-grohe-2b',
  name: 'Zona Periférica',
  siteType: 'magasin',
  siteIds: spanishStoreIds.slice(9, 15),
};

// 1 site group for grappe 3 (5 refs): all 15 sites
const groheGroup3A: SiteGroup = {
  id: 'sg-grohe-3a',
  name: 'Tous les sites',
  siteType: 'magasin',
  siteIds: [...spanishStoreIds],
};

export const groheGrappes: Grappe[] = [
  {
    id: 'grappe-grohe-1',
    name: 'Grappe Régionale (3 zones)',
    supplierId: 'supplier-grohe',
    siteGroups: [groheGroup1A, groheGroup1B, groheGroup1C],
  },
  {
    id: 'grappe-grohe-2',
    name: 'Grappe Métro/Périphérie',
    supplierId: 'supplier-grohe',
    siteGroups: [groheGroup2A, groheGroup2B],
  },
  {
    id: 'grappe-grohe-3',
    name: 'Grappe Nationale',
    supplierId: 'supplier-grohe',
    siteGroups: [groheGroup3A],
  },
];

// ===== Other suppliers =====
const otherSiteGroups: SiteGroup[] = [];
const otherGrappes: Grappe[] = [];

// Supplier 2: Roca France - national, direct+stock
// Supplier 3: Hansgrohe - group_of_sites, direct
const hansgroheGroupA: SiteGroup = {
  id: 'sg-hans-a',
  name: 'Nord',
  siteType: 'magasin',
  siteIds: frenchStoreIds.slice(0, 50),
};
const hansgroheGroupB: SiteGroup = {
  id: 'sg-hans-b',
  name: 'Sud',
  siteType: 'magasin',
  siteIds: frenchStoreIds.slice(50, 100),
};
const hansgroheGroupC: SiteGroup = {
  id: 'sg-hans-c',
  name: 'Reste',
  siteType: 'magasin',
  siteIds: frenchStoreIds.slice(100),
};

const hansgroheGrappe: Grappe = {
  id: 'grappe-hans-1',
  name: 'Grappe France Nord/Sud',
  supplierId: 'supplier-hansgrohe',
  siteGroups: [hansgroheGroupA, hansgroheGroupB, hansgroheGroupC],
};
otherGrappes.push(hansgroheGrappe);

// Supplier 4: Ideal Standard - national, stock
// Supplier 5: Jacob Delafon - group_of_sites, direct+stock
const jdGroupA: SiteGroup = {
  id: 'sg-jd-a',
  name: 'Zone A',
  siteType: 'magasin',
  siteIds: frenchStoreIds.slice(0, 75),
};
const jdGroupB: SiteGroup = {
  id: 'sg-jd-b',
  name: 'Zone B',
  siteType: 'magasin',
  siteIds: frenchStoreIds.slice(75),
};
const jdStockGroupA: SiteGroup = {
  id: 'sg-jd-stock-a',
  name: 'Entrepôts Principaux',
  siteType: 'entrepot',
  siteIds: warehouseIds.slice(0, 8),
};
const jdStockGroupB: SiteGroup = {
  id: 'sg-jd-stock-b',
  name: 'Entrepôts Secondaires',
  siteType: 'entrepot',
  siteIds: warehouseIds.slice(8),
};

const jdGrappeDirect: Grappe = {
  id: 'grappe-jd-direct',
  name: 'Grappe Magasins',
  supplierId: 'supplier-jd',
  siteGroups: [jdGroupA, jdGroupB],
};
const jdGrappeStock: Grappe = {
  id: 'grappe-jd-stock',
  name: 'Grappe Entrepôts',
  supplierId: 'supplier-jd',
  siteGroups: [jdStockGroupA, jdStockGroupB],
};
otherGrappes.push(jdGrappeDirect, jdGrappeStock);

// Supplier 6: Duravit - national, direct
// Supplier 7: Villeroy & Boch - national, stock
// Supplier 8: Geberit - group_of_sites, stock
const geberitGroupA: SiteGroup = {
  id: 'sg-geb-a',
  name: 'Entrepôts Nord',
  siteType: 'entrepot',
  siteIds: warehouseIds.slice(0, 7),
};
const geberitGroupB: SiteGroup = {
  id: 'sg-geb-b',
  name: 'Entrepôts Sud',
  siteType: 'entrepot',
  siteIds: warehouseIds.slice(7),
};

const geberitGrappe: Grappe = {
  id: 'grappe-geb-1',
  name: 'Grappe Entrepôts',
  supplierId: 'supplier-geberit',
  siteGroups: [geberitGroupA, geberitGroupB],
};
otherGrappes.push(geberitGrappe);

export const allGrappes: Grappe[] = [...groheGrappes, ...otherGrappes];

export const suppliers: Supplier[] = [
  {
    id: 'supplier-grohe',
    name: 'Grohe España S.A.',
    siteConfigType: 'group_of_sites',
    supportedCircuits: ['direct'],
    siteIds: [...spanishStoreIds],
    defaultGrappeIds: ['grappe-grohe-1', 'grappe-grohe-2', 'grappe-grohe-3'],
  },
  {
    id: 'supplier-roca',
    name: 'Roca France S.A.S.',
    siteConfigType: 'national',
    supportedCircuits: ['direct', 'stock'],
    siteIds: [...frenchStoreIds, ...warehouseIds],
    defaultGrappeIds: [],
  },
  {
    id: 'supplier-hansgrohe',
    name: 'Hansgrohe France',
    siteConfigType: 'group_of_sites',
    supportedCircuits: ['direct'],
    siteIds: [...frenchStoreIds],
    defaultGrappeIds: ['grappe-hans-1'],
  },
  {
    id: 'supplier-ideal',
    name: 'Ideal Standard France',
    siteConfigType: 'national',
    supportedCircuits: ['stock'],
    siteIds: [...warehouseIds],
    defaultGrappeIds: [],
  },
  {
    id: 'supplier-jd',
    name: 'Jacob Delafon',
    siteConfigType: 'group_of_sites',
    supportedCircuits: ['direct', 'stock'],
    siteIds: [...frenchStoreIds, ...warehouseIds],
    defaultGrappeIds: ['grappe-jd-direct', 'grappe-jd-stock'],
  },
  {
    id: 'supplier-duravit',
    name: 'Duravit France',
    siteConfigType: 'national',
    supportedCircuits: ['direct'],
    siteIds: [...frenchStoreIds],
    defaultGrappeIds: [],
  },
  {
    id: 'supplier-villeroy',
    name: 'Villeroy & Boch France',
    siteConfigType: 'national',
    supportedCircuits: ['stock'],
    siteIds: [...warehouseIds],
    defaultGrappeIds: [],
  },
  {
    id: 'supplier-geberit',
    name: 'Geberit France',
    siteConfigType: 'group_of_sites',
    supportedCircuits: ['stock'],
    siteIds: [...warehouseIds],
    defaultGrappeIds: ['grappe-geb-1'],
  },
];
