import { useState } from 'react';
import { useFoodViewModel } from '../../viewmodels/FoodViewModel';
import { Food } from '../../models/Food';
import { Plus, Pencil, Trash2, X, Search, Utensils, Upload } from 'lucide-react';

export default function FoodPage() {
  const {
    foods, loading, error,
    showForm, editingFood,
    addFood, updateFood, deleteFood,
    openCreate, openEdit, closeForm,
  } = useFoodViewModel();

  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = foods.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-neutral-900">Quản lý đồ ăn</h1>
          <p className="text-neutral-500 mt-1">Danh mục thực phẩm mẫu cho người dùng</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm đồ ăn
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
            placeholder="Tìm đồ ăn..."
          />
        </div>
      </div>

      {/* Food Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Utensils className="w-12 h-12 mb-3" />
            <p>Chưa có đồ ăn nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">Ảnh</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">Tên đồ ăn</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">Dinh dưỡng (100g)</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-3">Khẩu phần</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map(f => (
                  <tr key={f.id} className="hover:bg-primary-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {f.imageUrl ? (
                        <img src={f.imageUrl} alt={f.name} className="w-12 h-12 rounded-lg object-cover bg-neutral-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
                          <Utensils className="w-6 h-6" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-900">{f.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-medium">{f.calories} kcal</span>
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">P: {f.protein}g</span>
                        <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">C: {f.carbs}g</span>
                        <span className="bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded font-medium">F: {f.fats}g</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 text-sm">
                      {f.servingSize} {f.servingUnit}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(f)}
                          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-primary-600"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteConfirm === f.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { deleteFood(f.id); setDeleteConfirm(null); }}
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
                            onClick={() => setDeleteConfirm(f.id)}
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

      <p className="text-sm text-neutral-400">{filtered.length} đồ ăn</p>

      {/* Food Form Modal */}
      {showForm && (
        <FoodFormModal
          food={editingFood}
          onSubmit={editingFood
            ? (data, file) => updateFood(editingFood.id, data, file)
            : addFood
          }
          onClose={closeForm}
        />
      )}
    </div>
  );
}

interface FoodFormModalProps {
  food: Food | null;
  onSubmit: (data: any, file?: File) => Promise<void>;
  onClose: () => void;
}

function FoodFormModal({ food, onSubmit, onClose }: FoodFormModalProps) {
  const [name, setName] = useState(food?.name || '');
  const [calories, setCalories] = useState(food?.calories?.toString() || '');
  const [protein, setProtein] = useState(food?.protein?.toString() || '');
  const [carbs, setCarbs] = useState(food?.carbs?.toString() || '');
  const [fats, setFats] = useState(food?.fats?.toString() || '');
  const [servingSize, setServingSize] = useState(food?.servingSize?.toString() || '100');
  const [servingUnit, setServingUnit] = useState(food?.servingUnit || 'Gram');
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string>(food?.imageUrl || '');
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fats: Number(fats),
        servingSize: Number(servingSize),
        servingUnit,
        quantity: 1,
        imageUrl: previewUrl,
      }, imageFile);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-neutral-900">
            {food ? 'Chỉnh sửa đồ ăn' : 'Thêm đồ ăn mới'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tên đồ ăn</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field"
                  placeholder="Ví dụ: Ức gà áp chảo"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Calories (kcal)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calories}
                    onChange={e => setCalories(e.target.value)}
                    className="input-field"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={protein}
                    onChange={e => setProtein(e.target.value)}
                    className="input-field"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={carbs}
                    onChange={e => setCarbs(e.target.value)}
                    className="input-field"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Fats (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fats}
                    onChange={e => setFats(e.target.value)}
                    className="input-field"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Khẩu phần</label>
                  <input
                    type="number"
                    step="0.1"
                    value={servingSize}
                    onChange={e => setServingSize(e.target.value)}
                    className="input-field"
                    placeholder="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Đơn vị</label>
                  <input
                    type="text"
                    value={servingUnit}
                    onChange={e => setServingUnit(e.target.value)}
                    className="input-field"
                    placeholder="Gram"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Hình ảnh</label>
              <div className="relative aspect-square rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center overflow-hidden group">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-neutral-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Thay đổi
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2 text-neutral-400 hover:text-primary-500 transition-colors">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm font-medium">Tải ảnh lên</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-neutral-100">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Hủy</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Đang lưu...' : food ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
