import { useState, useRef } from 'react';
import { PageHeader } from '../layout/PageHeader';
import { downloadRempafourTemplate, parseRempafourFile, RempafourRow } from '../../utils/excel';

interface BulkEditionPageProps {
  onBack: () => void;
  onConfirm?: () => void;
}

const SAMPLE_REFERENCES = [
  { id: '11712011', label: 'Descargador ROCA doble pulsador' },
  { id: '22712022', label: 'Descargador cable ROCA doble pulsador' },
  { id: '33712033', label: 'Descargador Aquafresh 3 triple action' },
];

export function BulkEditionPage({ onBack, onConfirm }: BulkEditionPageProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<RempafourRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmRequest, setShowConfirmRequest] = useState(false);

  const [changePrices, setChangePrices] = useState(true);
  const [activeDate, setActiveDate] = useState('23/04/2026');
  const [deliveryDate, setDeliveryDate] = useState('25/04/2026');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasUpload = !!parsedRows && parsedRows.length > 0;

  const handleDownload = () => {
    downloadRempafourTemplate();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setIsProcessing(true);
    setParseError(null);
    const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const [rows] = await Promise.all([parseRempafourFile(file), minDelay]);
      setParsedRows(rows);
    } catch (err) {
      await minDelay;
      setParseError(err instanceof Error ? err.message : 'Error parsing file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setParsedRows(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F5F5]">
      <PageHeader title="Import a CSV" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="bg-white rounded-lg overflow-hidden max-w-4xl" style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}>
          <div className="grid grid-cols-2 divide-x divide-[#EEEEEE] min-h-[240px]">
            {/* Left panel: Download */}
            <div className="p-8">
              <p className="text-sm text-[#666666] mb-5">Download the blank template</p>
              <button
                onClick={handleDownload}
                className="border border-[#333333] rounded px-4 py-2.5 flex items-center gap-2 text-sm font-bold text-[#333333] hover:bg-[#F5F5F5]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download file
              </button>
            </div>

            {/* Right panel: Upload */}
            <div className="p-8">
              <p className="text-sm text-[#666666] mb-5">Upload your file filled with changes to implement them</p>
              <label className="border border-[#007F8C] rounded px-4 py-2.5 flex items-center gap-2 text-sm font-bold text-[#007F8C] hover:bg-[#F0F9F9] cursor-pointer w-fit">
                <svg className="w-4 h-4 text-[#007F8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Select a file to upload
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              {hasUpload && uploadedFile && (
                <div className="mt-3 flex items-center gap-3 px-3 py-2 bg-[#F5F5F5] rounded">
                  <span className="text-sm text-[#333333] truncate flex-1 min-w-0">{uploadedFile.name}</span>
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <button onClick={handleRemoveFile} className="text-[#666666] hover:text-[#333333] shrink-0" aria-label="Remove file">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
              {parseError && (
                <p className="mt-2 text-sm text-red-600">{parseError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Summary + form — only rendered after successful upload */}
        {hasUpload && (
          <div className="bg-white rounded-lg p-6 max-w-4xl mt-6" style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
              {/* LEFT: info cards */}
              <div className="space-y-4">
                <InfoCard
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  }
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-[#333333]">{parsedRows!.length}</span>
                    <span className="text-sm text-[#666666] font-medium">References</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_REFERENCES.map(r => (
                      <span
                        key={r.id}
                        className="inline-flex items-center px-3 py-[3px] bg-white border border-[#808080] rounded-xl text-xs text-[#333333]"
                      >
                        {r.id} - {r.label}
                      </span>
                    ))}
                  </div>
                  <button className="text-xs text-[#666666] underline mt-3 hover:text-[#333333]">See all</button>
                </InfoCard>

                <InfoCard
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  title="Commercial supplier"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-semibold text-[#333333]">ROCA SANITARIO TR (345657)</span>
                    <span className="text-[11px] font-bold text-[#005C91] bg-[#DAEFF7] border border-[#0B96CC] rounded px-1.5 py-0.5">
                      National
                    </span>
                    <span className="text-sm text-[#666666]">7 - Sanitario</span>
                  </div>
                </InfoCard>

                <InfoCard
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  }
                  title="Circuits"
                >
                  <div className="space-y-1.5 text-sm">
                    <p className="text-[#808080] line-through">Stock - EXW</p>
                    <p className="text-[#808080] line-through">AXD - DDP</p>
                    <p className="text-[#333333] font-semibold">Direct - DDP</p>
                  </div>
                </InfoCard>

                <InfoCard
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 21V7l9-4 9 4v14M9 21V12h6v9" />
                    </svg>
                  }
                  title="Sites"
                  rightAction={<button className="text-xs text-[#666666] underline hover:text-[#333333]">See list</button>}
                >
                  <div className="space-y-1 text-sm">
                    <p className="text-[#808080] line-through">112 stores</p>
                    <p className="text-[#333333] font-semibold">4 warehouses</p>
                  </div>
                </InfoCard>
              </div>

              {/* RIGHT: form */}
              <div className="space-y-5">
                <FormField label="Active date">
                  <DateInput value={activeDate} onChange={setActiveDate} />
                </FormField>
                <FormField label="1st possible delivery date">
                  <DateInput value={deliveryDate} onChange={setDeliveryDate} />
                </FormField>
                <FormField label="Purchase prices">
                  <div className="border border-[#CCCCCC] rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <ToggleSwitch checked={changePrices} onChange={setChangePrices} />
                      <span className="text-sm font-semibold text-[#333333]">Change prices</span>
                    </div>
                    {changePrices && (
                      <div className="flex items-start gap-2 bg-[#D9F0F3] rounded-md p-3 text-sm text-[#333333]">
                        <svg className="w-5 h-5 text-[#007F8C] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Please don't forget to manage your prices in PPM.</span>
                      </div>
                    )}
                  </div>
                </FormField>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#EEEEEE] px-8 py-4 flex items-center justify-end gap-3 shrink-0">
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-white border border-[#CCCCCC] rounded text-sm font-bold text-[#333333] hover:bg-[#F5F5F5] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => setShowConfirmRequest(true)}
          disabled={!parsedRows || parsedRows.length === 0}
          className="px-5 py-2.5 bg-[#007F8C] text-white rounded text-sm font-bold hover:bg-[#005C66] transition-colors disabled:bg-[#CCCCCC] disabled:text-[#666666] disabled:cursor-not-allowed"
        >
          Confirm change request
        </button>
      </div>

      {/* Loading spinner modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg px-8 py-8 flex flex-col items-center gap-4 shadow-xl">
            <svg className="animate-spin w-10 h-10 text-[#007F8C]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <div className="text-center">
              <p className="text-base font-bold text-[#333333]">Processing your file…</p>
              <p className="text-sm text-[#666666] mt-1">Detecting changes from your Purchase condition file.</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm change request modal */}
      {showConfirmRequest && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={() => setShowConfirmRequest(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[#333333] mb-2">Confirm change request</h3>
            <p className="text-sm text-[#666666] mb-6">
              Are you sure you want to confirm this change request? This action will create a new request.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmRequest(false)}
                className="px-5 py-2.5 bg-white border border-[#CCCCCC] rounded text-sm font-bold text-[#333333] hover:bg-[#F5F5F5] transition-colors"
              >
                No
              </button>
              <button
                onClick={() => {
                  setShowConfirmRequest(false);
                  onConfirm?.();
                  onBack();
                }}
                className="px-5 py-2.5 bg-[#007F8C] text-white rounded text-sm font-bold hover:bg-[#005C66] transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
  rightAction,
}: {
  icon: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}) {
  return (
    <div className="bg-[#D9F0F3] rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-[#666666] shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[#666666]">{title}</p>
              {rightAction}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-bold text-[#333333]">{label}</label>
        <svg className="w-4 h-4 text-[#007F8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      {children}
    </div>
  );
}

function DateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-3 border border-[#666666] rounded text-sm text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#007F8C] focus:border-[#007F8C]"
      />
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider flex items-center">
        {checked && (
          <svg className="w-3 h-3 text-white absolute left-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
    </label>
  );
}
