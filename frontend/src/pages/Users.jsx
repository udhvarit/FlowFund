import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  UserPlus,
  Mail,
  Shield,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';

const ROLES = ['admin', 'manager', 'employee'];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    managerId: '',
    isManagerApprover: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, managersRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/managers')
      ]);
      setUsers(usersRes.data.data);
      setManagers(managersRes.data.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        managerId: user.managerId || '',
        isManagerApprover: user.isManagerApprover
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'employee',
        managerId: '',
        isManagerApprover: false
      });
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        if (!formData.password) {
          setError('Password is required');
          setSubmitting(false);
          return;
        }
        await api.post('/users', formData);
      }
      await fetchData();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      await fetchData();
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to deactivate user:', err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      employee: 'bg-secondary-100 text-secondary-800'
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role] || ''}`;
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
          <h1 className="text-2xl font-bold text-secondary-900">User Management</h1>
          <p className="text-secondary-600 mt-1">Manage team members and roles</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-secondary-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Manager</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-secondary-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`text-sm border-0 bg-transparent focus:ring-2 focus:ring-primary-500 rounded ${getRoleBadge(user.role)}`}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">
                    {user.manager ? (
                      `${user.manager.firstName} ${user.manager.lastName}`
                    ) : (
                      <span className="text-secondary-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(user)}
                        className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {user.isActive && (
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-secondary-100">
                <h3 className="text-lg font-semibold text-secondary-900">
                  {editingUser ? 'Edit User' : 'Add New User'}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Password {editingUser && <span className="text-secondary-400">(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required={!editingUser}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Manager</label>
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">No manager</option>
                    {managers.filter(m => m.id !== editingUser?.id).map((mgr) => (
                      <option key={mgr.id} value={mgr.id}>
                        {mgr.firstName} {mgr.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isManagerApprover"
                    checked={formData.isManagerApprover}
                    onChange={(e) => setFormData({ ...formData, isManagerApprover: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isManagerApprover" className="text-sm text-secondary-700">
                    Require manager approval before submission
                  </label>
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
                    {editingUser ? 'Update' : 'Create'}
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
