import { useUserListViewModel } from '../../viewmodels/UserViewModel';
import { Search, Filter, ChevronRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GOAL_OPTIONS = [
  { value: '', label: 'Tất cả mục tiêu' },
  { value: 'weight_loss', label: 'Giảm cân' },
  { value: 'muscle_gain', label: 'Tăng cơ' },
  { value: 'maintain', label: 'Duy trì' },
];

export default function UserListPage() {
  const { users, loading, error, search, setSearch, goalFilter, setGoalFilter } = useUserListViewModel();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Quản lý người dùng</h1>
        <p className="text-neutral-500 mt-1">Xem và tìm kiếm thông tin người dùng</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">{error}</div>
      )}

      {/* Search & Filter */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
              placeholder="Tìm theo tên hoặc email..."
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select
              value={goalFilter}
              onChange={e => setGoalFilter(e.target.value)}
              className="input-field pl-10 pr-8 appearance-none min-w-[180px]"
            >
              {GOAL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="card overflow-hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Users className="w-12 h-12 mb-3" />
            <p>Không tìm thấy người dùng</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">Tên</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Giới tính</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Mục tiêu</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Ngày tạo</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map(u => (
                  <tr
                    key={u.id}
                    className="hover:bg-primary-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/users/${u.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-neutral-900">{u.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 text-sm">{u.email}</td>
                    <td className="px-6 py-4 text-neutral-600 text-sm hidden md:table-cell">{u.displayGender}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <GoalBadge goal={u.goal} />
                    </td>
                    <td className="px-6 py-4 text-neutral-500 text-sm hidden lg:table-cell">{u.displayCreatedAt}</td>
                    <td className="px-6 py-4">
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-sm text-neutral-400">{users.length} người dùng</p>
    </div>
  );
}

function GoalBadge({ goal }: { goal: string }) {
  const styles: Record<string, string> = {
    weight_loss: 'bg-orange-50 text-orange-700 border-orange-200',
    muscle_gain: 'bg-blue-50 text-blue-700 border-blue-200',
    maintain: 'bg-primary-50 text-primary-700 border-primary-200',
  };
  const labels: Record<string, string> = {
    weight_loss: 'Giảm cân',
    muscle_gain: 'Tăng cơ',
    maintain: 'Duy trì',
  };
  const style = styles[goal] || 'bg-neutral-100 text-neutral-600 border-neutral-200';
  const label = labels[goal] || goal || '—';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {label}
    </span>
  );
}
