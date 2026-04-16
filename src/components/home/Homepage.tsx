import { useState, useEffect } from 'react';
import { PageHeader } from '../layout/PageHeader';
import { ReferencesTab } from './ReferencesTab';
import { SuppliersTab } from './SuppliersTab';
import { NegotiationZonesTab } from './NegotiationZonesTab';
import { ActivityTab, ActivityItem, INITIAL_FUTURE_CHANGES } from './ActivityTab';

interface HomepageProps {
  onStartBulkEdition: () => void;
  showToast?: boolean;
  onToastDismiss?: () => void;
}

export function Homepage({ onStartBulkEdition, showToast, onToastDismiss }: HomepageProps) {
  const [activeTab, setActiveTab] = useState('Activity');
  const [supplierFilter, setSupplierFilter] = useState<string | null>(null);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>(INITIAL_FUTURE_CHANGES);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'References') setSupplierFilter(null);
  };

  const handleSupplierClick = (code: string) => {
    setSupplierFilter(code);
    setActiveTab('References');
  };

  const handleAddActivity = (item: ActivityItem) => {
    setActivityItems(prev => [item, ...prev]);
  };

  const handleDeleteActivity = (id: string) => {
    setActivityItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F5F5]">
      <PageHeader
        title="Purchase conditions"
        showTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {activeTab === 'Activity' && (
        <ActivityTab
          onStartBulkEdition={onStartBulkEdition}
          items={activityItems}
          onDeleteItem={handleDeleteActivity}
        />
      )}
      {activeTab === 'References' && <ReferencesTab initialSupplier={supplierFilter} />}
      {activeTab === 'Suppliers' && <SuppliersTab onSupplierClick={handleSupplierClick} />}
      {activeTab === 'Negotiation zones' && (
        <NegotiationZonesTab
          onSave={(item) => {
            handleAddActivity(item);
            setActiveTab('Activity');
          }}
        />
      )}

      {/* Toast — fixed bottom-right */}
      {showToast && (
        <SuccessToast onDismiss={onToastDismiss ?? (() => {})} />
      )}
    </div>
  );
}

function SuccessToast({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-green-200 rounded-lg px-4 py-3" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-sm text-[#333333] font-medium">Import successful, the request was created</span>
    </div>
  );
}
