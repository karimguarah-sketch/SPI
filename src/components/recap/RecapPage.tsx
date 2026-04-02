import React, { useMemo } from 'react';
import { useStore } from '../../store';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { PendingChange } from '../../types';

function ChangeSummaryCard({ change, state }: { change: PendingChange; state: any }) {
  const getSupplierName = (id?: string) => id ? state.data.suppliers[id]?.name || id : '—';
  const getSiteNames = (ids?: string[]) =>
    ids?.slice(0, 5).map(id => state.data.sites[id]?.name || id) || [];
  const getGrappeName = (id?: string | null) =>
    id ? state.data.grappes[id]?.name || id : '—';

  const changeIcon = {
    supplier_change: (
      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    circuit_change: (
      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    site_assignment: (
      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      </svg>
    ),
    config_change: (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };

  const typeLabel = {
    supplier_change: 'Changement fournisseur',
    circuit_change: 'Changement circuit',
    site_assignment: 'Changement sites',
    config_change: 'Configuration fournisseur',
  };

  const typeColor = {
    supplier_change: 'primary' as const,
    circuit_change: 'warning' as const,
    site_assignment: 'purple' as const,
    config_change: 'success' as const,
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{changeIcon[change.type]}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={typeColor[change.type]}>{typeLabel[change.type]}</Badge>
            <span className="text-xs text-gray-400">
              {new Date(change.timestamp).toLocaleString('fr-FR')}
            </span>
          </div>

          <p className="text-sm text-gray-700 font-medium mb-3">{change.description}</p>

          {/* References count */}
          {change.referenceIds.length > 0 && (
            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500">
                {change.referenceIds.length} référence{change.referenceIds.length > 1 ? 's' : ''} concernée{change.referenceIds.length > 1 ? 's' : ''}
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {change.referenceIds.slice(0, 10).map(id => (
                  <Badge key={id} variant="gray">{id}</Badge>
                ))}
                {change.referenceIds.length > 10 && (
                  <Badge variant="gray">+{change.referenceIds.length - 10}</Badge>
                )}
              </div>
            </div>
          )}

          {/* Before / After comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Before */}
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <h4 className="text-xs font-semibold text-red-700 mb-2 uppercase">Avant</h4>
              <div className="space-y-1.5 text-xs">
                {change.before.supplierName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fournisseur</span>
                    <span className="font-medium text-gray-700">{change.before.supplierName}</span>
                  </div>
                )}
                {change.before.circuit && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Circuit</span>
                    <Badge variant={change.before.circuit === 'direct' ? 'success' : 'warning'}>
                      {change.before.circuit === 'direct' ? '🏪 Direct' : '📦 Stock'}
                    </Badge>
                  </div>
                )}
                {change.before.siteConfigType && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Zone</span>
                    <Badge variant={change.before.siteConfigType === 'national' ? 'blue' : 'purple'}>
                      {change.before.siteConfigType === 'national' ? '🌐 National' : '📍 Groupes'}
                    </Badge>
                  </div>
                )}
                {change.before.siteIds && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sites</span>
                    <span className="font-medium">{change.before.siteIds.length}</span>
                  </div>
                )}
                {change.before.grappeId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Grappe</span>
                    <span className="font-medium text-gray-700">{getGrappeName(change.before.grappeId)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* After */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <h4 className="text-xs font-semibold text-green-700 mb-2 uppercase">Après</h4>
              <div className="space-y-1.5 text-xs">
                {change.after.supplierName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fournisseur</span>
                    <span className="font-medium text-gray-700">{change.after.supplierName}</span>
                  </div>
                )}
                {change.after.circuit && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Circuit</span>
                    <Badge variant={change.after.circuit === 'direct' ? 'success' : 'warning'}>
                      {change.after.circuit === 'direct' ? '🏪 Direct' : '📦 Stock'}
                    </Badge>
                  </div>
                )}
                {change.after.siteConfigType && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Zone</span>
                    <Badge variant={change.after.siteConfigType === 'national' ? 'blue' : 'purple'}>
                      {change.after.siteConfigType === 'national' ? '🌐 National' : '📍 Groupes'}
                    </Badge>
                  </div>
                )}
                {change.after.siteIds && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sites</span>
                    <span className="font-medium">{change.after.siteIds.length}</span>
                  </div>
                )}
                {change.after.grappeId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Grappe</span>
                    <span className="font-medium text-gray-700">{getGrappeName(change.after.grappeId)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alerts: lost sites */}
          {change.before.siteIds && change.after.siteIds && (
            (() => {
              const lostSites = change.before.siteIds.filter(id => !change.after.siteIds!.includes(id));
              if (lostSites.length === 0) return null;
              return (
                <div className="mt-3">
                  <Alert type="warning" title={`${lostSites.length} site(s) retiré(s)`}>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {lostSites.slice(0, 10).map(id => {
                        const site = state.data.sites[id];
                        return <Badge key={id} variant="danger">{site?.name || id}</Badge>;
                      })}
                      {lostSites.length > 10 && <Badge variant="danger">+{lostSites.length - 10}</Badge>}
                    </div>
                  </Alert>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}

export function RecapPage() {
  const { state, dispatch } = useStore();
  const changes = state.pendingChanges;

  const changesByType = useMemo(() => {
    const grouped: Record<string, PendingChange[]> = {};
    for (const change of changes) {
      if (!grouped[change.type]) grouped[change.type] = [];
      grouped[change.type].push(change);
    }
    return grouped;
  }, [changes]);

  // Compute alerts: references that lost all sites
  const alerts = useMemo(() => {
    const refAlerts: { refId: string; label: string }[] = [];
    const siteAlerts: { siteId: string; siteName: string }[] = [];

    // Check for refs with 0 sites in their current PC
    for (const ref of Object.values(state.data.references)) {
      const pc = state.data.purchaseConditions[ref.purchaseConditionId];
      if (pc && pc.siteIds.length === 0) {
        refAlerts.push({ refId: ref.id, label: ref.label });
      }
    }

    return { refAlerts, siteAlerts };
  }, [state.data]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-4 bg-white border-b border-gray-200 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Synthèse des modifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {changes.length} modification{changes.length !== 1 ? 's' : ''} en attente
          </p>
        </div>
        {changes.length > 0 && (
          <button
            onClick={() => dispatch({ type: 'CLEAR_CHANGES' })}
            className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
          >
            Effacer tout
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Alerts */}
        {alerts.refAlerts.length > 0 && (
          <Alert type="error" title="Références sans site affecté">
            <p>{alerts.refAlerts.length} référence(s) n'ont plus aucun site affecté :</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {alerts.refAlerts.slice(0, 20).map(a => (
                <Badge key={a.refId} variant="danger">{a.refId}</Badge>
              ))}
              {alerts.refAlerts.length > 20 && (
                <Badge variant="danger">+{alerts.refAlerts.length - 20}</Badge>
              )}
            </div>
          </Alert>
        )}

        {/* Stats */}
        {changes.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {changesByType['supplier_change']?.length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Changements fournisseur</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {changesByType['circuit_change']?.length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Changements circuit</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {changesByType['site_assignment']?.length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Changements sites</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {changesByType['config_change']?.length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Configurations</p>
            </div>
          </div>
        )}

        {/* Changes list */}
        {changes.length > 0 ? (
          <div className="space-y-4">
            {[...changes].reverse().map(change => (
              <ChangeSummaryCard key={change.id} change={change} state={state} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Aucune modification effectuée</p>
            <p className="text-sm mt-1">Les modifications apparaîtront ici au fur et à mesure</p>
          </div>
        )}
      </div>
    </div>
  );
}
