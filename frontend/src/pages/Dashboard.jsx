import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Receipt,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { user, company } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/expenses/statistics');
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Expenses',
      value: stats?.total || 0,
      icon: Receipt,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Pending',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50'
    },
    {
      label: 'Approved',
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Rejected',
      value: stats?.rejected || 0,
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    }
  ];

  const categoryData = stats?.byCategory?.map((c, i) => ({
    name: c.category?.name || 'Unknown',
    value: parseInt(c.count) || 0,
    color: COLORS[i % COLORS.length]
  })) || [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: stats?.currency || company?.currencyCode || 'USD'
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600 mt-1">
            Welcome back, {user?.firstName}! Here's your expense overview.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center gap-4">
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-sm text-secondary-500">{stat.label}</p>
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-900">Amount Overview</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-secondary-400" />
                <span className="text-secondary-600">Total Amount</span>
              </div>
              <span className="text-lg font-semibold text-secondary-900">
                {formatCurrency(stats?.totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-secondary-600">Pending Amount</span>
              </div>
              <span className="text-lg font-semibold text-amber-700">
                {formatCurrency(stats?.pendingAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-900">By Category</h2>
          </div>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {categoryData.slice(0, 5).map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm text-secondary-600 flex-1">{cat.name}</span>
                    <span className="text-sm font-medium text-secondary-900">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-500">
              No expense data yet
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-secondary-900">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/expenses/new"
          className="card p-5 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
              <PlusCircle className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-secondary-900">Submit Expense</p>
              <p className="text-sm text-secondary-500">Create a new expense claim</p>
            </div>
            <ArrowRight className="w-5 h-5 text-secondary-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/expenses"
          className="card p-5 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <Receipt className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-secondary-900">View Expenses</p>
              <p className="text-sm text-secondary-500">Check expense history</p>
            </div>
            <ArrowRight className="w-5 h-5 text-secondary-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {user?.role !== 'employee' && (
          <Link
            to="/approvals"
            className="card p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                <CheckCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-secondary-900">Pending Approvals</p>
                <p className="text-sm text-secondary-500">Review team expenses</p>
              </div>
              <ArrowRight className="w-5 h-5 text-secondary-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
