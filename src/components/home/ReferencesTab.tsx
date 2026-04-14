import { useMemo, useState } from 'react';

interface ReferenceRow {
  id: string;
  designation: string;
  code: string;
  supplier: string;
  supplierCode: string;
  supplierDept: string;
  partner: string;
  partnerCode: string;
  gtin: string;
  logisticFlow: string;
  incoterm: string;
  ongoingChange?: boolean;
}

const ALL_REFERENCES: ReferenceRow[] = [
  { id: '1', designation: 'Descargador electronico doble roca univer…', code: '11712011', supplier: 'ROCA SANITARIO SA - Stores', supplierCode: '224455', supplierDept: '1 - Materiales de construcci…', partner: 'ROCA SANITARIO SA', partnerCode: '99988', gtin: '1234567890987', logisticFlow: 'Direct', incoterm: 'DDP' },
  { id: '2', designation: 'Descargador electronico doble roca univer…', code: '11712011', supplier: 'ROCA SANITARIO SA - Stores', supplierCode: '224455', supplierDept: '1 - Materiales de construcci…', partner: 'ROCA SANITARIO SA', partnerCode: '99988', gtin: '1112223334445', logisticFlow: 'Ship from partner', incoterm: 'DDP' },
  { id: '3', designation: 'Descargador electronico doble roca univer…', code: '11712011', supplier: 'ROCA SANITARIO SA - Wareh…', supplierCode: '97867', supplierDept: '1 - Materiales de construcci…', partner: 'ROCA SANITARIO SA', partnerCode: '99988', gtin: '9876543212345', logisticFlow: 'Stock', incoterm: 'EXW', ongoingChange: true },
  { id: '4', designation: 'Descargador electronico doble roca univer…', code: '11712011', supplier: 'GRUPO PUMA PEQ FORMATO', supplierCode: '41111', supplierDept: '1 - Materiales de construccion', partner: 'GRUPO PUMA ESPAÑA S.L.', partnerCode: '204304', gtin: '5555566666777', logisticFlow: 'Direct', incoterm: 'DDP' },
  { id: '5', designation: 'Mortero cola AXTON flexible gel BL 25kg', code: '81948529', supplier: 'ROCA SANITARIO SA - Stores', supplierCode: '224455', supplierDept: '1 - Materiales de construcci…', partner: 'ROCA SANITARIO SA', partnerCode: '99988', gtin: '1231231231232', logisticFlow: 'Direct', incoterm: 'DDP' },
  { id: '6', designation: 'Mortero cola AXTON flexible gel BL 25kg', code: '81948529', supplier: 'ROCA SANITARIO SA - Wareh…', supplierCode: '97867', supplierDept: '1 - Materiales de construcci…', partner: 'ROCA SANITARIO SA', partnerCode: '99988', gtin: '4564345796324', logisticFlow: 'Stock', incoterm: 'EXW' },
  { id: '7', designation: 'Mortero cola AXTON flexible gel BL 25kg', code: '81948529', supplier: 'GRUPO PUMA PEQ FORMATO', supplierCode: '41111', supplierDept: '1 - Materiales de construccion', partner: 'GRUPO PUMA ESPAÑA S.L.', partnerCode: '204304', gtin: '0856678876546', logisticFlow: 'Direct', incoterm: 'DDP' },
];

interface Props {
  initialSupplier?: string | null;
}

export function ReferencesTab({ initialSupplier }: Props) {
  const [codesFilter, setCodesFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState(initialSupplier ?? '');
  const [logisticFilter, setLogisticFilter] = useState('All');
  const [selectedBreadcrumb, setSelectedBreadcrumb] = useState<'construccion' | 'ceramica'>('construccion');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let rows = ALL_REFERENCES;
    if (codesFilter.trim()) {
      const needle = codesFilter.toLowerCase();
      rows = rows.filter(r => r.code.includes(needle) || r.designation.toLowerCase().includes(needle));
    }
    if (supplierFilter.trim()) {
      const needle = supplierFilter.toLowerCase();
      rows = rows.filter(r => r.supplier.toLowerCase().includes(needle) || r.supplierCode.includes(needle));
    }
    if (logisticFilter !== 'All') {
      rows = rows.filter(r => r.logisticFlow === logisticFilter);
    }
    return rows;
  }, [codesFilter, supplierFilter, logisticFilter]);

  const hasSupplierFilter = supplierFilter.trim().length > 0;
  const showEmpty = filtered.length === 0;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="px-8 pt-6 pb-12 flex-1 overflow-y-auto">
      {/* Breadcrumb pills */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setSelectedBreadcrumb('construccion')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
            selectedBreadcrumb === 'construccion'
              ? 'bg-[#007F8C] text-white border-[#007F8C]'
              : 'bg-white text-[#333333] border-[#CCCCCC]'
          }`}
        >
          1 - Materiales de construccion
        </button>
        <button
          onClick={() => setSelectedBreadcrumb('ceramica')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
            selectedBreadcrumb === 'ceramica'
              ? 'bg-[#007F8C] text-white border-[#007F8C]'
              : 'bg-white text-[#333333] border-[#CCCCCC]'
          }`}
        >
          6 - Ceramica
        </button>
      </div>

      {/* Filters row */}
      <h2 className="text-base font-bold text-[#333333] mb-3">Filter references</h2>
      <div className={`grid gap-4 mb-4 ${hasSupplierFilter ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
        <div>
          <SearchInput
            value={codesFilter}
            onChange={setCodesFilter}
            placeholder="Copy/paste codes or designations from csv or xls"
          />
        </div>
        <div>
          <label className="block text-sm text-[#666666] mb-1.5">Commercial supplier(s)</label>
          <SearchInput
            value={supplierFilter}
            onChange={setSupplierFilter}
            placeholder="Search for a commercial supplier name or id code"
          />
        </div>
        {hasSupplierFilter && (
          <div>
            <label className="block text-sm text-[#666666] mb-1.5">Logistic flows</label>
            <div className="relative">
              <select
                value={logisticFilter}
                onChange={(e) => setLogisticFilter(e.target.value)}
                className="w-full h-12 px-3 pr-9 border border-[#666666] rounded text-sm text-[#333333] bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#007F8C]"
              >
                <option value="All">All</option>
                <option value="Direct">Direct</option>
                <option value="Stock">Stock</option>
                <option value="Ship from partner">Ship from partner</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}>
        {/* Header */}
        <div className="grid grid-cols-[40px_1.3fr_1.4fr_1fr_1fr_1fr] items-center bg-white border-b border-[#EEEEEE] px-4">
          <div>
            <input type="checkbox" className="accent-[#007F8C]" />
          </div>
          <ColumnHeader label="DESIGNATION" sublabel="code" />
          <ColumnHeader label="COMMERCIAL SUPPLIER" sublabel="id code / departement" />
          <ColumnHeader label="PARTNER" sublabel="id code" />
          <ColumnHeader label={hasSupplierFilter ? 'GTIN' : 'CIRCUIT'} sublabel={hasSupplierFilter ? '' : 'incoterm'} />
          <ColumnHeader label={hasSupplierFilter ? 'LOGISTIC FLOW' : 'ZONE'} sublabel={hasSupplierFilter ? 'number of sites' : 'number of sites'} />
        </div>

        {showEmpty ? (
          <div className="bg-[#EBEAF4] py-20 flex flex-col items-center justify-center">
            <p className="text-[#2F1D78] font-bold text-base mb-1">There is no result</p>
            <p className="text-[#2F1D78] text-sm mb-4">Please try changing your filters</p>
            <button
              onClick={() => { setCodesFilter(''); setSupplierFilter(''); setLogisticFilter('All'); }}
              className="flex items-center gap-2 bg-white border border-[#CCCCCC] rounded px-4 py-2 text-sm font-bold text-[#333333] hover:bg-[#F5F5F5]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Change filters
            </button>
          </div>
        ) : (
          <>
            {filtered.map(row => (
              <div
                key={row.id}
                className="grid grid-cols-[40px_1.3fr_1.4fr_1fr_1fr_1fr] items-center px-4 py-3 border-b border-[#EEEEEE] last:border-b-0 hover:bg-[#F9F9F9]"
              >
                <div>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    disabled={row.ongoingChange}
                    className="accent-[#007F8C]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[#333333] truncate" title={row.designation}>{row.designation}</p>
                  <p className="text-xs text-[#666666]">{row.code}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[#333333] truncate">{row.supplier}</p>
                  <p className="text-xs text-[#666666] truncate">{row.supplierCode} / {row.supplierDept}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[#333333] truncate">{row.partner}</p>
                  <p className="text-xs text-[#666666]">{row.partnerCode}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[#333333]">{row.gtin}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[#333333]">{row.logisticFlow}</p>
                  <p className="text-xs text-[#666666]">{row.incoterm}</p>
                </div>
              </div>
            ))}
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#EEEEEE] bg-white">
              <div className="flex items-center gap-2 text-sm text-[#333333]">
                <span>Rows per page</span>
                <select className="h-8 px-2 border border-[#CCCCCC] rounded text-sm bg-white">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="ml-3 text-[#666666]">{filtered.length} of 256 items</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 bg-[#333333] text-white rounded flex items-center justify-center disabled:opacity-40" disabled>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center gap-1 border border-[#CCCCCC] rounded px-2 h-8 bg-white">
                  <span className="text-sm text-[#333333]">Page 1 of 26</span>
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
          </>
        )}
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

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 pl-10 pr-3 border border-[#666666] rounded text-sm text-[#333333] placeholder:text-[#999999] bg-white focus:outline-none focus:ring-2 focus:ring-[#007F8C]"
      />
    </div>
  );
}
