import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Stepper } from '../ui/Stepper';
import { Badge } from '../ui/Badge';
import { useStore } from '../../store';
import { Supplier, SiteConfigType, SiteGroup, Grappe } from '../../types';

interface Props {
  supplier: Supplier;
  onClose: () => void;
}

export function SupplierConfigWizard({ supplier, onClose }: Props) {
  const { state, dispatch } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [newConfigType, setNewConfigType] = useState<SiteConfigType>(supplier.siteConfigType);
  const [newGrappes, setNewGrappes] = useState<Grappe[]>(() => {
    return supplier.defaultGrappeIds
      .map(id => state.data.grappes[id])
      .filter(Boolean);
  });
  const [editingGrappe, setEditingGrappe] = useState<Grappe | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSiteIds, setNewGroupSiteIds] = useState<string[]>([]);
  const [newGrappeName, setNewGrappeName] = useState('');

  const isChangingConfig = newConfigType !== supplier.siteConfigType;

  const steps = useMemo(() => {
    const s = [{ label: 'Configuration' }];
    if (newConfigType === 'group_of_sites') {
      s.push({ label: 'Grappes & Groupes' });
    }
    s.push({ label: 'Confirmation' });
    return s;
  }, [newConfigType]);

  // Get sites matching supplier's circuits
  const availableSites = useMemo(() => {
    return Object.values(state.data.sites).filter(s => supplier.siteIds.includes(s.id));
  }, [state.data.sites, supplier.siteIds]);

  const handleAddGrappe = () => {
    if (!newGrappeName.trim()) return;
    const newGrappe: Grappe = {
      id: `grappe-new-${Date.now()}`,
      name: newGrappeName,
      supplierId: supplier.id,
      siteGroups: [],
    };
    setNewGrappes(prev => [...prev, newGrappe]);
    setNewGrappeName('');
  };

  const handleAddGroupToGrappe = (grappeId: string) => {
    if (!newGroupName.trim() || newGroupSiteIds.length === 0) return;
    // Determine site type from first site
    const firstSite = state.data.sites[newGroupSiteIds[0]];
    const newGroup: SiteGroup = {
      id: `sg-new-${Date.now()}`,
      name: newGroupName,
      siteType: firstSite?.type || 'magasin',
      siteIds: [...newGroupSiteIds],
    };
    setNewGrappes(prev =>
      prev.map(g =>
        g.id === grappeId ? { ...g, siteGroups: [...g.siteGroups, newGroup] } : g
      )
    );
    setNewGroupName('');
    setNewGroupSiteIds([]);
  };

  const handleRemoveGroupFromGrappe = (grappeId: string, groupId: string) => {
    setNewGrappes(prev =>
      prev.map(g =>
        g.id === grappeId
          ? { ...g, siteGroups: g.siteGroups.filter(sg => sg.id !== groupId) }
          : g
      )
    );
  };

  const handleConfirm = () => {
    if (isChangingConfig || newConfigType === 'group_of_sites') {
      dispatch({
        type: 'CHANGE_SUPPLIER_CONFIG',
        supplierId: supplier.id,
        newConfigType,
        newGrappes: newConfigType === 'group_of_sites' ? newGrappes : undefined,
      });
    }
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Configuration — ${supplier.name}`} size="xl">
      <Stepper steps={steps} currentStep={currentStep} />

      {/* Step 0: Config type */}
      {currentStep === 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Choisissez le type de configuration de sites pour ce fournisseur.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setNewConfigType('national')}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                newConfigType === 'national'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <Badge variant="blue">🌐 National</Badge>
                {supplier.siteConfigType === 'national' && (
                  <span className="text-xs text-gray-400">Configuration actuelle</span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Inclut tous les magasins de la business unit. Les références auront le même prix pour tous les sites.
              </p>
            </button>

            <button
              onClick={() => setNewConfigType('group_of_sites')}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                newConfigType === 'group_of_sites'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <Badge variant="purple">📍 Group of sites</Badge>
                {supplier.siteConfigType === 'group_of_sites' && (
                  <span className="text-xs text-gray-400">Configuration actuelle</span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Regroupement personnalisé de sites. Un prix d'achat différent pour chaque groupe.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Configure grappes (only for group_of_sites) */}
      {currentStep === 1 && newConfigType === 'group_of_sites' && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Configurez les grappes de groupes de sites.
          </p>

          {/* Add new grappe */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newGrappeName}
              onChange={(e) => setNewGrappeName(e.target.value)}
              placeholder="Nom de la nouvelle grappe..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddGrappe}
              disabled={!newGrappeName.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              + Ajouter
            </button>
          </div>

          {/* List grappes */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            {newGrappes.map(grappe => (
              <div key={grappe.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{grappe.name}</h3>
                  <button
                    onClick={() => setNewGrappes(prev => prev.filter(g => g.id !== grappe.id))}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </div>

                {/* Site groups in this grappe */}
                <div className="space-y-2 mb-3">
                  {grappe.siteGroups.map(sg => (
                    <div key={sg.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">{sg.name}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          {sg.siteIds.length} sites · {sg.siteType === 'magasin' ? '🏪' : '📦'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveGroupFromGrappe(grappe.id, sg.id)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add group to this grappe */}
                {editingGrappe?.id === grappe.id ? (
                  <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Nom du groupe..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white mb-2">
                      {availableSites.map(s => (
                        <label key={s.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm">
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
                          <span>{s.name}</span>
                          <Badge variant={s.type === 'magasin' ? 'success' : 'warning'} className="ml-auto text-[10px]">
                            {s.type === 'magasin' ? '🏪' : '📦'}
                          </Badge>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          handleAddGroupToGrappe(grappe.id);
                          setEditingGrappe(null);
                        }}
                        disabled={!newGroupName.trim() || newGroupSiteIds.length === 0}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50"
                      >
                        Ajouter le groupe
                      </button>
                      <button
                        onClick={() => {
                          setEditingGrappe(null);
                          setNewGroupName('');
                          setNewGroupSiteIds([]);
                        }}
                        className="px-3 py-1.5 text-gray-600 text-sm border border-gray-300 rounded-lg"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingGrappe(grappe);
                      setNewGroupName('');
                      setNewGroupSiteIds([]);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Ajouter un groupe de sites
                  </button>
                )}
              </div>
            ))}

            {newGrappes.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Aucune grappe configurée. Ajoutez-en une ci-dessus.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last step: Confirmation */}
      {currentStep === steps.length - 1 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Résumé de la configuration</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Fournisseur</span>
              <span className="font-medium">{supplier.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ancienne configuration</span>
              <Badge variant={supplier.siteConfigType === 'national' ? 'blue' : 'purple'}>
                {supplier.siteConfigType === 'national' ? '🌐 National' : '📍 Group of sites'}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Nouvelle configuration</span>
              <Badge variant={newConfigType === 'national' ? 'blue' : 'purple'}>
                {newConfigType === 'national' ? '🌐 National' : '📍 Group of sites'}
              </Badge>
            </div>
            {newConfigType === 'group_of_sites' && (
              <div className="text-sm">
                <span className="text-gray-500">Grappes :</span>
                <div className="mt-2 space-y-2">
                  {newGrappes.map(g => (
                    <div key={g.id} className="bg-white rounded-lg p-2 border border-gray-200">
                      <span className="font-medium text-gray-700">{g.name}</span>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {g.siteGroups.map(sg => (
                          <Badge key={sg.id} variant="gray">{sg.name} ({sg.siteIds.length})</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : onClose()}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {currentStep === 0 ? 'Annuler' : 'Précédent'}
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Suivant
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Appliquer
          </button>
        )}
      </div>
    </Modal>
  );
}
