import { useMemo, useState } from 'react';

interface SupplierRow {
  id: string;
  name: string;
  code: string;
  department: string;
  partner: string;
  partnerCode: string;
  referencesCount: number;
  logisticFlows: string[];
  ongoingChange: boolean;
  pricingZone: 'National' | 'Multi Zone' | 'Group of sites';
}

const SUPPLIERS: SupplierRow[] = [
  { id: '1', name: 'ROCA SANITARIO SA - Stores', code: '224455', department: '1 - Materiales de construcci…', partner: 'ROCA SANITARIO SA', partnerCode: '99988', referencesCount: 128, logisticFlows: ['Direct', 'Ship from partner'], ongoingChange: true, pricingZone: 'National' },
  { id: '2', name: 'ROCA SANITARIO SA - Warehouses', code: '97867', department: '1 - Materiales de construcci…', partner: 'ROCA SANITARIO SA', partnerCode: '99988', referencesCount: 84, logisticFlows: ['Stock'], ongoingChange: false, pricingZone: 'National' },
  { id: '3', name: 'GRUPO PUMA PEQ FORMATO', code: '41111', department: '1 - Materiales de construccion', partner: 'GRUPO PUMA ESPAÑA S.L.', partnerCode: '204304', referencesCount: 42, logisticFlows: ['Direct'], ongoingChange: false, pricingZone: 'Multi Zone' },
  { id: '4', name: 'Henkel Iberica S.A.', code: '58764', department: '1 - Materiales de construccion', partner: 'Henkel Iberica', partnerCode: '765456', referencesCount: 56, logisticFlows: ['Direct', 'Stock'], ongoingChange: false, pricingZone: 'National' },
  { id: '5', name: '3M ESPANA S.L.', code: '11223', department: '6 - Ceramica', partner: '3M ESPANA', partnerCode: '76808', referencesCount: 23, logisticFlows: ['Ship from partner'], ongoingChange: true, pricingZone: 'Group of sites' },
];

interface Props {
  onSupplierClick: (supplierCode: string) => void;
}

export function SuppliersTab({ onSupplierClick }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return SUPPLIERS;
    const needle = search.toLowerCase();
    return SUPPLIERS.filter(s =>
      s.name.toLowerCase().includes(needle) ||
      s.code.includes(needle) ||
      s.partner.toLowerCase().includes(needle)
    );
  }, [search]);

  return (
    <div className="px-8 pt-6 pb-12 flex-1 overflow-y-auto">
      <div className="max-w-2xl mb-6">
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
        <div className="grid grid-cols-[1.4fr_1.2fr_0.8fr_1.2fr_1fr_1fr] items-center bg-white border-b border-[#EEEEEE] px-4">
          <ColumnHeader label="COMMERCIAL SUPPLIER" sublabel="id code / departement" />
          <ColumnHeader label="PARTNER" sublabel="id code" />
          <ColumnHeader label="REFERENCES" />
          <ColumnHeader label="LOGISTIC FLOWS" />
          <ColumnHeader label="ONGOING CHANGE" />
          <ColumnHeader label="PRICING ZONE" />
        </div>

        {filtered.map(s => (
          <button
            key={s.id}
            onClick={() => onSupplierClick(s.code)}
            className="grid grid-cols-[1.4fr_1.2fr_0.8fr_1.2fr_1fr_1fr] items-center text-left px-4 py-3 border-b border-[#EEEEEE] last:border-b-0 hover:bg-[#F9F9F9] w-full"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#007F8C] truncate">{s.name}</p>
              <p className="text-xs text-[#666666] truncate">{s.code} / {s.department}</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#333333] truncate">{s.partner}</p>
              <p className="text-xs text-[#666666]">{s.partnerCode}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-[#333333]">{s.referencesCount}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {s.logisticFlows.map(f => (
                <span key={f} className="inline-flex items-center px-2 py-0.5 bg-[#D9F0F3] text-[#005C66] text-xs rounded">
                  {f}
                </span>
              ))}
            </div>
            <div>
              {s.ongoingChange ? (
                <span className="inline-flex items-center gap-1 text-xs text-[#D97706] font-semibold">
                  <span className="w-2 h-2 bg-[#D97706] rounded-full" />
                  Yes
                </span>
              ) : (
                <span className="text-xs text-[#666666]">—</span>
              )}
            </div>
            <div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${
                s.pricingZone === 'National'
                  ? 'bg-[#DAEFF7] text-[#005C91] border-[#0B96CC]'
                  : s.pricingZone === 'Multi Zone'
                  ? 'bg-[#D9F0F3] text-[#005C66] border-[#007F8C]'
                  : 'bg-[#F5F5F5] text-[#666666] border-[#CCCCCC]'
              }`}>
                {s.pricingZone}
              </span>
            </div>
          </button>
        ))}

        <div className="flex items-center justify-between px-4 py-3 border-t border-[#EEEEEE] bg-white">
          <div className="flex items-center gap-2 text-sm text-[#333333]">
            <span>Suppliers per page</span>
            <select className="h-8 px-2 border border-[#CCCCCC] rounded text-sm bg-white">
              <option>10</option>
              <option>25</option>
            </select>
            <span className="ml-3 text-[#666666]">1-{filtered.length} of 9999 items</span>
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
    </div>
  );
}

function ColumnHeader({ label, sublabel }: { label: string; sublabel?: string }) {
  return (
    <div className="py-3 flex items-center gap-1">
      <div>
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
