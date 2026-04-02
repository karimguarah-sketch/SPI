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
  { label: 'Fournisseur' },
  { label: 'Circuit' },
  { label: 'Codes-barres & Réf.' },
  { label: 'Confirmation' },
];

export function BulkChangeSupplierModal({ isOpen, onClose, selectedReferenceIds }: Props) {
  const { state, dispatch } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [selectedGrappeId, setSelectedGrappeId] = useState<string | null>(null);
  const [barcodeUpdates, setBarcodeUpdates] = useState<Record<string, { ean: string; supplierRef: string }>>({});

  const suppliers = useMemo(
    () => Object.values(state.data.suppliers).sort((a, b) => a.name.localeCompare(b.name)),
    [state.data.suppliers]
  );

  const selectedSupplier = selectedSupplierId ? state.data.suppliers[selectedSupplierId] : null;

  const supplierGrappes = useMemo(() => {
    if (!selectedSupplier || selectedSupplier.siteConfigType !== 'group_of_sites') return [];
    return selectedSupplier.defaultGrappeIds
      .map(id => state.data.grappes[id])
      .filter(Boolean);
  }, [selectedSupplier, state.data.grappes]);

  const selectedRefs = useMemo(
    () => selectedReferenceIds.map(id => state.data.references[id]).filter(Boolean),
    [selectedReferenceIds, state.data.references]
  );

  // Check if all barcodes are filled
  const allBarcodesValid = useMemo(() => {
    return selectedReferenceIds.every(id => {
      const update = barcodeUpdates[id];
      return update && update.ean.trim() !== '' && update.supplierRef.trim() !== '';
    });
  }, [selectedReferenceIds, barcodeUpdates]);

  const handleClose = () => {
    setCurrentStep(0);
    setSelectedSupplierId(null);
    setSelectedCircuit(null);
    setSelectedGrappeId(null);
    setBarcodeUpdates({});
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedSupplierId || !selectedCircuit) return;

    dispatch({
      type: 'CHANGE_SUPPLIER',
      referenceIds: selectedReferenceIds,
      newSupplierId: selectedSupplierId,
      newCircuit: selectedCircuit,
      newGrappeId: selectedGrappeId,
      barcodeUpdates,
    });

    handleClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!selectedSupplierId;
      case 1: return !!selectedCircuit && (selectedSupplier?.siteConfigType !== 'group_of_sites' || !!selectedGrappeId);
      case 2: return allBarcodesValid;
      case 3: return true;
      default: return false;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Changer de fournisseur" size="lg">
      <Stepper steps={steps} currentStep={currentStep} />

      {/* Step 0: Select supplier */}
      {currentStep === 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Sélectionnez le nouveau fournisseur pour {selectedReferenceIds.length} référence{selectedReferenceIds.length > 1 ? 's' : ''}.
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {suppliers.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSupplierId(s.id);
                  setSelectedCircuit(s.supportedCircuits.length === 1 ? s.supportedCircuits[0] : null);
                  setSelectedGrappeId(null);
                }}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  selectedSupplierId === s.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.siteConfigType === 'national' ? 'blue' : 'purple'}>
                      {s.siteConfigType === 'national' ? '🌐 National' : '📍 Groupes'}
                    </Badge>
                    <div className="flex gap-1">
                      {s.supportedCircuits.map(c => (
                        <Badge key={c} variant={c === 'direct' ? 'success' : 'warning'}>
                          {c === 'direct' ? '🏪 Direct' : '📦 Stock'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{s.siteIds.length} sites</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Select circuit + grappe */}
      {currentStep === 1 && selectedSupplier && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Sélectionnez le circuit de livraison pour <strong>{selectedSupplier.name}</strong>.
          </p>

          <div className="space-y-2 mb-6">
            {selectedSupplier.supportedCircuits.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCircuit(c)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  selectedCircuit === c
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Badge variant={c === 'direct' ? 'success' : 'warning'}>
                    {c === 'direct' ? '🏪 Direct' : '📦 Stock'}
                  </Badge>
                  <span className="text-gray-700">
                    {c === 'direct' ? 'Livraison directe aux magasins' : 'Livraison aux entrepôts'}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {selectedSupplier.siteConfigType === 'group_of_sites' && supplierGrappes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Sélectionnez une grappe de groupes de sites</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {supplierGrappes.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGrappeId(g.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedGrappeId === g.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{g.name}</span>
                    <div className="flex gap-2 mt-1">
                      {g.siteGroups.map(sg => (
                        <Badge key={sg.id} variant="gray">{sg.name} ({sg.siteIds.length} sites)</Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Barcodes and supplier refs */}
      {currentStep === 2 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Renseignez le code-barres et la référence fournisseur pour chaque référence.
            <span className="text-red-500 font-medium ml-1">Ces champs sont obligatoires.</span>
          </p>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Référence</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Libellé</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Code-barres <span className="text-red-500">*</span>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Réf. fournisseur <span className="text-red-500">*</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedRefs.map(ref => (
                  <tr key={ref.id} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-500">{ref.id}</td>
                    <td className="px-3 py-2 text-gray-700 truncate max-w-48">{ref.label}</td>
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={barcodeUpdates[ref.id]?.ean || ''}
                        onChange={(e) => setBarcodeUpdates(prev => ({
                          ...prev,
                          [ref.id]: { ...prev[ref.id], ean: e.target.value, supplierRef: prev[ref.id]?.supplierRef || '' },
                        }))}
                        placeholder="Ex: 3614228123456"
                        className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          barcodeUpdates[ref.id]?.ean ? 'border-gray-300' : 'border-red-300 bg-red-50'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={barcodeUpdates[ref.id]?.supplierRef || ''}
                        onChange={(e) => setBarcodeUpdates(prev => ({
                          ...prev,
                          [ref.id]: { ...prev[ref.id], ean: prev[ref.id]?.ean || '', supplierRef: e.target.value },
                        }))}
                        placeholder="Ex: GRH-00001"
                        className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          barcodeUpdates[ref.id]?.supplierRef ? 'border-gray-300' : 'border-red-300 bg-red-50'
                        }`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === 3 && selectedSupplier && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Résumé des modifications</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Références concernées</span>
              <span className="font-medium">{selectedReferenceIds.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Nouveau fournisseur</span>
              <span className="font-medium">{selectedSupplier.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Circuit</span>
              <Badge variant={selectedCircuit === 'direct' ? 'success' : 'warning'}>
                {selectedCircuit === 'direct' ? '🏪 Direct' : '📦 Stock'}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Configuration</span>
              <Badge variant={selectedSupplier.siteConfigType === 'national' ? 'blue' : 'purple'}>
                {selectedSupplier.siteConfigType === 'national' ? '🌐 National' : '📍 Groupes'}
              </Badge>
            </div>
            {selectedGrappeId && state.data.grappes[selectedGrappeId] && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Grappe</span>
                <span className="font-medium">{state.data.grappes[selectedGrappeId].name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
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
