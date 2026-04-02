import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Stepper } from '../ui/Stepper';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { useStore } from '../../store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedReferenceIds: string[];
}

const steps = [
  { label: 'Grappe' },
  { label: 'Sites' },
  { label: 'Confirmation' },
];

export function BulkChangeSitesModal({ isOpen, onClose, selectedReferenceIds }: Props) {
  const { state, dispatch } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGrappeId, setSelectedGrappeId] = useState<string | null>(null);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);

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

  const supplierGrappes = useMemo(() => {
    if (!currentSupplier) return [];
    return currentSupplier.defaultGrappeIds
      .map(id => state.data.grappes[id])
      .filter(Boolean);
  }, [currentSupplier, state.data.grappes]);

  const selectedGrappe = selectedGrappeId ? state.data.grappes[selectedGrappeId] : null;

  const availableSites = useMemo(() => {
    if (!currentPC) return [];
    return Object.values(state.data.sites)
      .filter(s => currentPC.circuit === 'direct' ? s.type === 'magasin' : s.type === 'entrepot')
      .filter(s => currentSupplier?.siteIds.includes(s.id));
  }, [currentPC, state.data.sites, currentSupplier]);

  const handleClose = () => {
    setCurrentStep(0);
    setSelectedGrappeId(null);
    setSelectedSiteIds([]);
    onClose();
  };

  const handleGrappeSelect = (grappeId: string) => {
    setSelectedGrappeId(grappeId);
    const grappe = state.data.grappes[grappeId];
    if (grappe) {
      setSelectedSiteIds(grappe.siteGroups.flatMap(sg => sg.siteIds));
    }
  };

  const handleConfirm = () => {
    dispatch({
      type: 'CHANGE_SITES',
      referenceIds: selectedReferenceIds,
      newSiteIds: selectedSiteIds,
      newGrappeId: selectedGrappeId,
    });
    handleClose();
  };

  if (currentSupplier?.siteConfigType === 'national') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Modifier les sites">
        <Alert type="info">
          La configuration du fournisseur <strong>{currentSupplier.name}</strong> est de type <strong>National</strong>.
          Tous les sites sont automatiquement inclus et ne peuvent pas être modifiés individuellement.
        </Alert>
        <div className="flex justify-end mt-4">
          <button onClick={handleClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">
            Fermer
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Modifier les sites" size="lg">
      <Stepper steps={steps} currentStep={currentStep} />

      {currentStep === 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Sélectionnez une grappe de groupes de sites ou créez une nouvelle affectation.
          </p>

          <div className="space-y-2 mb-4">
            {supplierGrappes.map(g => (
              <button
                key={g.id}
                onClick={() => handleGrappeSelect(g.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  selectedGrappeId === g.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium text-gray-900">{g.name}</span>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {g.siteGroups.map(sg => (
                    <Badge key={sg.id} variant="gray">{sg.name} ({sg.siteIds.length})</Badge>
                  ))}
                </div>
                {currentPC?.grappeId === g.id && (
                  <p className="text-xs text-blue-500 mt-1">Grappe actuelle</p>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setSelectedGrappeId(null);
              setSelectedSiteIds(currentPC?.siteIds || []);
              setCurrentStep(1);
            }}
            className="w-full text-left p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm text-gray-500"
          >
            + Sélection personnalisée des sites
          </button>
        </div>
      )}

      {currentStep === 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">
              {selectedSiteIds.length} / {availableSites.length} sites
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

          {selectedGrappe && (
            <div className="mb-3 p-2 bg-purple-50 rounded-lg text-xs text-purple-700">
              Grappe : <strong>{selectedGrappe.name}</strong> — Vous pouvez ajuster les sites individuellement ci-dessous.
            </div>
          )}

          <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
            {availableSites.map(s => (
              <label
                key={s.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSiteIds.includes(s.id)}
                  onChange={() =>
                    setSelectedSiteIds(prev =>
                      prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                    )
                  }
                  className="rounded border-gray-400"
                />
                <span className="text-sm text-gray-900">{s.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{s.city}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Résumé</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Références</span>
              <span className="font-medium">{selectedReferenceIds.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Anciens sites</span>
              <span className="font-medium">{currentPC?.siteIds.length || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Nouveaux sites</span>
              <span className="font-medium">{selectedSiteIds.length}</span>
            </div>
            {selectedGrappe && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Grappe</span>
                <span className="font-medium">{selectedGrappe.name}</span>
              </div>
            )}
          </div>

          {currentPC && selectedSiteIds.length < currentPC.siteIds.length && (
            <Alert type="warning" title="Attention">
              {currentPC.siteIds.length - selectedSiteIds.length} site(s) ne seront plus affectés aux références sélectionnées.
            </Alert>
          )}
        </div>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : handleClose()}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {currentStep === 0 ? 'Annuler' : 'Précédent'}
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={currentStep === 0 ? !selectedGrappeId && selectedSiteIds.length === 0 : selectedSiteIds.length === 0}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Confirmer
          </button>
        )}
      </div>
    </Modal>
  );
}
