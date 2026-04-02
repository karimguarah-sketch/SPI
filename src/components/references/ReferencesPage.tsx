import React, { useMemo, useState, useCallback, useRef } from 'react';
import { useStore, getEnrichedReferences, getFilteredReferences, EnrichedReference } from '../../store';
import { Badge } from '../ui/Badge';
import { BulkChangeSupplierModal } from './BulkChangeSupplierModal';
import { BulkChangeCircuitModal } from './BulkChangeCircuitModal';
import { BulkChangeSitesModal } from './BulkChangeSitesModal';
import { Circuit, SiteConfigType } from '../../types';

const ROW_HEIGHT = 44;
const OVERSCAN = 10;

// Circuit icons
function CircuitIcon({ circuit }: { circuit: string }) {
  if (circuit === 'direct') {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Direct (magasins)">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Stock (entrepôts)">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function ReferenceRow({
  item,
  isSelected,
  onToggle,
  style,
}: {
  item: EnrichedReference;
  isSelected: boolean;
  onToggle: (id: string) => void;
  style: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`flex items-center border-b border-gray-100 text-sm hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50' : ''
      }`}
    >
      <div className="w-12 px-3 flex items-center justify-center shrink-0">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(item.reference.id)}
          className="rounded border-gray-400"
        />
      </div>
      <div className="w-24 px-2 text-gray-500 truncate shrink-0">{item.reference.id}</div>
      <div className="flex-1 px-2 text-gray-900 truncate min-w-0">{item.reference.label}</div>
      <div className="w-48 px-2 truncate shrink-0">
        <span className="text-gray-700">{item.supplier.name}</span>
      </div>
      <div className="w-24 px-2 shrink-0">
        <Badge variant={item.supplier.siteConfigType === 'national' ? 'blue' : 'purple'}>
          {item.supplier.siteConfigType === 'national' ? '🌐 National' : '📍 Groupes'}
        </Badge>
      </div>
      <div className="w-20 px-2 shrink-0">
        <Badge variant={item.purchaseCondition.circuit === 'direct' ? 'success' : 'warning'}>
          <CircuitIcon circuit={item.purchaseCondition.circuit} />
          {item.purchaseCondition.circuit === 'direct' ? 'Direct' : 'Stock'}
        </Badge>
      </div>
      <div className="w-16 px-2 text-right text-gray-500 shrink-0">{item.siteCount}</div>
    </div>
  );
}

const MemoizedRow = React.memo(ReferenceRow);

export function ReferencesPage() {
  const { state, dispatch } = useStore();
  const { selectedReferenceIds, filters } = state.ui;

  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [circuitModalOpen, setCircuitModalOpen] = useState(false);
  const [sitesModalOpen, setSitesModalOpen] = useState(false);

  const enrichedRefs = useMemo(() => getEnrichedReferences(state), [state.data]);
  const filteredRefs = useMemo(
    () => getFilteredReferences(enrichedRefs, filters),
    [enrichedRefs, filters]
  );

  // Virtualization
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(
    (containerRef.current?.clientHeight || 600) / ROW_HEIGHT
  );
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    filteredRefs.length,
    Math.floor(scrollTop / ROW_HEIGHT) + visibleCount + OVERSCAN
  );

  const totalHeight = filteredRefs.length * ROW_HEIGHT;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const handleToggle = useCallback(
    (id: string) => {
      if (selectedReferenceIds.has(id)) {
        dispatch({ type: 'DESELECT_REFERENCES', ids: [id] });
      } else {
        dispatch({ type: 'SELECT_REFERENCES', ids: [id] });
      }
    },
    [selectedReferenceIds, dispatch]
  );

  const handleSelectAll = useCallback(() => {
    const allIds = filteredRefs.map(r => r.reference.id);
    const allSelected = allIds.every(id => selectedReferenceIds.has(id));
    if (allSelected) {
      dispatch({ type: 'DESELECT_ALL' });
    } else {
      dispatch({ type: 'SELECT_ALL_FILTERED', ids: allIds });
    }
  }, [filteredRefs, selectedReferenceIds, dispatch]);

  const selectedCount = selectedReferenceIds.size;
  const allFilteredSelected =
    filteredRefs.length > 0 && filteredRefs.every(r => selectedReferenceIds.has(r.reference.id));

  // Check if selected refs can have sites changed
  const canChangeSites = useMemo(() => {
    if (selectedCount === 0) return false;
    const selectedRefs = Array.from(selectedReferenceIds)
      .map(id => state.data.references[id])
      .filter(Boolean);
    // All must belong to same supplier with group_of_sites
    const pcs = selectedRefs.map(r => state.data.purchaseConditions[r.purchaseConditionId]);
    const supplierIds = new Set(pcs.map(pc => pc?.supplierId));
    if (supplierIds.size !== 1) return false;
    const supplier = state.data.suppliers[Array.from(supplierIds)[0]!];
    return supplier?.siteConfigType === 'group_of_sites';
  }, [selectedReferenceIds, state.data]);

  const suppliersList = useMemo(
    () => Object.values(state.data.suppliers).sort((a, b) => a.name.localeCompare(b.name)),
    [state.data.suppliers]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Références</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filteredRefs.length.toLocaleString()} références
              {selectedCount > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  · {selectedCount} sélectionnée{selectedCount > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>

          {/* Bulk actions */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSupplierModalOpen(true)}
                className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Changer fournisseur
              </button>
              <button
                onClick={() => setCircuitModalOpen(true)}
                className="px-3 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Changer circuit
              </button>
              {canChangeSites && (
                <button
                  onClick={() => setSitesModalOpen(true)}
                  className="px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Changer sites
                </button>
              )}
              <button
                onClick={() => dispatch({ type: 'DESELECT_ALL' })}
                className="px-3 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                Désélectionner
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher (ID, libellé, EAN, fournisseur)..."
              value={filters.search}
              onChange={(e) => dispatch({ type: 'SET_FILTERS', filters: { search: e.target.value } })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.supplierId || ''}
            onChange={(e) =>
              dispatch({ type: 'SET_FILTERS', filters: { supplierId: e.target.value || null } })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les fournisseurs</option>
            {suppliersList.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={filters.circuit || ''}
            onChange={(e) =>
              dispatch({
                type: 'SET_FILTERS',
                filters: { circuit: (e.target.value as Circuit) || null },
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous circuits</option>
            <option value="direct">Direct</option>
            <option value="stock">Stock</option>
          </select>

          <select
            value={filters.siteConfigType || ''}
            onChange={(e) =>
              dispatch({
                type: 'SET_FILTERS',
                filters: { siteConfigType: (e.target.value as SiteConfigType) || null },
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes zones</option>
            <option value="national">National</option>
            <option value="group_of_sites">Group of sites</option>
          </select>
        </div>
      </div>

      {/* Table header */}
      <div className="flex items-center bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
        <div className="w-12 px-3 flex items-center justify-center">
          <input
            type="checkbox"
            checked={allFilteredSelected && filteredRefs.length > 0}
            onChange={handleSelectAll}
            className="rounded border-gray-400"
          />
        </div>
        <div className="w-24 px-2 py-3">ID</div>
        <div className="flex-1 px-2 py-3">Libellé</div>
        <div className="w-48 px-2 py-3">Fournisseur</div>
        <div className="w-24 px-2 py-3">Zone</div>
        <div className="w-20 px-2 py-3">Circuit</div>
        <div className="w-16 px-2 py-3 text-right">Sites</div>
      </div>

      {/* Virtualized rows */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {filteredRefs.slice(startIndex, endIndex).map((item, i) => (
            <MemoizedRow
              key={item.reference.id}
              item={item}
              isSelected={selectedReferenceIds.has(item.reference.id)}
              onToggle={handleToggle}
              style={{
                position: 'absolute',
                top: (startIndex + i) * ROW_HEIGHT,
                left: 0,
                right: 0,
                height: ROW_HEIGHT,
              }}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <BulkChangeSupplierModal
        isOpen={supplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        selectedReferenceIds={Array.from(selectedReferenceIds)}
      />
      <BulkChangeCircuitModal
        isOpen={circuitModalOpen}
        onClose={() => setCircuitModalOpen(false)}
        selectedReferenceIds={Array.from(selectedReferenceIds)}
      />
      <BulkChangeSitesModal
        isOpen={sitesModalOpen}
        onClose={() => setSitesModalOpen(false)}
        selectedReferenceIds={Array.from(selectedReferenceIds)}
      />
    </div>
  );
}
