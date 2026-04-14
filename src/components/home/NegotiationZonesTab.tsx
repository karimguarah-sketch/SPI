import { useMemo, useState } from 'react';
import type { ActivityItem } from './ActivityTab';

type Zone = 'National' | 'Multi Zone' | 'Group of sites';

interface NegoRow {
  id: string;
  supplierName: string;
  supplierCode: string;
  partnerName: string;
  partnerCode: string;
  zone: Zone;
}

const INITIAL_ROWS: NegoRow[] = [
  { id: '1', supplierName: '3M ESPANA S.L.', supplierCode: '11223', partnerName: '3M ESPANA', partnerCode: '76808', zone: 'National' },
  { id: '2', supplierName: '3M ESPANA S11 S.L', supplierCode: '11224', partnerName: '3M ESPANA', partnerCode: '76808', zone: 'National' },
  { id: '3', supplierName: 'Actis SA TR', supplierCode: '9876', partnerName: 'Actis SA', partnerCode: '33344', zone: 'Group of sites' },
  { id: '4', supplierName: 'Grohe España Sanitario', supplierCode: '224455', partnerName: 'Grohe España', partnerCode: '989898', zone: 'National' },
  { id: '5', supplierName: 'Henkel Iberica, S.A.', supplierCode: '58764', partnerName: 'Henkel Iberica', partnerCode: '765456', zone: 'National' },
  { id: '6', supplierName: 'ROCA SANITARIO SA - Stores', supplierCode: '224455', partnerName: 'Roca', partnerCode: '232323', zone: 'National' },
  { id: '7', supplierName: 'ROCA SANITARIO SA - Warehouses', supplierCode: '999888', partnerName: 'Roca', partnerCode: '232323', zone: 'Multi Zone' },
  { id: '8', supplierName: 'Text', supplierCode: 'Text', partnerName: 'Herramienta', partnerCode: '4', zone: 'Multi Zone' },
];

interface Props {
  onSave: (item: ActivityItem) => void;
}

export function NegotiationZonesTab({ onSave }: Props) {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [pendingChanges, setPendingChanges] = useState<Record<string, Zone>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const needle = search.toLowerCase();
    return rows.filter(r =>
      r.supplierName.toLowerCase().includes(needle) ||
      r.supplierCode.includes(needle)
    );
  }, [rows, search]);

  const setZone = (id: string, zone: Zone) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, zone } : r));
    setPendingChanges(prev => {
      const original = INITIAL_ROWS.find(r => r.id === id);
      const next = { ...prev };
      if (original && original.zone === zone) delete next[id];
      else next[id] = zone;
      return next;
    });
  };

  const changedCount = Object.keys(pendingChanges).length;

  const handleSave = () => {
    if (changedCount === 0) return;
    const firstId = Object.keys(pendingChanges)[0];
    const firstRow = rows.find(r => r.id === firstId);
    const today = new Date();
    const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    const activation = new Date(today);
    activation.setDate(today.getDate() + 14);
    const item: ActivityItem = {
      id: `nz-${Date.now()}`,
      status: 'waiting',
      activationDate: fmt(activation),
      requestDate: fmt(today),
      requestId: `REQ-${Math.floor(20000000 + Math.random() * 9999999)}`,
      referencesCount: changedCount,
      supplier: firstRow ? `${firstRow.supplierName} (${firstRow.supplierCode})` : 'Multiple suppliers',
      supplierZone: firstRow ? pendingChanges[firstRow.id] : undefined,
      circuit: 'Negotiation zone',
      warehouses: `${changedCount} supplier${changedCount > 1 ? 's' : ''} updated`,
    };
    onSave(item);
    setConfirmed(true);
    setPendingChanges({});
  };

  return (
    <div className="px-8 pt-6 pb-12 flex-1 overflow-y-auto">
      <div className="max-w-xl mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by supplier name or id"
            className="w-full h-12 pl-10 pr-3 border border-[#666666] rounded text-sm text-[#333333] placeholder:text-[#999999] bg-white focus:outline-none focus:ring-2 focus:ring-[#007F8C]"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden" style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}>
        <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_1fr] items-center bg-white border-b border-[#EEEEEE] px-4">
          <ColumnHeader label="COMMERCIAL SUPPLIER" sublabel="id code" />
          <ColumnHeader label="PARTNER" sublabel="id code" />
          <ColumnHeader label="NATIONAL" center />
          <ColumnHeader label="MULTI ZONE" center />
          <ColumnHeader label="GROUP OF SITES" center />
        </div>

        {filtered.map(r => (
          <div
            key={r.id}
            className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_1fr] items-center px-4 py-3 border-b border-[#EEEEEE] last:border-b-0 hover:bg-[#F9F9F9]"
          >
            <div className="min-w-0">
              <p className="text-sm text-[#333333] truncate">{r.supplierName}</p>
              <p className="text-xs text-[#666666]">{r.supplierCode}</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#333333] truncate">{r.partnerName}</p>
              <p className="text-xs text-[#666666]">{r.partnerCode}</p>
            </div>
            <RadioCell checked={r.zone === 'National'} onChange={() => setZone(r.id, 'National')} />
            <RadioCell checked={r.zone === 'Multi Zone'} onChange={() => setZone(r.id, 'Multi Zone')} />
            <RadioCell checked={r.zone === 'Group of sites'} onChange={() => setZone(r.id, 'Group of sites')} />
          </div>
        ))}

        <div className="flex items-center justify-between px-4 py-3 border-t border-[#EEEEEE] bg-white">
          <div className="flex items-center gap-2 text-sm text-[#333333]">
            <span>Suppliers per page</span>
            <select className="h-8 px-2 border border-[#CCCCCC] rounded text-sm bg-white">
              <option>10</option>
              <option>25</option>
            </select>
            <span className="ml-3 text-[#666666]">1-999 of 9999 items</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 bg-[#333333] text-white rounded flex items-center justify-center disabled:opacity-40" disabled>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-1 border border-[#CCCCCC] rounded px-2 h-8 bg-white">
              <span className="text-sm text-[#333333]">Page 1 of 99</span>
              <svg className="w-3 h-3 text-[#666666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button className="w-8 h-8 bg-[#333333] text-white rounded flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Save modification CTA */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-[#666666]">
          {changedCount > 0
            ? `${changedCount} pending change${changedCount > 1 ? 's' : ''}`
            : confirmed
              ? 'Request created — see the Activity tab.'
              : 'No changes yet.'}
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={changedCount === 0}
          className="px-5 py-2.5 bg-[#007F8C] text-white rounded text-sm font-bold hover:bg-[#005C66] transition-colors disabled:bg-[#CCCCCC] disabled:text-[#666666] disabled:cursor-not-allowed"
        >
          Save modification
        </button>
      </div>

      {/* Confirm save modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[#333333] mb-2">Confirm change</h3>
            <p className="text-sm text-[#666666] mb-6">
              Are you sure you want to confirm {changedCount === 1 ? 'this change' : `these ${changedCount} changes`}? A new request will be created.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2.5 bg-white border border-[#CCCCCC] rounded text-sm font-bold text-[#333333] hover:bg-[#F5F5F5] transition-colors"
              >
                No
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleSave();
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

function RadioCell({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-center">
      <button
        onClick={onChange}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          checked ? 'border-[#007F8C] bg-[#007F8C]' : 'border-[#CCCCCC] bg-white hover:border-[#007F8C]'
        }`}
        aria-pressed={checked}
      >
        {checked && <span className="w-2 h-2 bg-white rounded-full" />}
      </button>
    </div>
  );
}

function ColumnHeader({ label, sublabel, center }: { label: string; sublabel?: string; center?: boolean }) {
  return (
    <div className={`py-3 flex items-center gap-1 ${center ? 'justify-center' : ''}`}>
      <div className={center ? 'text-center' : ''}>
        <p className="text-xs font-bold text-[#333333] uppercase tracking-wide">{label}</p>
        {sublabel && <p className="text-xs text-[#666666] normal-case">{sublabel}</p>}
      </div>
      <div className="flex flex-col text-[#999999] ml-1">
        <svg className="w-3 h-3 -mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8l-6 6h12z" /></svg>
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l6-6H6z" /></svg>
      </div>
    </div>
  );
}
