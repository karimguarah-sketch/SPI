import React, { useMemo, useState } from 'react';
import { useStore } from '../../store';
import { Badge } from '../ui/Badge';
import { SupplierConfigWizard } from './SupplierConfigWizard';
import { Supplier } from '../../types';

export function SuppliersPage() {
  const { state } = useStore();
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const suppliers = useMemo(
    () => Object.values(state.data.suppliers).sort((a, b) => a.name.localeCompare(b.name)),
    [state.data.suppliers]
  );

  const getRefCount = (supplierId: string) => {
    return Object.values(state.data.purchaseConditions)
      .filter(pc => pc.supplierId === supplierId)
      .reduce((sum, pc) => sum + pc.referenceIds.length, 0);
  };

  const getGrappes = (supplierId: string) => {
    const supplier = state.data.suppliers[supplierId];
    return supplier.defaultGrappeIds
      .map(id => state.data.grappes[id])
      .filter(Boolean);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Fournisseurs</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Configuration par défaut des fournisseurs
        </p>
      </div>

      <div className="p-6 space-y-4">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">{supplier.name}</h2>
                  <Badge variant={supplier.siteConfigType === 'national' ? 'blue' : 'purple'}>
                    {supplier.siteConfigType === 'national' ? '🌐 National' : '📍 Group of sites'}
                  </Badge>
                  {supplier.supportedCircuits.map(c => (
                    <Badge key={c} variant={c === 'direct' ? 'success' : 'warning'}>
                      {c === 'direct' ? '🏪 Direct' : '📦 Stock'}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>{supplier.siteIds.length} sites</span>
                  <span>{getRefCount(supplier.id).toLocaleString()} références</span>
                  {supplier.siteConfigType === 'group_of_sites' && (
                    <span>{supplier.defaultGrappeIds.length} grappe(s)</span>
                  )}
                </div>

                {supplier.siteConfigType === 'group_of_sites' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getGrappes(supplier.id).map(g => (
                      <div key={g.id} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700">{g.name}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {g.siteGroups.map(sg => (
                            <Badge key={sg.id} variant="gray" className="text-[10px]">
                              {sg.name} ({sg.siteIds.length})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setEditingSupplier(supplier)}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors shrink-0"
              >
                Configurer
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingSupplier && (
        <SupplierConfigWizard
          supplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
        />
      )}
    </div>
  );
}
