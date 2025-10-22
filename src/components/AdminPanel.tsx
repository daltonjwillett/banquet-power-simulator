import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { 
  mdiArrowLeft, 
  mdiAccountMultiple, 
  mdiTrophy,
  mdiPlus,
  mdiPencil,
  mdiDelete,
  mdiCheck,
  mdiClose,
  mdiAlertCircle
} from '@mdi/js';
import { supabase } from '../lib/supabase';

interface User {
  employee_id: string;
  name: string;
  created_at: string;
}

interface LeaderboardEntry {
  id: string;
  employee_id: string;
  name: string;
  time_seconds: number;
  completed_at: string;
  used_hint1: boolean;
  used_hint2: boolean;
}

interface AdminPanelProps {
  onReturnToGame: () => void;
}

type TabType = 'users' | 'leaderboard';

export default function AdminPanel({ onReturnToGame }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedScenario, setSelectedScenario] = useState(1);
  const [loading, setLoading] = useState(false);

  // User Management State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newName, setNewName] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Confirmation Dialogs
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeleteEntry, setConfirmDeleteEntry] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPin, setResetPin] = useState('');

  // Load users when on users tab
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  // Load leaderboard when scenario changes
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeTab, selectedScenario]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('employee_id', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scenario_attempts')
        .select(`
          id,
          employee_id,
          time_seconds,
          completed_at,
          used_hint1,
          used_hint2,
          users (name)
        `)
        .eq('scenario_id', selectedScenario)
        .order('time_seconds', { ascending: true });

      if (error) throw error;

      const formattedData = (data || []).map((entry: any) => ({
        id: entry.id,
        employee_id: entry.employee_id,
        name: entry.users?.name || 'Unknown',
        time_seconds: entry.time_seconds,
        completed_at: entry.completed_at,
        used_hint1: entry.used_hint1,
        used_hint2: entry.used_hint2
      }));

      setLeaderboard(formattedData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newEmployeeId.trim() || !newName.trim()) return;

    try {
      const { error } = await supabase
        .from('users')
        .insert([{ employee_id: newEmployeeId.trim(), name: newName.trim() }]);

      if (error) throw error;

      setNewEmployeeId('');
      setNewName('');
      setShowAddUser(false);
      loadUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user. Employee ID may already exist.');
    }
  };

  const handleUpdateUser = async (employeeId: string) => {
    if (!editName.trim()) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ name: editName.trim() })
        .eq('employee_id', employeeId);

      if (error) throw error;

      setEditingUserId(null);
      setEditName('');
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('employee_id', employeeId);

      if (error) throw error;

      setConfirmDelete(null);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('scenario_attempts')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setConfirmDeleteEntry(null);
      loadLeaderboard();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleResetLeaderboard = async () => {
    if (resetPin !== '0606') {
      alert('Incorrect PIN');
      setResetPin('');
      return;
    }

    try {
      const { error } = await supabase
        .from('scenario_attempts')
        .delete()
        .eq('scenario_id', selectedScenario);

      if (error) throw error;

      setShowResetConfirm(false);
      setResetPin('');
      loadLeaderboard();
    } catch (error) {
      console.error('Error resetting leaderboard:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white z-[100] overflow-auto">
      {/* Header */}
      <div className="bg-black/40 border-b border-gray-800 p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={onReturnToGame}
              className="flex items-center gap-4 px-10 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl transition-all text-2xl"
            >
              <Icon path={mdiArrowLeft} size={2} />
              <span className="font-semibold">Return to Game</span>
            </button>
            <h1 className="text-6xl font-bold">Admin Panel</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-black/20 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-4 px-12 py-8 text-3xl font-semibold transition-colors border-b-4 ${
              activeTab === 'users'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Icon path={mdiAccountMultiple} size={2.5} />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-4 px-12 py-8 text-3xl font-semibold transition-colors border-b-4 ${
              activeTab === 'leaderboard'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Icon path={mdiTrophy} size={2.5} />
            Leaderboard Management
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-12">
        {activeTab === 'users' && (
          <div>
            {/* Add User Button */}
            <div className="mb-10">
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="flex items-center gap-4 px-10 py-6 text-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl transition-all"
              >
                <Icon path={mdiPlus} size={2} />
                Add New User
              </button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
              <div className="bg-black/40 border border-gray-800 rounded-2xl p-10 mb-10">
                <h3 className="text-4xl font-semibold mb-8">Add New User</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <label className="block text-2xl text-gray-400 mb-4">Employee ID</label>
                    <input
                      type="text"
                      value={newEmployeeId}
                      onChange={(e) => setNewEmployeeId(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Enter ID"
                      className="w-full px-8 py-6 text-3xl bg-black/40 border-2 border-gray-700 rounded-2xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-2xl text-gray-400 mb-4">Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full px-8 py-6 text-3xl bg-black/40 border-2 border-gray-700 rounded-2xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-6">
                  <button
                    onClick={handleAddUser}
                    disabled={!newEmployeeId.trim() || !newName.trim()}
                    className="flex items-center gap-4 px-10 py-6 text-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed rounded-2xl transition-all"
                  >
                    <Icon path={mdiCheck} size={2} />
                    Add User
                  </button>
                  <button
                    onClick={() => {
                      setShowAddUser(false);
                      setNewEmployeeId('');
                      setNewName('');
                    }}
                    className="px-10 py-6 text-2xl bg-gray-700 hover:bg-gray-600 rounded-2xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Users List */}
            <div className="bg-black/40 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/60">
                    <tr>
                      <th className="text-left px-10 py-8 text-2xl font-semibold text-gray-400">Employee ID</th>
                      <th className="text-left px-10 py-8 text-2xl font-semibold text-gray-400">Name</th>
                      <th className="text-left px-10 py-8 text-2xl font-semibold text-gray-400">Created</th>
                      <th className="text-right px-10 py-8 text-2xl font-semibold text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-3xl text-gray-400">
                          Loading users...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-3xl text-gray-400">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.employee_id} className="border-t border-gray-800 hover:bg-white/5">
                          <td className="px-10 py-8 text-2xl">{user.employee_id}</td>
                          <td className="px-10 py-8 text-2xl">
                            {editingUserId === user.employee_id ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="px-6 py-4 text-2xl bg-black/40 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                autoFocus
                              />
                            ) : (
                              user.name
                            )}
                          </td>
                          <td className="px-10 py-8 text-2xl text-gray-400">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center justify-end gap-4">
                              {editingUserId === user.employee_id ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateUser(user.employee_id)}
                                    className="p-6 bg-green-500 hover:bg-green-600 rounded-2xl transition-colors"
                                  >
                                    <Icon path={mdiCheck} size={2} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingUserId(null);
                                      setEditName('');
                                    }}
                                    className="p-6 bg-gray-600 hover:bg-gray-500 rounded-2xl transition-colors"
                                  >
                                    <Icon path={mdiClose} size={2} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingUserId(user.employee_id);
                                      setEditName(user.name);
                                    }}
                                    className="p-6 bg-blue-500 hover:bg-blue-600 rounded-2xl transition-colors"
                                  >
                                    <Icon path={mdiPencil} size={2} />
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelete(user.employee_id)}
                                    className="p-6 bg-red-500 hover:bg-red-600 rounded-2xl transition-colors"
                                  >
                                    <Icon path={mdiDelete} size={2} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div>
            {/* Scenario Selector & Reset Button */}
            <div className="flex items-center justify-between mb-10 gap-6 flex-wrap">
              <div className="flex items-center gap-8">
                <label className="text-3xl text-gray-400 font-semibold">Scenario:</label>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(Number(e.target.value))}
                  className="px-8 py-6 text-3xl bg-black/40 border-2 border-gray-700 rounded-2xl text-white focus:outline-none focus:border-blue-500"
                >
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      Scenario {num}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-4 px-10 py-6 text-2xl bg-red-500 hover:bg-red-600 rounded-2xl transition-colors"
              >
                <Icon path={mdiAlertCircle} size={2} />
                Reset Leaderboard
              </button>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-black/40 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/60">
                    <tr>
                      <th className="text-left px-10 py-8 text-2xl font-semibold text-gray-400">Rank</th>
                      <th className="text-left px-10 py-8 text-2xl font-semibold text-gray-400">Employee ID</th>
                      <th className="text-left px-10 py-8 text-2xl font-semibold text-gray-400">Name</th>
                      <th className="text-left px-10 py-8 text-2xl font-semibold text-gray-400">Time</th>
                      <th className="text-left px-10 py-8 text-2xl font-semibold text-gray-400">Hints</th>
                      <th className="text-left px-10 py-8 text-2xl font-semibold text-gray-400">Date</th>
                      <th className="text-right px-10 py-8 text-2xl font-semibold text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-3xl text-gray-400">
                          Loading leaderboard...
                        </td>
                      </tr>
                    ) : leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-3xl text-gray-400">
                          No entries for this scenario
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((entry, index) => (
                        <tr key={entry.id} className="border-t border-gray-800 hover:bg-white/5">
                          <td className="px-10 py-8 text-3xl font-semibold">#{index + 1}</td>
                          <td className="px-10 py-8 text-2xl">{entry.employee_id}</td>
                          <td className="px-10 py-8 text-2xl">{entry.name}</td>
                          <td className="px-10 py-8 text-3xl font-mono">{formatTime(entry.time_seconds)}</td>
                          <td className="px-10 py-8 text-2xl">
                            {entry.used_hint1 && entry.used_hint2 ? (
                              <span className="text-orange-400">Both</span>
                            ) : entry.used_hint1 ? (
                              <span className="text-yellow-400">Hint 1</span>
                            ) : (
                              <span className="text-gray-500">None</span>
                            )}
                          </td>
                          <td className="px-10 py-8 text-2xl text-gray-400">
                            {new Date(entry.completed_at).toLocaleDateString()}
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center justify-end gap-4">
                              <button
                                onClick={() => setConfirmDeleteEntry(entry.id)}
                                className="p-6 bg-red-500 hover:bg-red-600 rounded-2xl transition-colors"
                              >
                                <Icon path={mdiDelete} size={2} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete User Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-gray-800 p-12 max-w-4xl w-full">
            <div className="flex items-center gap-6 mb-8">
              <Icon path={mdiAlertCircle} size={3} className="text-red-500" />
              <h3 className="text-5xl font-bold">Delete User</h3>
            </div>
            <p className="text-3xl text-gray-300 mb-10">
              Are you sure you want to delete user <strong>{confirmDelete}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-6">
              <button
                onClick={() => handleDeleteUser(confirmDelete)}
                className="flex-1 py-8 text-3xl bg-red-500 hover:bg-red-600 rounded-2xl transition-colors font-semibold"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-8 text-3xl bg-gray-700 hover:bg-gray-600 rounded-2xl transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Entry Confirmation */}
      {confirmDeleteEntry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-gray-800 p-12 max-w-4xl w-full">
            <div className="flex items-center gap-6 mb-8">
              <Icon path={mdiAlertCircle} size={3} className="text-red-500" />
              <h3 className="text-5xl font-bold">Delete Entry</h3>
            </div>
            <p className="text-3xl text-gray-300 mb-10">
              Are you sure you want to delete this leaderboard entry? This action cannot be undone.
            </p>
            <div className="flex gap-6">
              <button
                onClick={() => handleDeleteEntry(confirmDeleteEntry)}
                className="flex-1 py-8 text-3xl bg-red-500 hover:bg-red-600 rounded-2xl transition-colors font-semibold"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDeleteEntry(null)}
                className="flex-1 py-8 text-3xl bg-gray-700 hover:bg-gray-600 rounded-2xl transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Leaderboard Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-gray-800 p-12 max-w-4xl w-full">
            <div className="flex items-center gap-6 mb-8">
              <Icon path={mdiAlertCircle} size={3} className="text-red-500" />
              <h3 className="text-5xl font-bold">Reset Leaderboard</h3>
            </div>
            <p className="text-3xl text-gray-300 mb-8">
              This will delete ALL entries for Scenario {selectedScenario}. This action cannot be undone.
            </p>
            <div className="mb-10">
              <label className="block text-2xl text-gray-400 mb-4">Enter PIN to confirm:</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={resetPin}
                onChange={(e) => setResetPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter PIN"
                className="w-full px-8 py-6 text-3xl bg-black/40 border-2 border-gray-700 rounded-2xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-6">
              <button
                onClick={handleResetLeaderboard}
                disabled={resetPin.length !== 4}
                className="flex-1 py-8 text-3xl bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-2xl transition-colors font-semibold"
              >
                Reset Leaderboard
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  setResetPin('');
                }}
                className="flex-1 py-8 text-3xl bg-gray-700 hover:bg-gray-600 rounded-2xl transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}