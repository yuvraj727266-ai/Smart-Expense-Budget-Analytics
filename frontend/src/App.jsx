import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TransactionModal from './components/TransactionModal';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import CategoriesPage from './pages/CategoriesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InsightsPage from './pages/InsightsPage';
import ReportsPage from './pages/ReportsPage';
import ProjectDocsPage from './pages/ProjectDocsPage';
import EducationalPage from './pages/EducationalPage';
import SettingsPage from './pages/SettingsPage';
import { apiService } from './services/api';
import { getCurrentMonthStr } from './utils/formatters';
import './App.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [categories, setCategories] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Transaction Modal State
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await apiService.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setTxModalOpen(true);
  };

  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    setTxModalOpen(true);
  };

  const handleTransactionSaved = () => {
    triggerRefresh();
    fetchCategories();
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 bg-mesh-gradient flex font-sans antialiased">
        {/* Persistent Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            selectedMonth={selectedMonth}
            onChangeMonth={setSelectedMonth}
            onOpenAddModal={handleOpenAddModal}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardPage
                    selectedMonth={selectedMonth}
                    onOpenAddModal={handleOpenAddModal}
                    refreshTrigger={refreshTrigger}
                  />
                }
              />
              <Route
                path="/transactions"
                element={
                  <TransactionsPage
                    categories={categories}
                    onOpenAddModal={handleOpenAddModal}
                    onOpenEditModal={handleOpenEditModal}
                    refreshTrigger={refreshTrigger}
                  />
                }
              />
              <Route
                path="/budgets"
                element={
                  <BudgetsPage
                    selectedMonth={selectedMonth}
                    categories={categories}
                    refreshTrigger={refreshTrigger}
                  />
                }
              />
              <Route
                path="/categories"
                element={
                  <CategoriesPage
                    categories={categories}
                    onRefreshCategories={fetchCategories}
                  />
                }
              />
              <Route
                path="/analytics"
                element={<AnalyticsPage selectedMonth={selectedMonth} />}
              />
              <Route
                path="/insights"
                element={<InsightsPage selectedMonth={selectedMonth} />}
              />
              <Route
                path="/reports"
                element={<ReportsPage selectedMonth={selectedMonth} />}
              />
              <Route path="/docs" element={<ProjectDocsPage />} />
              <Route path="/educational" element={<EducationalPage />} />
              <Route
                path="/settings"
                element={<SettingsPage onDataMutated={triggerRefresh} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Global Transaction Modal */}
        <TransactionModal
          isOpen={txModalOpen}
          onClose={() => setTxModalOpen(false)}
          onSaved={handleTransactionSaved}
          transaction={editingTransaction}
          categories={categories}
        />
      </div>
    </BrowserRouter>
  );
}
