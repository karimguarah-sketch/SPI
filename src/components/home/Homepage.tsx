import { useState } from 'react';
import { PageHeader } from '../layout/PageHeader';

interface HomepageProps {
  onStartBulkEdition: () => void;
}

interface ActivityItem {
  id: string;
  status: 'waiting' | 'validated' | 'rejected';
  activationDate: string;
  requestDate: string;
  requestAuthor: string;
  referencesCount: number;
  referencesPreview: string;
  supplier?: string;
  supplierZone?: string;
  circuit?: string;
  warehouses?: string;
}

const FUTURE_CHANGES: ActivityItem[] = [
  {
    id: 'c1',
    status: 'waiting',
    activationDate: '18/3/2026',
    requestDate: '22/3/2026',
    requestAuthor: '20025420',
    referencesCount: 42,
    referencesPreview: '11712011: Descargador ROCA doble pulsador ; 22712022: Descargador cable ROCA doble pulsador',
  },
  {
    id: 'c2',
    status: 'waiting',
    activationDate: '18/3/2026',
    requestDate: '22/3/2026',
    requestAuthor: '20025420',
    referencesCount: 444,
    referencesPreview: '',
    supplier: 'ROCA SANITARIO TR (345657)',
    supplierZone: 'National',
    circuit: 'Direct - DDP',
    warehouses: '112 warehouses',
  },
  {
    id: 'c3',
    status: 'waiting',
    activationDate: '24/3/2026',
    requestDate: '01/4/2026',
    requestAuthor: '20025420',
    referencesCount: 27,
    referencesPreview: '33712033: Aquafresh 3 triple action ; 44712044: Colonne thermostatique',
  },
];

export function Homepage({ onStartBulkEdition }: HomepageProps) {
  const [activeTab, setActiveTab] = useState<'future' | 'past'>('future');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Purchase conditions" showTabs activeTab="Activity" />

      <div className="flex-1 overflow-y-auto px-8 pt-8 pb-12">
        {/* Quick actions */}
        <section className="mb-8 max-w-3xl">
          <h2 className="text-base font-bold text-gray-900 mb-1">Quick actions</h2>
          <p className="text-sm text-gray-500 mb-4">Switch supplier - Logistic flow - Site affectation</p>

          <button
            onClick={onStartBulkEdition}
            className="w-full max-w-md bg-white border-2 border-[#0a8f8f] rounded-lg p-5 flex items-center gap-4 hover:bg-[#f0f9f9] transition-colors text-left group"
          >
            <svg className="w-6 h-6 text-[#0a8f8f] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <div className="flex-1">
              <p className="text-base font-bold text-[#0a8f8f]">Bulk edition</p>
              <p className="text-sm text-gray-500 mt-0.5">Use a spreadsheet to edit purchase condition</p>
            </div>
            <svg className="w-5 h-5 text-[#0a8f8f] shrink-0 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </section>

        {/* Activity */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">Activity</h2>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center justify-between px-6 pt-4 border-b border-gray-200">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('future')}
                  className={`pb-3 text-sm font-semibold transition-colors relative ${
                    activeTab === 'future' ? 'text-[#0a8f8f]' : 'text-gray-500'
                  }`}
                >
                  Future changes
                  {activeTab === 'future' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0a8f8f]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`pb-3 text-sm font-semibold transition-colors relative ${
                    activeTab === 'past' ? 'text-[#0a8f8f]' : 'text-gray-500'
                  }`}
                >
                  Past changes
                  {activeTab === 'past' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0a8f8f]" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 pb-2">
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                  Sort by <strong>Activation date</strong>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50" aria-label="Info">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Items */}
            <div>
              {activeTab === 'future' ? (
                FUTURE_CHANGES.map(item => (
                  <ActivityCard
                    key={item.id}
                    item={item}
                    expanded={expandedIds.has(item.id)}
                    onToggle={() => toggleExpand(item.id)}
                  />
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No past changes yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ActivityCard({
  item,
  expanded,
  onToggle,
}: {
  item: ActivityItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0 px-6 py-5">
      <div className="flex items-center gap-6 mb-3 flex-wrap">
        <StatusBadge status={item.status} />
        <InfoItem label="Activation date" value={item.activationDate} />
        <InfoItem label="Request date" value={item.requestDate} />
        <InfoItem label="Request author" value={item.requestAuthor} />
      </div>

      {/* References preview row */}
      {item.referencesPreview ? (
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#e8f4f4] rounded-md px-4 py-3 flex items-center gap-3 min-w-0">
            <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="font-semibold text-gray-800 text-sm shrink-0">{item.referencesCount}</span>
            <span className="text-xs font-medium text-gray-600 shrink-0">References</span>
            <span className="text-sm text-gray-700 truncate">{item.referencesPreview}</span>
          </div>
          <button className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors" aria-label="Delete">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={onToggle}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Expand"
          >
            <svg
              className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-stretch">
          <div className="bg-[#e8f4f4] rounded-md px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="font-semibold text-gray-800 text-sm">{item.referencesCount}</span>
            <span className="text-xs font-medium text-gray-600">References</span>
          </div>
          {item.supplier && (
            <div className="bg-[#e8f4f4] rounded-md px-4 py-3 flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm text-gray-800 truncate">{item.supplier}</span>
              {item.supplierZone && (
                <span className="text-[11px] font-medium text-[#0a8f8f] border border-[#0a8f8f] rounded px-1.5 py-0.5 shrink-0">
                  {item.supplierZone}
                </span>
              )}
            </div>
          )}
          {item.circuit && (
            <div className="bg-[#e8f4f4] rounded-md px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <span className="text-sm text-gray-800">{item.circuit}</span>
            </div>
          )}
          {item.warehouses && (
            <div className="bg-[#e8f4f4] rounded-md px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V7l9-4 9 4v14M9 21V12h6v9" />
              </svg>
              <span className="text-sm text-gray-800">{item.warehouses}</span>
            </div>
          )}
          <button className="px-2 self-center text-gray-500" aria-label="Options">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>
        </div>
      )}

      {expanded && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
          Plus de détails sur cette modification à venir...
        </div>
      )}
    </div>
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
