import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle, Percent, UserCheck, GitMerge, ToggleLeft, ToggleRight } from 'lucide-react';

const RULE_TYPES = [
  { value: 'percentage', label: 'Percentage Rule', icon: Percent, description: 'Approve if X% of approvers approve' },
  { value: 'specific_approver', label: 'Specific Approver', icon: UserCheck, description: 'Approve if specific person approves' },
  { value: 'hybrid', label: 'Hybrid Rule', icon: GitMerge, description: 'Combine percentage and specific approver' }
];

export default function ApprovalRules() {
  const [rules, setRules] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    sequenceId: '',
    ruleType: 'percentage',
    percentageThreshold: 50,
    requiredApproverId: '',
    conditionLogic: 'or'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rulesRes, seqRes, usersRes] = await Promise.all([
        api.get('/approval-rules'),
        api.get('/approval-sequences'),
        api.get('/users/managers')
      ]);
      setRules(rulesRes.data.data);
      setSequences(seqRes.data.data);
      setUsers(usersRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        sequenceId: rule.sequenceId,
        ruleType: rule.ruleType,
        percentageThreshold: rule.percentageThreshold || 50,
        requiredApproverId: rule.requiredApproverId || '',
        conditionLogic: rule.conditionLogic || 'or'
      });
    } else {
      setEditingRule(null);
      setFormData({
        sequenceId: sequences[0]?.id || '',
        ruleType: 'percentage',
        percentageThreshold: 50,
        requiredApproverId: '',
        conditionLogic: 'or'
      });
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRule(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingRule) {
        await api.put(`/approval-rules/${editingRule.id}`, formData);
      } else {
        await api.post('/approval-rules', formData);
      }
      await fetchData();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await api.delete(`/approval-rules/${id}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  const getRuleIcon = (ruleType) => {
    const rule = RULE_TYPES.find(r => r.value === ruleType);
    return rule?.icon || Percent;
  };

  const getRuleLabel = (ruleType) => {
    return RULE_TYPES.find(r => r.value === ruleType)?.label || ruleType;
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
          <h1 className="text-2xl font-bold text-secondary-900">Approval Rules</h1>
          <p className="text-secondary-600 mt-1">Configure conditional approval logic</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Rule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {RULE_TYPES.map((ruleType) => (
          <div key={ruleType.value} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <ruleType.icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900">{ruleType.label}</h3>
                <p className="text-sm text-secondary-500">{ruleType.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              {rules.filter(r => r.ruleType === ruleType.value).length === 0 ? (
                <p className="text-sm text-secondary-400 italic">No rules configured</p>
              ) : (
                rules.filter(r => r.ruleType === ruleType.value).map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div>
                      <p className="font-medium text-secondary-900">{rule.sequence?.name}</p>
                      {rule.percentageThreshold && (
                        <p className="text-sm text-secondary-500">{rule.percentageThreshold}% required</p>
                      )}
                      {rule.requiredApprover && (
                        <p className="text-sm text-secondary-500">Approver: {rule.requiredApprover.firstName} {rule.requiredApprover.lastName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(rule)}
                        className="p-2 text-secondary-600 hover:bg-secondary-200 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="card p-12 text-center">
          <GitMerge className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">No rules configured</h3>
          <p className="text-secondary-500 mb-4">Create approval rules to customize your workflow logic.</p>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
          >
            Create First Rule
          </button>
        </div>
      )}

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-secondary-100">
                <h3 className="text-lg font-semibold text-secondary-900">
                  {editingRule ? 'Edit Rule' : 'Create Approval Rule'}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-secondary-100 rounded-lg">
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Approval Flow</label>
                  <select
                    value={formData.sequenceId}
                    onChange={(e) => setFormData({ ...formData, sequenceId: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select flow</option>
                    {sequences.map((seq) => (
                      <option key={seq.id} value={seq.id}>{seq.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Rule Type</label>
                  <select
                    value={formData.ruleType}
                    onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {RULE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {(formData.ruleType === 'percentage' || formData.ruleType === 'hybrid') && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Percentage Threshold
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.percentageThreshold}
                        onChange={(e) => setFormData({ ...formData, percentageThreshold: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="w-12 text-center font-medium">{formData.percentageThreshold}%</span>
                    </div>
                  </div>
                )}

                {(formData.ruleType === 'specific_approver' || formData.ruleType === 'hybrid') && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Required Approver</label>
                    <select
                      value={formData.requiredApproverId}
                      onChange={(e) => setFormData({ ...formData, requiredApproverId: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required={formData.ruleType === 'specific_approver'}
                    >
                      <option value="">Select approver</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.ruleType === 'hybrid' && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Logic</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="or"
                          checked={formData.conditionLogic === 'or'}
                          onChange={() => setFormData({ ...formData, conditionLogic: 'or' })}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-sm">OR (either condition)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="and"
                          checked={formData.conditionLogic === 'and'}
                          onChange={() => setFormData({ ...formData, conditionLogic: 'and' })}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-sm">AND (both conditions)</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-secondary-300 text-secondary-700 font-medium rounded-lg hover:bg-secondary-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingRule ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
