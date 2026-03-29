import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle, GitBranch, GripVertical, ChevronRight } from 'lucide-react';

const APPROVER_ROLES = [
  { value: 'manager', label: 'Direct Manager' },
  { value: 'finance', label: 'Finance' },
  { value: 'director', label: 'Director' },
  { value: 'cfo', label: 'CFO' },
  { value: 'specific_user', label: 'Specific User' }
];

export default function ApprovalSequences() {
  const [sequences, setSequences] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSequence, setEditingSequence] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minAmount: '0',
    maxAmount: '',
    isActive: true
  });

  const [steps, setSteps] = useState([
    { stepOrder: 1, approverRole: 'manager', specificApproverId: '', isRequired: true }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [seqRes, usersRes] = await Promise.all([
        api.get('/approval-sequences'),
        api.get('/users/managers')
      ]);
      setSequences(seqRes.data.data);
      setUsers(usersRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (sequence = null) => {
    if (sequence) {
      setEditingSequence(sequence);
      setFormData({
        name: sequence.name,
        description: sequence.description || '',
        minAmount: sequence.minAmount || '0',
        maxAmount: sequence.maxAmount || '',
        isActive: sequence.isActive
      });
      setSteps(sequence.steps?.length > 0 ? sequence.steps.map(s => ({
        stepOrder: s.stepOrder,
        approverRole: s.approverRole,
        specificApproverId: s.specificApproverId || '',
        isRequired: s.isRequired
      })) : [{ stepOrder: 1, approverRole: 'manager', specificApproverId: '', isRequired: true }]);
    } else {
      setEditingSequence(null);
      setFormData({ name: '', description: '', minAmount: '0', maxAmount: '', isActive: true });
      setSteps([{ stepOrder: 1, approverRole: 'manager', specificApproverId: '', isRequired: true }]);
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSequence(null);
    setError('');
  };

  const addStep = () => {
    setSteps([...steps, {
      stepOrder: steps.length + 1,
      approverRole: 'manager',
      specificApproverId: '',
      isRequired: true
    }]);
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps.map((s, i) => ({ ...s, stepOrder: i + 1 })));
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingSequence) {
        await api.put(`/approval-sequences/${editingSequence.id}`, formData);
        
        const existingSteps = editingSequence.steps || [];
        for (let i = 0; i < steps.length; i++) {
          if (existingSteps[i]) {
            await api.put(`/approval-sequences/${editingSequence.id}/steps/${existingSteps[i].id}`, steps[i]);
          } else {
            await api.post(`/approval-sequences/${editingSequence.id}/steps`, steps[i]);
          }
        }
        
        if (existingSteps.length > steps.length) {
          for (let i = steps.length; i < existingSteps.length; i++) {
            await api.delete(`/approval-sequences/${editingSequence.id}/steps/${existingSteps[i].id}`);
          }
        }
      } else {
        const seqRes = await api.post('/approval-sequences', formData);
        const sequenceId = seqRes.data.data.id;
        
        for (const step of steps) {
          await api.post(`/approval-sequences/${sequenceId}/steps`, step);
        }
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
    if (!confirm('Are you sure you want to delete this approval flow?')) return;
    try {
      await api.delete(`/approval-sequences/${id}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete sequence:', err);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Approval Flows</h1>
          <p className="text-secondary-600 mt-1">Configure multi-level approval workflows</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Flow
        </button>
      </div>

      <div className="space-y-4">
        {sequences.map((seq) => (
          <div key={seq.id} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900">{seq.name}</h3>
                  <p className="text-sm text-secondary-500">
                    {seq.description || 'No description'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  seq.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-secondary-100 text-secondary-600'
                }`}>
                  {seq.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => openModal(seq)}
                  className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(seq.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-secondary-600 mb-3">
              <span>Amount: ${seq.minAmount || 0}</span>
              {seq.maxAmount && <span> - ${seq.maxAmount}</span>}
              <span className="text-secondary-400">|</span>
              <span>{seq.steps?.length || 0} steps</span>
            </div>

            {seq.steps?.length > 0 && (
              <div className="flex items-center gap-2">
                {seq.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="px-3 py-1.5 bg-secondary-100 rounded-lg text-sm">
                      {APPROVER_ROLES.find(r => r.value === step.approverRole)?.label || step.approverRole}
                    </div>
                    {index < seq.steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-secondary-400 mx-1" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {sequences.length === 0 && (
          <div className="card p-12 text-center">
            <GitBranch className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">No approval flows configured yet.</p>
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8">
              <div className="flex items-center justify-between p-6 border-b border-secondary-100">
                <h3 className="text-lg font-semibold text-secondary-900">
                  {editingSequence ? 'Edit Approval Flow' : 'Create Approval Flow'}
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
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Standard Approval"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Min Amount</label>
                    <input
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Max Amount</label>
                    <input
                      type="number"
                      value={formData.maxAmount}
                      onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      min="0"
                      step="0.01"
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Approval Steps</label>
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                        <div className="flex items-center gap-2 pt-2">
                          <GripVertical className="w-4 h-4 text-secondary-400" />
                          <span className="text-sm font-medium text-secondary-500">#{index + 1}</span>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <select
                            value={step.approverRole}
                            onChange={(e) => updateStep(index, 'approverRole', e.target.value)}
                            className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          >
                            {APPROVER_ROLES.map((role) => (
                              <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                          </select>
                          {step.approverRole === 'specific_user' && (
                            <select
                              value={step.specificApproverId}
                              onChange={(e) => updateStep(index, 'specificApproverId', e.target.value)}
                              className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="">Select user</option>
                              {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.firstName} {user.lastName}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        {steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addStep}
                    className="mt-2 w-full py-2 border-2 border-dashed border-secondary-300 text-secondary-600 rounded-lg hover:border-primary-400 hover:text-primary-600"
                  >
                    + Add Step
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-secondary-100">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-secondary-700">Active</label>
                </div>

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
                    {editingSequence ? 'Update' : 'Create'}
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
