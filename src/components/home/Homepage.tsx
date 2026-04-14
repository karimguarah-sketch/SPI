import { useState } from 'react';
import { PageHeader } from '../layout/PageHeader';
import { ReferencesTab } from './ReferencesTab';
import { SuppliersTab } from './SuppliersTab';
import { NegotiationZonesTab } from './NegotiationZonesTab';
import { ActivityTab } from './ActivityTab';

interface HomepageProps {
  onStartBulkEdition: () => void;
}

export function Homepage({ onStartBulkEdition }: HomepageProps) {
  const [activeTab, setActiveTab] = useState('Activity');
  const [supplierFilter, setSupplierFilter] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'References') setSupplierFilter(null);
  };

  const handleSupplierClick = (code: string) => {
    setSupplierFilter(code);
    setActiveTab('References');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F5F5F5]">
      <PageHeader
        title="Purchase conditions"
        showTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {activeTab === 'Activity' && <ActivityTab onStartBulkEdition={onStartBulkEdition} />}
      {activeTab === 'References' && <ReferencesTab initialSupplier={supplierFilter} />}
      {activeTab === 'Suppliers' && <SuppliersTab onSupplierClick={handleSupplierClick} />}
      {activeTab === 'Negotiation zones' && <NegotiationZonesTab />}
    </div>
  );
}
