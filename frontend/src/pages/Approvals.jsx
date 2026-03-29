import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function Approvals() {
  const { user, company } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await api.get('/approvals/pending');
      setPendingApprovals(response.data.data);
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setActionLoading(requestId);
    try {
      await api.post(`/approvals/${requestId}/approve`, { comments });
      await fetchPendingApprovals();
      setSelectedExpense(null);
      setComments('');
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(requestId);
    try {
      await api.post(`/approvals/${requestId}/reject`, { comments });
      await fetchPendingApprovals();
      setSelectedExpense(null);
      setComments('');
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActionLoading(null);
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Pending Approvals</h1>
        <p className="text-secondary-600 mt-1">
          Review and approve expense claims from your team
        </p>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">All caught up!</h3>
          <p className="text-secondary-500">No pending approvals at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                onClick={() => setSelectedExpense(approval)}
                className={`card p-5 cursor-pointer transition-all hover:shadow-md ${
                  selectedExpense?.id === approval.id
                    ? 'ring-2 ring-primary-500'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600">
                        {approval.expense?.submitter?.firstName?.[0]}
                        {approval.expense?.submitter?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">
                        {approval.expense?.submitter?.firstName} {approval.expense?.submitter?.lastName}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {approval.expense?.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-pending">Pending</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-500">Amount</span>
                    <span className="font-semibold text-secondary-900">
                      {formatCurrency(approval.expense?.amountInCompanyCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-500">Date</span>
                    <span className="text-secondary-700">
                      {formatDate(approval.expense?.expenseDate)}
                    </span>
                  </div>
                  {approval.expense?.description && (
                    <div className="pt-2 border-t border-secondary-100">
                      <p className="text-secondary-500 line-clamp-2">
                        {approval.expense.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="card p-6 sticky top-24 h-fit">
            {selectedExpense ? (
              <>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Review Expense
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-secondary-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-5 h-5 text-secondary-400" />
                      <div>
                        <p className="font-medium text-secondary-900">
                          {selectedExpense.expense?.submitter?.firstName} {selectedExpense.expense?.submitter?.lastName}
                        </p>
                        <p className="text-sm text-secondary-500">
                          {selectedExpense.expense?.submitter?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary-50 rounded-lg">
                      <p className="text-sm text-secondary-500 mb-1">Amount</p>
                      <p className="text-xl font-bold text-secondary-900">
                        {formatCurrency(selectedExpense.expense?.amountInCompanyCurrency)}
                      </p>
                      {selectedExpense.expense?.originalCurrency !== company?.currencyCode && (
                        <p className="text-xs text-secondary-500">
                          ({formatCurrency(selectedExpense.expense?.amount, selectedExpense.expense?.originalCurrency)})
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-secondary-50 rounded-lg">
                      <p className="text-sm text-secondary-500 mb-1">Category</p>
                      <p className="font-medium text-secondary-900">
                        {selectedExpense.expense?.category?.name}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary-50 rounded-lg">
                    <p className="text-sm text-secondary-500 mb-1">Description</p>
                    <p className="text-secondary-900">
                      {selectedExpense.expense?.description || 'No description provided'}
                    </p>
                  </div>

                  {selectedExpense.expense?.receiptUrl && (
                    <div className="p-4 bg-secondary-50 rounded-lg">
                      <p className="text-sm text-secondary-500 mb-2">Receipt</p>
                      <img
                        src={selectedExpense.expense.receiptUrl}
                        alt="Receipt"
                        className="max-h-48 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Comments (optional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-secondary-400" />
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                      placeholder="Add a comment..."
                      className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedExpense.id)}
                    disabled={actionLoading === selectedExpense.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === selectedExpense.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedExpense.id)}
                    disabled={actionLoading === selectedExpense.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === selectedExpense.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    Reject
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-500">
                  Select an expense to review
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
