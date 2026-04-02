import React from 'react';
import { Sidebar } from './Sidebar';
import { useStore } from '../../store';
import { ReferencesPage } from '../references/ReferencesPage';
import { SuppliersPage } from '../suppliers/SuppliersPage';
import { GrappesPage } from '../grappes/GrappesPage';
import { RecapPage } from '../recap/RecapPage';

export function AppShell() {
  const { state } = useStore();
  const { currentPage } = state.ui;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        {currentPage === 'references' && <ReferencesPage />}
        {currentPage === 'suppliers' && <SuppliersPage />}
        {currentPage === 'grappes' && <GrappesPage />}
        {currentPage === 'recap' && <RecapPage />}
      </main>
    </div>
  );
}
