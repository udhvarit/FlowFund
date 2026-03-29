import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  PlusCircle,
  Search,
  Filter,
  Eye,
  ChevronDown,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function Expenses() {
  const { user, company } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    categoryId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [expensesRes, categoriesRes] = await Promise.all([
        api.get('/expenses', { params: filters }),
        api.get('/categories')
      ]);
      setExpenses(expensesRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.submitter?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || company?.currencyCode || 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Expenses</h1>
          <p className="text-secondary-600 mt-1">
            {user?.role === 'employee' ? 'Your submitted expenses' : 'All expenses'}
          </p>
        </div>
        <Link
          to="/expenses/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          New Expense
        </Link>
      </div>

      <div className="card">
        <div className="p-4 border-b border-secondary-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                className="px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-secondary-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-secondary-900 truncate">
                          {expense.description || 'No description'}
                        </p>
                        <p className="text-sm text-secondary-500">
                          By {expense.submitter?.firstName} {expense.submitter?.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-secondary-700">
                        {expense.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-secondary-900">
                          {formatCurrency(expense.amountInCompanyCurrency)}
                        </p>
                        {expense.originalCurrency !== company?.currencyCode && (
                          <p className="text-xs text-secondary-500">
                            {formatCurrency(expense.amount, expense.originalCurrency)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary-600">
                      {formatDate(expense.expenseDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(expense.status)}>
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/expenses/${expense.id}`}
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
