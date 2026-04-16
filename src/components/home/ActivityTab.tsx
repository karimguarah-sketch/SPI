import { useState, useRef, useEffect } from 'react';

export interface ActivityItem {
  id: string;
  status: 'waiting' | 'validated' | 'rejected';
  activationDate?: string;
  requestDate: string;
  requestId: string;
  referencesCount: number;
  referencesPreview?: string;
  supplier?: string;
  supplierZone?: 'National' | 'Multi Zone' | 'Group of sites';
  supplierDept?: string;
  circuit?: string;
  warehouses?: string;
  suppliersCount?: number;
  circuitsCount?: number;
}

export const INITIAL_FUTURE_CHANGES: ActivityItem[] = [
  {
    id: 'c1',
    status: 'waiting',
    requestDate: '22/3/2026',
    requestId: 'REQ-20025420',
    referencesCount: 444,
    suppliersCount: 5,
    circuitsCount: 2,
    warehouses: '112 warehouses',
  },
  {
    id: 'c2',
    status: 'waiting',
    activationDate: '02/4/2026',
    requestDate: '25/3/2026',
    requestId: 'REQ-20031842',
    referencesCount: 42,
    supplier: 'GRUPO PUMA ESPAÑA (204304)',
    supplierZone: 'Multi Zone',
    supplierDept: '5 - Puertas y ventanas',
    circuit: 'Stock - EXW',
    warehouses: '29 stores',
  },
  {
    id: 'c3',
    status: 'waiting',
    activationDate: '15/4/2026',
    requestDate: '01/4/2026',
    requestId: 'REQ-20042567',
    referencesCount: 128,
    supplier: 'Henkel Iberica (765456)',
    supplierZone: 'National',
    supplierDept: '4 - Adhesivos',
    circuit: 'Direct - DDP',
    warehouses: '87 warehouses',
  },
  {
    id: 'c4',
    status: 'waiting',
    activationDate: '28/4/2026',
    requestDate: '10/4/2026',
    requestId: 'REQ-20055109',
    referencesCount: 7,
    supplier: '3M ESPANA (76808)',
    supplierZone: 'National',
    supplierDept: '7 - Sanitario',
    circuit: 'Ship from partner - DDP',
    warehouses: '56 stores',
  },
  {
    id: 'c5',
    status: 'waiting',
    activationDate: '12/5/2026',
    requestDate: '22/4/2026',
    requestId: 'REQ-20068774',
    referencesCount: 216,
    supplier: 'ROCA SANITARIO SA (999888)',
    supplierZone: 'National',
    supplierDept: '7 - Sanitario',
    circuit: 'Direct - DDP',
    warehouses: '112 warehouses',
  },
];

interface Props {
  onStartBulkEdition: () => void;
  items: ActivityItem[];
  onDeleteItem: (id: string) => void;
}

export function ActivityTab({ onStartBulkEdition, items, onDeleteItem }: Props) {
  const [activeTab, setActiveTab] = useState<'future' | 'past'>('future');
  const [pendingDelete, setPendingDelete] = useState<ActivityItem | null>(null);

  const handleDelete = (item: ActivityItem) => setPendingDelete(item);
  const confirmDelete = () => {
    if (pendingDelete) onDeleteItem(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 pt-6 pb-12">
      {/* Quick actions — single CTA */}
      <section className="mb-8 max-w-3xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[#007F8C] text-white">
            1 - Materiales de construccion
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border border-[#CCCCCC] text-[#333333] bg-white">
            6 - Ceramica
          </span>
        </div>

        <button
          onClick={onStartBulkEdition}
          className="border border-[#CCCCCC] rounded-lg p-5 flex items-center gap-4 hover:bg-[#F5F5F5] transition-colors text-left w-full max-w-md bg-white"
        >
          <svg className="w-5 h-5 text-[#333333] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <div className="flex-1">
            <p className="text-base font-bold text-[#333333]">Import a CSV</p>
            <p className="text-sm text-[#666666] mt-0.5">Import a spreadsheet to implement your changes</p>
          </div>
        </button>
      </section>

      {/* Activity */}
      <section>
        <h2 className="text-base font-bold text-[#333333] mb-3">Activity</h2>

        <div className="bg-white rounded-lg overflow-hidden" style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}>
          {/* Tabs row */}
          <div className="flex items-center justify-between px-6 pt-3 border-b border-[#EEEEEE]">
            <div className="flex gap-2 pb-2">
              <button
                onClick={() => setActiveTab('future')}
                className={
                  activeTab === 'future'
                    ? 'bg-[#D9F0F3] text-[#007F8C] font-bold rounded-md px-4 py-1.5 text-sm'
                    : 'text-[#666666] px-4 py-1.5 text-sm hover:text-[#333333]'
                }
              >
                Future changes
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={
                  activeTab === 'past'
                    ? 'bg-[#D9F0F3] text-[#007F8C] font-bold rounded-md px-4 py-1.5 text-sm'
                    : 'text-[#666666] px-4 py-1.5 text-sm hover:text-[#333333]'
                }
              >
                Past changes
              </button>
            </div>

            <div className="flex items-center gap-2 pb-2">
              <button className="flex items-center gap-2 px-3 py-2 border border-[#CCCCCC] rounded text-sm text-[#333333] hover:bg-[#F5F5F5]">
                Sort by <strong>Activation date</strong>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="w-8 h-8 rounded-full border border-[#CCCCCC] flex items-center justify-center text-[#666666] hover:bg-[#F5F5F5]" aria-label="Info">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Items */}
          <div>
            {activeTab === 'future' ? (
              items.map(item => <ActivityRow key={item.id} item={item} onDelete={handleDelete} />)
            ) : (
              <div className="p-8 text-center text-[#999999] text-sm">No past changes yet.</div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#EEEEEE] bg-white">
            <div className="flex items-center gap-2 text-sm text-[#333333]">
              <span>References per page</span>
              <select className="h-8 px-2 border border-[#CCCCCC] rounded text-sm bg-white">
                <option>10</option>
                <option>25</option>
              </select>
              <span className="ml-3 text-[#666666]">1-{items.length} of {items.length} items</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 bg-[#333333] text-white rounded flex items-center justify-center disabled:opacity-40" disabled>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-1 border border-[#CCCCCC] rounded px-2 h-8 bg-white">
                <span className="text-sm text-[#333333]">Page 1</span>
                <svg className="w-3 h-3 text-[#666666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <button className="w-8 h-8 bg-[#333333] text-white rounded flex items-center justify-center disabled:opacity-40" disabled>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPendingDelete(null)}>
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#333333] mb-2">Delete request</h3>
            <p className="text-sm text-[#666666] mb-5">Are you sure to delete this request?</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-5 py-2.5 bg-white border border-[#CCCCCC] rounded text-sm font-bold text-[#333333] hover:bg-[#F5F5F5] transition-colors"
              >
                No
              </button>
              <button
                onClick={confirmDelete}
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

function ActivityRow({ item, onDelete }: { item: ActivityItem; onDelete: (item: ActivityItem) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleCopyRequestId = () => {
    navigator.clipboard.writeText(item.requestId).catch(() => {});
    setMenuOpen(false);
  };

  return (
    <div className="border-b border-[#EEEEEE] last:border-b-0 hover:bg-[#FAFAFA]">
      {/* Header line */}
      <div className="flex items-center gap-6 px-4 pt-3 pb-2 flex-wrap">
        <StatusBadge status={item.status} />
        {item.activationDate && (
          <span className="text-sm text-[#666666]">
            Activation date <span className="font-bold text-[#333333]">{item.activationDate}</span>
          </span>
        )}
        <span className="text-sm text-[#666666]">
          Request date <span className="font-bold text-[#333333]">{item.requestDate}</span>
        </span>
        <span className="text-sm text-[#666666]">
          Request author <span className="font-bold text-[#333333]">{item.requestId.replace('REQ-', '')}</span>
        </span>
      </div>

      {/* Pills row */}
      <div className="flex items-stretch gap-2 px-4 pb-3 flex-wrap">
        {/* References pill */}
        <div className="bg-[#D9F0F3] rounded-lg px-3 py-2 flex items-center gap-2 text-sm shrink-0">
          <svg className="w-4 h-4 text-[#666666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="font-bold text-[#333333]">{item.referencesCount}</span>
          <span className="text-xs text-[#666666]">Referen...</span>
        </div>

        {/* Supplier pill */}
        {item.suppliersCount !== undefined ? (
          <div className="bg-[#D9F0F3] rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-[#666666] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-bold text-[#333333]">{item.suppliersCount}</span>
            <span>Suppliers involved</span>
          </div>
        ) : item.supplier ? (
          <div className="bg-[#D9F0F3] rounded-lg px-3 py-2 flex items-center gap-2 text-sm flex-1 min-w-0">
            <svg className="w-4 h-4 text-[#666666] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#333333] text-sm truncate">{item.supplier}</span>
                {item.supplierZone && (
                  <span className="text-[10px] font-bold text-[#005C91] bg-[#DAEFF7] border border-[#0B96CC] rounded px-1.5 py-0.5 shrink-0">
                    {item.supplierZone}
                  </span>
                )}
              </div>
              {item.supplierDept && (
                <span className="text-xs text-[#666666]">{item.supplierDept}</span>
              )}
            </div>
          </div>
        ) : null}

        {/* Circuit pill */}
        {item.circuitsCount !== undefined ? (
          <div className="bg-[#D9F0F3] rounded-lg px-3 py-2 flex items-center gap-2 text-sm shrink-0">
            <svg className="w-4 h-4 text-[#666666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" />
            </svg>
            <span className="font-bold">{item.circuitsCount}</span>
            <span>Circuits involved</span>
          </div>
        ) : item.circuit ? (
          <div className="bg-[#D9F0F3] rounded-lg px-3 py-2 flex items-center gap-2 text-sm shrink-0">
            <svg className="w-4 h-4 text-[#666666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" />
            </svg>
            <span>{item.circuit}</span>
          </div>
        ) : null}

        {/* Warehouses pill */}
        {item.warehouses && (
          <div className="bg-[#D9F0F3] rounded-lg px-3 py-2 flex items-center gap-2 text-sm shrink-0">
            <svg className="w-4 h-4 text-[#666666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V7l9-4 9 4v14M9 21V12h6v9" />
            </svg>
            <span>{item.warehouses}</span>
          </div>
        )}

        {/* Three-dot menu */}
        <div className="ml-auto relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-2 text-[#666666] hover:bg-[#F5F5F5] rounded transition-colors"
            aria-label="Options"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-10 bg-white border border-[#EEEEEE] rounded-lg shadow-lg min-w-[200px] py-2">
              <MenuButton label="Copy request id" onClick={handleCopyRequestId} />
              <MenuButton label="Delete this request" danger onClick={() => { setMenuOpen(false); onDelete(item); }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuButton({ label, danger, onClick }: { label: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F5F5F5] ${danger ? 'text-red-600' : 'text-[#333333]'}`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: 'waiting' | 'validated' | 'rejected' }) {
  const labels = {
    waiting: 'Waiting for validation',
    validated: 'Validated',
    rejected: 'Rejected',
  };
  const styles = {
    waiting: 'border-orange-400 text-orange-700 bg-orange-50',
    validated: 'border-green-400 text-green-700 bg-green-50',
    rejected: 'border-red-400 text-red-700 bg-red-50',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border shrink-0 ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
