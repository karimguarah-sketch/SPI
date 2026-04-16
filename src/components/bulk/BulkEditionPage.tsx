import { useState, useRef } from 'react';
import { PageHeader } from '../layout/PageHeader';
import { downloadRempafourTemplate, parseRempafourFile, RempafourRow } from '../../utils/excel';

interface BulkEditionPageProps {
  onBack: () => void;
  onConfirm?: () => void;
}

export function BulkEditionPage({ onBack, onConfirm }: BulkEditionPageProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<RempafourRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmRequest, setShowConfirmRequest] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
              {parsedRows && parsedRows.length > 0 ? (
                <div className="flex items-center gap-3 p-3 bg-[#F0F9F9] border border-[#007F8C] rounded">
                  <svg className="w-5 h-5 text-[#007F8C] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#007F8C] truncate">{uploadedFile?.name}</p>
                    <p className="text-xs text-[#666666]">{parsedRows?.length} rows parsed</p>
                  </div>
                  <button onClick={handleRemoveFile} className="text-[#666666] hover:text-[#333333]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
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
                  {parseError && (
                    <p className="mt-2 text-sm text-red-600">{parseError}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
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
