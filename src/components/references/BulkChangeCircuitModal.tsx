import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Stepper } from '../ui/Stepper';
import { Badge } from '../ui/Badge';
import { useStore } from '../../store';
import { Circuit } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedReferenceIds: string[];
}

const steps = [
  { label: 'Circuit' },
  { label: 'Sites' },
  { label: 'Confirmation' },
];

export function BulkChangeCircuitModal({ isOpen, onClose, selectedReferenceIds }: Props) {
  const { state, dispatch } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [selectedGrappeId, setSelectedGrappeId] = useState<string | null>(null);

  // Get current supplier from first selected ref
  const currentSupplier = useMemo(() => {
    if (selectedReferenceIds.length === 0) return null;
    const ref = state.data.references[selectedReferenceIds[0]];
    if (!ref) return null;
    const pc = state.data.purchaseConditions[ref.purchaseConditionId];
    if (!pc) return null;
    return state.data.suppliers[pc.supplierId];
  }, [selectedReferenceIds, state.data]);

  const currentPC = useMemo(() => {
    if (selectedReferenceIds.length === 0) return null;
    const ref = state.data.references[selectedReferenceIds[0]];
    return ref ? state.data.purchaseConditions[ref.purchaseConditionId] : null;
  }, [selectedReferenceIds, state.data]);

  const availableCircuits = currentSupplier?.supportedCircuits || [];

  const availableSites = useMemo(() => {
    if (!selectedCircuit) return [];
    return Object.values(state.data.sites).filter(s =>
      selectedCircuit === 'direct' ? s.type === 'magasin' : s.type === 'entrepot'
    ).filter(s => currentSupplier?.siteIds.includes(s.id));
  }, [selectedCircuit, state.data.sites, currentSupplier]);

  const supplierGrappes = useMemo(() => {
    if (!currentSupplier || currentSupplier.siteConfigType !== 'group_of_sites') return [];
    return currentSupplier.defaultGrappeIds
      .map(id => state.data.grappes[id])
      .filter(Boolean);
  }, [currentSupplier, state.data.grappes]);

  const isNational = currentSupplier?.siteConfigType === 'national';

  const handleClose = () => {
    setCurrentStep(0);
    setSelectedCircuit(null);
    setSelectedSiteIds([]);
    setSelectedGrappeId(null);
    onClose();
  };

  const handleCircuitSelect = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    if (isNational) {
      // National: auto-select all matching sites
      const sites = Object.values(state.data.sites)
        .filter(s => circuit === 'direct' ? s.type === 'magasin' : s.type === 'entrepot')
        .filter(s => currentSupplier?.siteIds.includes(s.id));
      setSelectedSiteIds(sites.map(s => s.id));
    } else {
      setSelectedSiteIds([]);
    }
  };

  const handleConfirm = () => {
    if (!selectedCircuit) return;
    dispatch({
      type: 'CHANGE_CIRCUIT',
      referenceIds: selectedReferenceIds,
      newCircuit: selectedCircuit,
      newSiteIds: selectedSiteIds,
      newGrappeId: selectedGrappeId,
    });
    handleClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!selectedCircuit;
      case 1: return selectedSiteIds.length > 0;
      case 2: return true;
      default: return false;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Changer de circuit" size="lg">
      <Stepper steps={steps} currentStep={currentStep} />

      {currentStep === 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Sélectionnez le nouveau circuit pour {selectedReferenceIds.length} référence{selectedReferenceIds.length > 1 ? 's' : ''}.
            {currentSupplier && (
              <span className="block mt-1">
                Fournisseur : <strong>{currentSupplier.name}</strong>
              </span>
            )}
          </p>

          {availableCircuits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun circuit disponible pour ce fournisseur.
            </div>
          ) : (
            <div className="space-y-2">
              {availableCircuits.map(c => (
                <button
                  key={c}
                  onClick={() => handleCircuitSelect(c)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedCircuit === c
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={c === 'direct' ? 'success' : 'warning'}>
                      {c === 'direct' ? '🏪 Direct' : '📦 Stock'}
                    </Badge>
                    <span className="text-gray-700 font-medium">
                      {c === 'direct' ? 'Livraison directe aux magasins' : 'Livraison aux entrepôts'}
                    </span>
                  </div>
                  {currentPC?.circuit === c && (
                    <p className="text-xs text-gray-400 mt-1">Circuit actuel</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {currentStep === 1 && (
        <div>
          {isNational ? (
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
              <strong>Configuration nationale</strong> : tous les sites compatibles avec le circuit
              <strong> {selectedCircuit}</strong> sont automatiquement sélectionnés ({selectedSiteIds.length} sites).
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Sélectionnez les sites pour le circuit <strong>{selectedCircuit}</strong>.
              </p>

              {supplierGrappes.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Ou sélectionnez une grappe existante</h4>
                  <div className="flex gap-2 flex-wrap">
                    {supplierGrappes.map(g => (
                      <button
                        key={g.id}
                        onClick={() => {
                          setSelectedGrappeId(g.id);
                          const siteIds = g.siteGroups.flatMap(sg => sg.siteIds);
                          setSelectedSiteIds(siteIds);
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                          selectedGrappeId === g.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {selectedSiteIds.length} / {availableSites.length} sites sélectionnés
                </span>
                <button
                  onClick={() =>
                    setSelectedSiteIds(
                      selectedSiteIds.length === availableSites.length
                        ? []
                        : availableSites.map(s => s.id)
                    )
                  }
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {selectedSiteIds.length === availableSites.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {availableSites.map(s => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSiteIds.includes(s.id)}
                      onChange={() => {
                        setSelectedGrappeId(null);
                        setSelectedSiteIds(prev =>
                          prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                        );
                      }}
                      className="rounded border-gray-400"
                    />
                    <div>
                      <span className="text-sm text-gray-900">{s.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{s.city}</span>
                    </div>
                    <Badge variant={s.type === 'magasin' ? 'success' : 'warning'} className="ml-auto">
                      {s.type === 'magasin' ? '🏪' : '📦'}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Résumé des modifications</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Références</span>
              <span className="font-medium">{selectedReferenceIds.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ancien circuit</span>
              <Badge variant={currentPC?.circuit === 'direct' ? 'success' : 'warning'}>
                {currentPC?.circuit === 'direct' ? '🏪 Direct' : '📦 Stock'}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Nouveau circuit</span>
              <Badge variant={selectedCircuit === 'direct' ? 'success' : 'warning'}>
                {selectedCircuit === 'direct' ? '🏪 Direct' : '📦 Stock'}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sites</span>
              <span className="font-medium">{selectedSiteIds.length} sites</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : handleClose()}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {currentStep === 0 ? 'Annuler' : 'Précédent'}
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Suivant
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Confirmer
          </button>
        )}
      </div>
    </Modal>
  );
}
