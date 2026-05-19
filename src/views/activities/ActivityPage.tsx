import { useState } from 'react';
import { useActivityViewModel } from '../../viewmodels/ActivityViewModel';
import { ActivityModel } from '../../models/Activity';
import { Plus, Pencil, Trash2, X, Dumbbell, Search } from 'lucide-react';

export default function ActivityPage() {
  const {
    activities, loading, error,
    showForm, editingActivity,
    handleAdd, handleUpdate, handleDelete,
    openCreate, openEdit, closeForm,
  } = useActivityViewModel();

  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = activities.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Quản lý hoạt động</h1>
          <p className="text-neutral-500 mt-1">Thêm, sửa, xóa các hoạt động mẫu cho người dùng</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm hoạt động
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">{error}</div>
      )}

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Tìm hoạt động..."
          />
        </div>
      </div>

      {/* Activity Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Dumbbell className="w-12 h-12 mb-3" />
            <p>Chưa có hoạt động nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">Tên hoạt động</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">MET Value</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Icon</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-primary-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900">{a.name}</td>
                    <td className="px-6 py-4 text-neutral-600">
                      <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-sm font-medium">
                        {a.displayMetValue}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 text-sm hidden sm:table-cell">{a.icon || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-primary-600"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteConfirm === a.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { handleDelete(a.id); setDeleteConfirm(null); }}
                              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Xóa
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(a.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors text-neutral-500 hover:text-red-600"
                            title="Xóa"
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
        )}
      </div>

      <p className="text-sm text-neutral-400">{filtered.length} hoạt động</p>

      {/* Activity Form Modal */}
      {showForm && (
        <ActivityFormModal
          activity={editingActivity}
          onSubmit={editingActivity
            ? (data) => handleUpdate(editingActivity.id, data)
            : handleAdd
          }
          onClose={closeForm}
        />
      )}
    </div>
  );
}

function ActivityFormModal({ activity, onSubmit, onClose }: {
  activity: ActivityModel | null;
  onSubmit: (data: { name: string; metValue: string; icon: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(activity?.name || '');
  const [metValue, setMetValue] = useState(activity?.metValue?.toString() || '');
  const [icon, setIcon] = useState(activity?.icon || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ name, metValue, icon });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-neutral-900">
            {activity ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động mới'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tên hoạt động</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              placeholder="Ví dụ: Chạy bộ"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">MET Value</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={metValue}
              onChange={e => setMetValue(e.target.value)}
              className="input-field"
              placeholder="Ví dụ: 8.0"
              required
            />
            <p className="text-xs text-neutral-400 mt-1">
              MET (Metabolic Equivalent) dùng để tính lượng calo tiêu thụ
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Icon (SF Symbol name)</label>
            <input
              type="text"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              className="input-field"
              placeholder="Ví dụ: figure.run"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Hủy</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Đang lưu...' : activity ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
