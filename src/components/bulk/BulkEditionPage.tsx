import { useState, useRef } from 'react';
import { PageHeader } from '../layout/PageHeader';
import { downloadRempafourTemplate, parseRempafourFile, RempafourRow } from '../../utils/excel';

interface BulkEditionPageProps {
  onBack: () => void;
}

const SAMPLE_REFERENCES = [
  { id: '11712011', label: 'Descargador ROCA doble pulsador' },
  { id: '22712022', label: 'Descargador cable ROCA doble pulsador' },
  { id: '33712033', label: 'Descargador Aquafresh 3 triple action' },
];

export function BulkEditionPage({ onBack }: BulkEditionPageProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<RempafourRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [changeGtin, setChangeGtin] = useState(true);
  const [changePrices, setChangePrices] = useState(true);
  const [gtinFileName, setGtinFileName] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState('23/04/2026');
  const [deliveryDate, setDeliveryDate] = useState('25/04/2026');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const gtinInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    downloadRempafourTemplate();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setIsProcessing(true);
    setParseError(null);
    try {
      const rows = await parseRempafourFile(file);
      setParsedRows(rows);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Error parsing file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGtinFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setGtinFileName(file.name);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setParsedRows(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Editing references" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Step 1: File download/upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 max-w-6xl">
          <h2 className="text-base font-bold text-gray-900 mb-1">REMPAFOUR file</h2>
          <p className="text-sm text-gray-500 mb-5">
            Download the template, fill in your changes, and upload the file.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Download */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg hover:border-[#0a8f8f] hover:bg-[#f0f9f9] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#e8f4f4] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#0a8f8f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Download REMPAFOUR template</p>
                <p className="text-xs text-gray-500 mt-0.5">Excel file with sample data</p>
              </div>
            </button>

            {/* Upload */}
            <div>
              <label
                className={`flex items-center gap-4 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  uploadedFile
                    ? 'border-[#0a8f8f] bg-[#f0f9f9]'
                    : 'border-gray-300 hover:border-[#0a8f8f] hover:bg-[#f0f9f9]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#e8f4f4] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#0a8f8f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  {uploadedFile ? (
                    <>
                      <p className="font-semibold text-gray-900 text-sm truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isProcessing ? 'Processing...' : parsedRows ? `${parsedRows.length} rows parsed` : parseError || ''}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-900 text-sm">Upload edited file</p>
                      <p className="text-xs text-gray-500 mt-0.5">.xlsx, .xls</p>
                    </>
                  )}
                </div>
                {uploadedFile && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveFile();
                    }}
                    className="p-1.5 hover:bg-white rounded text-gray-600"
                    aria-label="Remove file"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              {parsedRows && parsedRows.length > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-700">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  File processed successfully — ready to review below
                </div>
              )}
            </div>
          </div>

          {/* Parsed preview */}
          {parsedRows && parsedRows.length > 0 && (
            <div className="mt-5 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700 uppercase">
                  Parsed data ({parsedRows.length} rows)
                </h3>
              </div>
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Ref LM</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Nouveau Prix</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Cond.</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">GTIN</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">FOUCOM</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Date</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Mag.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 15).map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-1.5 text-gray-800">{row.refLM}</td>
                        <td className="px-3 py-1.5 text-gray-800">{row.nouveauPrixAchat}</td>
                        <td className="px-3 py-1.5 text-gray-600">{row.conditionnement}</td>
                        <td className="px-3 py-1.5 text-gray-600">{row.codeBarreGtin}</td>
                        <td className="px-3 py-1.5 text-gray-600">{row.foucom}</td>
                        <td className="px-3 py-1.5 text-gray-600">{row.dateApplication}</td>
                        <td className="px-3 py-1.5 text-gray-600">{row.listeMagasins}</td>
                      </tr>
                    ))}
                    {parsedRows.length > 15 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-2 text-center text-gray-400 text-xs">
                          ... and {parsedRows.length - 15} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Validation request section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-6xl">
          <h2 className="text-base font-bold text-gray-900 mb-4">Validation request</h2>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
            {/* LEFT: info cards */}
            <div className="space-y-4">
              {/* References */}
              <InfoCard
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-gray-900">42</span>
                  <span className="text-sm text-gray-600 font-medium">References</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_REFERENCES.map(r => (
                    <span
                      key={r.id}
                      className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-700"
                    >
                      {r.id} - {r.label}
                    </span>
                  ))}
                </div>
                <button className="text-xs text-gray-600 underline mt-3 hover:text-gray-900">See all</button>
              </InfoCard>

              {/* Commercial supplier */}
              <InfoCard
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                title="Commercial supplier"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">ROCA SANITARIO TR (345657)</span>
                  <span className="text-[11px] font-semibold text-[#0a8f8f] border border-[#0a8f8f] rounded px-1.5 py-0.5">
                    National
                  </span>
                  <span className="text-sm text-gray-600">7 - Sanitario</span>
                </div>
              </InfoCard>

              {/* Circuits */}
              <InfoCard
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                }
                title="Circuits"
              >
                <div className="space-y-1.5 text-sm">
                  <p className="text-gray-500 line-through">Stock - EXW</p>
                  <p className="text-gray-500 line-through">AXD - DDP</p>
                  <p className="text-gray-900 font-semibold">Direct - DDP</p>
                </div>
              </InfoCard>

              {/* Sites */}
              <InfoCard
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 21V7l9-4 9 4v14M9 21V12h6v9" />
                  </svg>
                }
                title="Sites"
                rightAction={<button className="text-xs text-gray-600 underline hover:text-gray-900">See list</button>}
              >
                <div className="space-y-1 text-sm">
                  <p className="text-gray-500 line-through">112 stores</p>
                  <p className="text-gray-900 font-semibold">4 warehouses</p>
                </div>
              </InfoCard>
            </div>

            {/* RIGHT: form */}
            <div className="space-y-5">
              {/* Active date */}
              <FormField label="Active date">
                <DateInput value={activeDate} onChange={setActiveDate} />
              </FormField>

              {/* 1st possible delivery date */}
              <FormField label="1st possible delivery date">
                <DateInput value={deliveryDate} onChange={setDeliveryDate} />
              </FormField>

              {/* Gtin & supplier references */}
              <FormField label="Gtin & supplier references">
                <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <ToggleSwitch checked={changeGtin} onChange={setChangeGtin} />
                    <span className="text-sm font-semibold text-gray-800">Change values</span>
                  </div>
                  {changeGtin && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <button
                          onClick={handleDownload}
                          className="underline hover:text-[#0a8f8f]"
                        >
                          Download template
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <button
                          onClick={() => gtinInputRef.current?.click()}
                          className="underline hover:text-[#0a8f8f]"
                        >
                          Upload edited file
                        </button>
                        <input
                          ref={gtinInputRef}
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleGtinFileSelect}
                          className="hidden"
                        />
                      </div>
                      {gtinFileName && (
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                          <span className="flex-1 text-sm text-gray-800 truncate">{gtinFileName}</span>
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth={2} />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                          </svg>
                          <button
                            onClick={() => setGtinFileName(null)}
                            className="p-1 hover:bg-gray-200 rounded text-gray-600"
                            aria-label="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </FormField>

              {/* Purchase prices */}
              <FormField label="Purchase prices">
                <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <ToggleSwitch checked={changePrices} onChange={setChangePrices} />
                    <span className="text-sm font-semibold text-gray-800">Change prices</span>
                  </div>
                  {changePrices && (
                    <div className="flex items-start gap-2 bg-[#e8f4f4] rounded-md p-3 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-[#0a8f8f] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-end gap-3 shrink-0">
        <button
          onClick={onBack}
          className="px-5 py-2.5 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel edition
        </button>
        <button
          onClick={() => {
            alert('Change request confirmed!');
            onBack();
          }}
          disabled={!parsedRows || parsedRows.length === 0}
          className="px-5 py-2.5 bg-[#0a8f8f] text-white rounded-md text-sm font-semibold hover:bg-[#076666] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm change request
        </button>
      </div>
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
    <div className="bg-[#e8f4f4] rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-gray-500 shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">{title}</p>
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
        <label className="text-sm font-bold text-gray-900">{label}</label>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0a8f8f] focus:border-[#0a8f8f]"
      />
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
