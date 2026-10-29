import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const apiService = {
  // Health
  checkHealth: () => api.get('/health'),

  // Transactions
  getTransactions: (params = {}) => api.get('/transactions', { params }),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  createTransaction: (data) => api.post('/transactions', data),
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),

  // Categories
  getCategories: (params = {}) => api.get('/categories', { params }),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id, reassignTo = null) => {
    const params = reassignTo ? { reassign_to: reassignTo } : {};
    return api.delete(`/categories/${id}`, { params });
  },

  // Budgets
  getBudgets: (monthYear) => api.get('/budgets', { params: { month_year: monthYear } }),
  createBudget: (data) => api.post('/budgets', data),
  updateBudget: (id, data) => api.put(`/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`),

  // Analytics
  getDashboardSummary: (monthYear) => api.get('/analytics/dashboard', { params: { month_year: monthYear } }),
  getMonthlyComparison: (months = 6) => api.get('/analytics/monthly', { params: { months } }),
  getCategoryAnalytics: (monthYear, type = 'expense') => api.get('/analytics/categories', { params: { month_year: monthYear, type } }),
  getTrends: (monthYear) => api.get('/analytics/trends', { params: { month_year: monthYear } }),
  getDistribution: (monthYear) => api.get('/analytics/distribution', { params: { month_year: monthYear } }),
  getInsights: (monthYear) => api.get('/analytics/insights', { params: { month_year: monthYear } }),
  getBudgetPerformance: (monthYear) => api.get('/analytics/budget-performance', { params: { month_year: monthYear } }),
  getMatplotlibChart: (type, monthYear) => api.get('/analytics/charts/matplotlib', { params: { type, month_year: monthYear } }),

  // Reports
  getFinancialStatement: (monthYear) => api.get('/reports/financial-statement', { params: { month_year: monthYear } }),
  getTransactionsCsvUrl: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return `${API_BASE}/reports/transactions.csv?${qs}`;
  },
  getSummaryCsvUrl: () => `${API_BASE}/reports/summary.csv`,
  getCategoriesCsvUrl: (monthYear) => `${API_BASE}/reports/categories.csv?month_year=${monthYear || ''}`,

  // Demo / Settings
  seedSampleData: () => api.post('/demo/seed'),
  clearSampleData: () => api.post('/demo/clear'),
  resetAllData: () => api.post('/demo/reset-all'),
};

export default api;
