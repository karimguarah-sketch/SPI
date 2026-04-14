import { useState } from 'react';
import { PageHeader } from '../layout/PageHeader';
import { ReferencesTab } from './ReferencesTab';
import { SuppliersTab } from './SuppliersTab';
import { NegotiationZonesTab } from './NegotiationZonesTab';
import { ActivityTab, ActivityItem, INITIAL_FUTURE_CHANGES } from './ActivityTab';

interface HomepageProps {
  onStartBulkEdition: () => void;
}

export function Homepage({ onStartBulkEdition }: HomepageProps) {
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
    </div>
  );
}
