import { PendingChange, PurchaseCondition, Reference, Supplier, Grappe, PageId, ReferenceFilters } from '../types';
import { AppData } from '../data';
import { Action } from './actions';

export interface AppState {
  data: AppData;
  pendingChanges: PendingChange[];
  ui: {
    currentPage: PageId;
    selectedReferenceIds: Set<string>;
    filters: ReferenceFilters;
  };
}

export function createInitialState(data: AppData): AppState {
  return {
    data,
    pendingChanges: [],
    ui: {
      currentPage: 'references',
      selectedReferenceIds: new Set(),
      filters: {
        search: '',
        supplierId: null,
        circuit: null,
        siteConfigType: null,
      },
    },
  };
}

let changeIdCounter = 0;
function nextChangeId(): string {
  return `change-${++changeIdCounter}`;
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PAGE':
      return {
        ...state,
        ui: { ...state.ui, currentPage: action.page },
      };

    case 'SET_FILTERS':
      return {
        ...state,
        ui: {
          ...state.ui,
          filters: { ...state.ui.filters, ...action.filters },
        },
      };

    case 'SELECT_REFERENCES': {
      const newSet = new Set(state.ui.selectedReferenceIds);
      action.ids.forEach(id => newSet.add(id));
      return { ...state, ui: { ...state.ui, selectedReferenceIds: newSet } };
    }

    case 'DESELECT_REFERENCES': {
      const newSet = new Set(state.ui.selectedReferenceIds);
      action.ids.forEach(id => newSet.delete(id));
      return { ...state, ui: { ...state.ui, selectedReferenceIds: newSet } };
    }

    case 'SELECT_ALL_FILTERED': {
      return { ...state, ui: { ...state.ui, selectedReferenceIds: new Set(action.ids) } };
    }

    case 'DESELECT_ALL':
      return { ...state, ui: { ...state.ui, selectedReferenceIds: new Set() } };

    case 'CHANGE_SUPPLIER': {
      const { referenceIds, newSupplierId, newCircuit, newGrappeId, barcodeUpdates } = action;
      const newData = { ...state.data };
      const newRefs = { ...newData.references };
      const newPCs = { ...newData.purchaseConditions };
      const newSupplier = newData.suppliers[newSupplierId];

      // Group refs by current PC
      const refsByPC = new Map<string, string[]>();
      for (const refId of referenceIds) {
        const ref = newRefs[refId];
        if (!refsByPC.has(ref.purchaseConditionId)) {
          refsByPC.set(ref.purchaseConditionId, []);
        }
        refsByPC.get(ref.purchaseConditionId)!.push(refId);
      }

      // Determine new site IDs
      let newSiteIds: string[] = [];
      if (newSupplier.siteConfigType === 'national') {
        newSiteIds = [...newSupplier.siteIds];
      } else if (newGrappeId) {
        const grappe = newData.grappes[newGrappeId];
        if (grappe) {
          newSiteIds = grappe.siteGroups.flatMap(sg => sg.siteIds);
        }
      }

      // Create new PC for the moved refs
      const newPCId = `pc-new-${Date.now()}`;
      const newPC: PurchaseCondition = {
        id: newPCId,
        supplierId: newSupplierId,
        circuit: newCircuit,
        incoterm: 'DAP',
        grappeId: newGrappeId,
        siteGroupId: null,
        siteIds: newSiteIds,
        referenceIds: [...referenceIds],
      };
      newPCs[newPCId] = newPC;

      // Remove refs from old PCs and update refs
      for (const [oldPCId, refIds] of refsByPC) {
        const oldPC = { ...newPCs[oldPCId] };
        oldPC.referenceIds = oldPC.referenceIds.filter(id => !refIds.includes(id));
        newPCs[oldPCId] = oldPC;
      }

      // Update barcode and supplier ref for each reference
      for (const refId of referenceIds) {
        const ref = { ...newRefs[refId] };
        ref.purchaseConditionId = newPCId;
        if (barcodeUpdates[refId]) {
          ref.ean = barcodeUpdates[refId].ean;
          ref.supplierRef = barcodeUpdates[refId].supplierRef;
        }
        newRefs[refId] = ref;
      }

      newData.references = newRefs;
      newData.purchaseConditions = newPCs;

      // Track old values for first ref's PC
      const firstRefOldPCId = state.data.references[referenceIds[0]].purchaseConditionId;
      const oldPC = state.data.purchaseConditions[firstRefOldPCId];
      const oldSupplier = state.data.suppliers[oldPC.supplierId];

      const change: PendingChange = {
        id: nextChangeId(),
        type: 'supplier_change',
        referenceIds: [...referenceIds],
        description: `Changement fournisseur : ${oldSupplier.name} → ${newSupplier.name}`,
        before: {
          supplierId: oldPC.supplierId,
          supplierName: oldSupplier.name,
          circuit: oldPC.circuit,
          siteConfigType: oldSupplier.siteConfigType,
          siteIds: oldPC.siteIds,
          grappeId: oldPC.grappeId,
        },
        after: {
          supplierId: newSupplierId,
          supplierName: newSupplier.name,
          circuit: newCircuit,
          siteConfigType: newSupplier.siteConfigType,
          siteIds: newSiteIds,
          grappeId: newGrappeId,
        },
        timestamp: Date.now(),
      };

      return {
        ...state,
        data: newData,
        pendingChanges: [...state.pendingChanges, change],
        ui: { ...state.ui, selectedReferenceIds: new Set() },
      };
    }

    case 'CHANGE_CIRCUIT': {
      const { referenceIds, newCircuit, newSiteIds, newGrappeId } = action;
      const newData = { ...state.data };
      const newRefs = { ...newData.references };
      const newPCs = { ...newData.purchaseConditions };

      const firstRef = state.data.references[referenceIds[0]];
      const oldPC = state.data.purchaseConditions[firstRef.purchaseConditionId];

      // Create new PC
      const newPCId = `pc-circ-${Date.now()}`;
      const newPC: PurchaseCondition = {
        id: newPCId,
        supplierId: oldPC.supplierId,
        circuit: newCircuit,
        incoterm: oldPC.incoterm,
        grappeId: newGrappeId,
        siteGroupId: null,
        siteIds: newSiteIds,
        referenceIds: [...referenceIds],
      };
      newPCs[newPCId] = newPC;

      // Remove from old PCs
      const refsByPC = new Map<string, string[]>();
      for (const refId of referenceIds) {
        const ref = newRefs[refId];
        if (!refsByPC.has(ref.purchaseConditionId)) {
          refsByPC.set(ref.purchaseConditionId, []);
        }
        refsByPC.get(ref.purchaseConditionId)!.push(refId);
      }
      for (const [pcId, refIds] of refsByPC) {
        const pc = { ...newPCs[pcId] };
        pc.referenceIds = pc.referenceIds.filter(id => !refIds.includes(id));
        newPCs[pcId] = pc;
      }

      for (const refId of referenceIds) {
        newRefs[refId] = { ...newRefs[refId], purchaseConditionId: newPCId };
      }

      newData.references = newRefs;
      newData.purchaseConditions = newPCs;

      const change: PendingChange = {
        id: nextChangeId(),
        type: 'circuit_change',
        referenceIds: [...referenceIds],
        description: `Changement circuit : ${oldPC.circuit} → ${newCircuit}`,
        before: {
          circuit: oldPC.circuit,
          siteIds: oldPC.siteIds,
          grappeId: oldPC.grappeId,
        },
        after: {
          circuit: newCircuit,
          siteIds: newSiteIds,
          grappeId: newGrappeId,
        },
        timestamp: Date.now(),
      };

      return {
        ...state,
        data: newData,
        pendingChanges: [...state.pendingChanges, change],
        ui: { ...state.ui, selectedReferenceIds: new Set() },
      };
    }

    case 'CHANGE_SITES': {
      const { referenceIds, newSiteIds, newGrappeId } = action;
      const newData = { ...state.data };
      const newRefs = { ...newData.references };
      const newPCs = { ...newData.purchaseConditions };

      const firstRef = state.data.references[referenceIds[0]];
      const oldPC = state.data.purchaseConditions[firstRef.purchaseConditionId];

      const newPCId = `pc-sites-${Date.now()}`;
      const newPC: PurchaseCondition = {
        ...oldPC,
        id: newPCId,
        siteIds: newSiteIds,
        grappeId: newGrappeId,
        referenceIds: [...referenceIds],
      };
      newPCs[newPCId] = newPC;

      const refsByPC = new Map<string, string[]>();
      for (const refId of referenceIds) {
        const ref = newRefs[refId];
        if (!refsByPC.has(ref.purchaseConditionId)) {
          refsByPC.set(ref.purchaseConditionId, []);
        }
        refsByPC.get(ref.purchaseConditionId)!.push(refId);
      }
      for (const [pcId, refIds] of refsByPC) {
        const pc = { ...newPCs[pcId] };
        pc.referenceIds = pc.referenceIds.filter(id => !refIds.includes(id));
        newPCs[pcId] = pc;
      }

      for (const refId of referenceIds) {
        newRefs[refId] = { ...newRefs[refId], purchaseConditionId: newPCId };
      }

      newData.references = newRefs;
      newData.purchaseConditions = newPCs;

      const change: PendingChange = {
        id: nextChangeId(),
        type: 'site_assignment',
        referenceIds: [...referenceIds],
        description: `Changement sites : ${oldPC.siteIds.length} → ${newSiteIds.length} sites`,
        before: { siteIds: oldPC.siteIds, grappeId: oldPC.grappeId },
        after: { siteIds: newSiteIds, grappeId: newGrappeId },
        timestamp: Date.now(),
      };

      return {
        ...state,
        data: newData,
        pendingChanges: [...state.pendingChanges, change],
        ui: { ...state.ui, selectedReferenceIds: new Set() },
      };
    }

    case 'CHANGE_SUPPLIER_CONFIG': {
      const { supplierId, newConfigType, newGrappes } = action;
      const newData = { ...state.data };
      const newSuppliers = { ...newData.suppliers };
      const oldSupplier = newSuppliers[supplierId];
      const newGrappesMap = { ...newData.grappes };

      const updatedSupplier: Supplier = {
        ...oldSupplier,
        siteConfigType: newConfigType,
        defaultGrappeIds: newGrappes ? newGrappes.map(g => g.id) : [],
      };
      newSuppliers[supplierId] = updatedSupplier;

      if (newGrappes) {
        for (const g of newGrappes) {
          newGrappesMap[g.id] = g;
        }
      }

      newData.suppliers = newSuppliers;
      newData.grappes = newGrappesMap;

      const change: PendingChange = {
        id: nextChangeId(),
        type: 'config_change',
        referenceIds: [],
        description: `Configuration fournisseur ${oldSupplier.name} : ${oldSupplier.siteConfigType} → ${newConfigType}`,
        before: { siteConfigType: oldSupplier.siteConfigType },
        after: { siteConfigType: newConfigType },
        timestamp: Date.now(),
      };

      return {
        ...state,
        data: newData,
        pendingChanges: [...state.pendingChanges, change],
      };
    }

    case 'ADD_GRAPPE': {
      const newData = { ...state.data };
      const newGrappes = { ...newData.grappes };
      newGrappes[action.grappe.id] = action.grappe;
      newData.grappes = newGrappes;

      // Also add to supplier's defaultGrappeIds
      const supplier = { ...newData.suppliers[action.grappe.supplierId] };
      supplier.defaultGrappeIds = [...supplier.defaultGrappeIds, action.grappe.id];
      newData.suppliers = { ...newData.suppliers, [supplier.id]: supplier };

      return { ...state, data: newData };
    }

    case 'UPDATE_GRAPPE': {
      const newData = { ...state.data };
      newData.grappes = { ...newData.grappes, [action.grappe.id]: action.grappe };
      return { ...state, data: newData };
    }

    case 'DELETE_GRAPPE': {
      const newData = { ...state.data };
      const newGrappes = { ...newData.grappes };
      const grappe = newGrappes[action.grappeId];
      delete newGrappes[action.grappeId];
      newData.grappes = newGrappes;

      if (grappe) {
        const supplier = { ...newData.suppliers[grappe.supplierId] };
        supplier.defaultGrappeIds = supplier.defaultGrappeIds.filter(id => id !== action.grappeId);
        newData.suppliers = { ...newData.suppliers, [supplier.id]: supplier };
      }

      return { ...state, data: newData };
    }

    case 'ADD_SITE_GROUP': {
      const newData = { ...state.data };
      const grappe = { ...newData.grappes[action.grappeId] };
      grappe.siteGroups = [...grappe.siteGroups, action.siteGroup];
      newData.grappes = { ...newData.grappes, [grappe.id]: grappe };
      return { ...state, data: newData };
    }

    case 'UPDATE_SITE_GROUP': {
      const newData = { ...state.data };
      const grappe = { ...newData.grappes[action.grappeId] };
      grappe.siteGroups = grappe.siteGroups.map(sg =>
        sg.id === action.siteGroup.id ? action.siteGroup : sg
      );
      newData.grappes = { ...newData.grappes, [grappe.id]: grappe };
      return { ...state, data: newData };
    }

    case 'DELETE_SITE_GROUP': {
      const newData = { ...state.data };
      const grappe = { ...newData.grappes[action.grappeId] };
      grappe.siteGroups = grappe.siteGroups.filter(sg => sg.id !== action.siteGroupId);
      newData.grappes = { ...newData.grappes, [grappe.id]: grappe };
      return { ...state, data: newData };
    }

    case 'MOVE_SITES': {
      const newData = { ...state.data };
      const grappe = { ...newData.grappes[action.grappeId] };
      grappe.siteGroups = grappe.siteGroups.map(sg => {
        if (sg.id === action.fromGroupId) {
          return { ...sg, siteIds: sg.siteIds.filter(id => !action.siteIds.includes(id)) };
        }
        if (sg.id === action.toGroupId) {
          return { ...sg, siteIds: [...sg.siteIds, ...action.siteIds.filter(id => !sg.siteIds.includes(id))] };
        }
        return sg;
      });
      newData.grappes = { ...newData.grappes, [grappe.id]: grappe };
      return { ...state, data: newData };
    }

    case 'UPDATE_SUPPLIER': {
      const newData = { ...state.data };
      newData.suppliers = { ...newData.suppliers, [action.supplier.id]: action.supplier };
      return { ...state, data: newData };
    }

    case 'CLEAR_CHANGES':
      return { ...state, pendingChanges: [] };

    default:
      return state;
  }
}
