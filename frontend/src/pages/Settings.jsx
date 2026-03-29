import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Save, Building, Globe, RefreshCw, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function Settings() {
  const { company } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    currencyCode: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        country: company.country || '',
        currencyCode: company.currencyCode || ''
      });
      setLoading(false);
    }
  }, [company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError('');

    try {
      await api.put('/company', formData);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const refreshCurrencyRates = async () => {
    setRefreshing(true);
    setError('');
    try {
      await api.post('/currencies/refresh', { baseCurrency: formData.currencyCode });
      setMessage({ type: 'success', text: 'Currency rates refreshed!' });
    } catch (err) {
      setError('Failed to refresh currency rates');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
        <p className="text-secondary-600 mt-1">Manage your company settings</p>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-secondary-100">
          <Building className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-secondary-900">Company Information</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Company Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Country
              </div>
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Default Currency
            </label>
            <input
              type="text"
              value={formData.currencyCode}
              onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase"
              maxLength={3}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Changes
          </button>
        </div>
      </form>

      <div className="card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-secondary-100">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-primary-600" />
            <div>
              <h2 className="font-semibold text-secondary-900">Currency Rates</h2>
              <p className="text-sm text-secondary-500">Refresh exchange rates for currency conversion</p>
            </div>
          </div>
          <button
            onClick={refreshCurrencyRates}
            disabled={refreshing}
            className="px-4 py-2 border border-primary-600 text-primary-600 font-medium rounded-lg hover:bg-primary-50 disabled:opacity-50 flex items-center gap-2"
          >
            {refreshing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            Refresh
          </button>
        </div>
        <p className="mt-4 text-sm text-secondary-500">
          Base currency: <span className="font-medium text-secondary-700">{formData.currencyCode}</span>
        </p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-secondary-100">
          <h2 className="font-semibold text-secondary-900">System Information</h2>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-secondary-500">Company ID</span>
            <span className="font-mono text-secondary-700">{company?.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary-500">Database</span>
            <span className="text-secondary-700">PostgreSQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary-500">Version</span>
            <span className="text-secondary-700">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
