import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Grappe, SiteGroup, Supplier } from '../../types';

export function GrappesPage() {
  const { state, dispatch } = useStore();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [editingGrappe, setEditingGrappe] = useState<Grappe | null>(null);
  const [movingSites, setMovingSites] = useState<{ grappeId: string; fromGroupId: string; siteIds: string[] } | null>(null);
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSiteIds, setNewGroupSiteIds] = useState<string[]>([]);

  const gosSuppliers = useMemo(
    () => Object.values(state.data.suppliers)
      .filter(s => s.siteConfigType === 'group_of_sites')
      .sort((a, b) => a.name.localeCompare(b.name)),
    [state.data.suppliers]
  );

  const selectedSupplier = selectedSupplierId ? state.data.suppliers[selectedSupplierId] : null;

  const supplierGrappes = useMemo(() => {
    if (!selectedSupplier) return [];
    return selectedSupplier.defaultGrappeIds
      .map(id => state.data.grappes[id])
      .filter(Boolean);
  }, [selectedSupplier, state.data.grappes]);

  const availableSites = useMemo(() => {
    if (!selectedSupplier) return [];
    return Object.values(state.data.sites).filter(s => selectedSupplier.siteIds.includes(s.id));
  }, [selectedSupplier, state.data.sites]);

  // Sites matching circuit type for a given grappe/group
  const getSitesForGroup = (siteIds: string[]) => {
    return siteIds.map(id => state.data.sites[id]).filter(Boolean);
  };

  const handleMoveSites = () => {
    if (!movingSites || !targetGroupId) return;
    dispatch({
      type: 'MOVE_SITES',
      grappeId: movingSites.grappeId,
      fromGroupId: movingSites.fromGroupId,
      toGroupId: targetGroupId,
      siteIds: movingSites.siteIds,
    });
    setMovingSites(null);
    setTargetGroupId(null);
  };

  const handleCreateGroup = (grappeId: string) => {
    if (!newGroupName.trim() || newGroupSiteIds.length === 0) return;
    const firstSite = state.data.sites[newGroupSiteIds[0]];
    const newGroup: SiteGroup = {
      id: `sg-new-${Date.now()}`,
      name: newGroupName,
      siteType: firstSite?.type || 'magasin',
      siteIds: [...newGroupSiteIds],
    };
    dispatch({
      type: 'ADD_SITE_GROUP',
      grappeId,
      siteGroup: newGroup,
    });
    setCreatingGroup(null);
    setNewGroupName('');
    setNewGroupSiteIds([]);
  };

  const handleDeleteGroup = (grappeId: string, groupId: string) => {
    dispatch({
      type: 'DELETE_SITE_GROUP',
      grappeId,
      siteGroupId: groupId,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Grappes de groupes de sites</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Gérez les grappes et groupes de sites des fournisseurs "Group of sites"
        </p>
      </div>

      <div className="p-6">
        {/* Supplier selector */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Fournisseur</label>
          <select
            value={selectedSupplierId || ''}
            onChange={(e) => setSelectedSupplierId(e.target.value || null)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionnez un fournisseur...</option>
            {gosSuppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {selectedSupplier && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="font-semibold text-gray-900">{selectedSupplier.name}</h2>
                <Badge variant="purple">📍 Group of sites</Badge>
                {selectedSupplier.supportedCircuits.map(c => (
                  <Badge key={c} variant={c === 'direct' ? 'success' : 'warning'}>
                    {c === 'direct' ? '🏪 Direct' : '📦 Stock'}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {selectedSupplier.siteIds.length} sites · {supplierGrappes.length} grappe(s)
              </p>
            </div>

            {/* Grappes */}
            {supplierGrappes.map(grappe => (
              <div key={grappe.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{grappe.name}</h3>
                    <p className="text-xs text-gray-500">{grappe.siteGroups.length} groupe(s)</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCreatingGroup(grappe.id);
                        setNewGroupName('');
                        setNewGroupSiteIds([]);
                      }}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      + Groupe
                    </button>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grappe.siteGroups.map(sg => (
                    <div key={sg.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-gray-800">{sg.name}</h4>
                          <Badge variant={sg.siteType === 'magasin' ? 'success' : 'warning'}>
                            {sg.siteType === 'magasin' ? '🏪' : '📦'}
                          </Badge>
                        </div>
                        <button
                          onClick={() => handleDeleteGroup(grappe.id, sg.id)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {getSitesForGroup(sg.siteIds).map(site => (
                          <label key={site.id} className="flex items-center gap-2 text-xs text-gray-600 py-0.5">
                            <input
                              type="checkbox"
                              className="rounded border-gray-400"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setMovingSites(prev => {
                                    if (prev && prev.grappeId === grappe.id && prev.fromGroupId === sg.id) {
                                      return { ...prev, siteIds: [...prev.siteIds, site.id] };
                                    }
                                    return { grappeId: grappe.id, fromGroupId: sg.id, siteIds: [site.id] };
                                  });
                                } else {
                                  setMovingSites(prev => {
                                    if (!prev) return null;
                                    const newIds = prev.siteIds.filter(id => id !== site.id);
                                    return newIds.length === 0 ? null : { ...prev, siteIds: newIds };
                                  });
                                }
                              }}
                              checked={movingSites?.fromGroupId === sg.id && movingSites.siteIds.includes(site.id)}
                            />
                            {site.name}
                          </label>
                        ))}
                      </div>
                      {movingSites && movingSites.fromGroupId === sg.id && movingSites.siteIds.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-blue-600 mb-1">
                            Déplacer {movingSites.siteIds.length} site(s) vers :
                          </p>
                          <select
                            value={targetGroupId || ''}
                            onChange={(e) => setTargetGroupId(e.target.value || null)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded mb-1"
                          >
                            <option value="">Choisir un groupe...</option>
                            {grappe.siteGroups
                              .filter(g => g.id !== sg.id)
                              .map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                          </select>
                          <button
                            onClick={handleMoveSites}
                            disabled={!targetGroupId}
                            className="w-full px-2 py-1 text-xs bg-blue-600 text-white rounded disabled:opacity-50"
                          >
                            Déplacer
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!selectedSupplier && (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            <p>Sélectionnez un fournisseur pour gérer ses grappes</p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <Modal
        isOpen={!!creatingGroup}
        onClose={() => setCreatingGroup(null)}
        title="Nouveau groupe de sites"
        size="md"
      >
        <div>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Nom du groupe..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <p className="text-sm text-gray-500 mb-2">
            Sélectionnez les sites ({newGroupSiteIds.length} sélectionnés)
          </p>
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {availableSites.map(s => (
              <label key={s.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newGroupSiteIds.includes(s.id)}
                  onChange={() =>
                    setNewGroupSiteIds(prev =>
                      prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                    )
                  }
                  className="rounded border-gray-400"
                />
                <span className="text-sm">{s.name}</span>
                <Badge variant={s.type === 'magasin' ? 'success' : 'warning'} className="ml-auto">
                  {s.type === 'magasin' ? '🏪' : '📦'}
                </Badge>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setCreatingGroup(null)}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={() => creatingGroup && handleCreateGroup(creatingGroup)}
              disabled={!newGroupName.trim() || newGroupSiteIds.length === 0}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
