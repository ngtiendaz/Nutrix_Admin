import { useParams, useNavigate } from 'react-router-dom';
import { useUserDetailViewModel } from '../../viewmodels/UserViewModel';
import {
  ArrowLeft, User, Ruler, Weight, Target, Activity,
  Utensils, ClipboardList, Calendar,
} from 'lucide-react';

export default function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, meals, plan, userActivities, loading, error } = useUserDetailViewModel(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500">Không tìm thấy người dùng.</p>
        <button onClick={() => navigate('/users')} className="btn-primary mt-4">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/users')}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{user.name || 'Người dùng'}</h1>
          <p className="text-neutral-500">{user.email}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">{error}</div>
      )}

      {/* Profile Info */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-500" />
          Thông tin cá nhân
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <InfoItem icon={<Calendar className="w-4 h-4" />} label="Tuổi" value={user.age ? `${user.age} tuổi` : '—'} />
          <InfoItem icon={<User className="w-4 h-4" />} label="Giới tính" value={user.displayGender} />
          <InfoItem icon={<Ruler className="w-4 h-4" />} label="Chiều cao" value={user.height ? `${user.height} cm` : '—'} />
          <InfoItem icon={<Weight className="w-4 h-4" />} label="Cân nặng" value={user.weight ? `${user.weight} kg` : '—'} />
          <InfoItem icon={<Activity className="w-4 h-4" />} label="Mức vận động" value={user.displayActivityLevel} />
          <InfoItem icon={<Target className="w-4 h-4" />} label="Mục tiêu" value={user.displayGoal} />
          <InfoItem icon={<Calendar className="w-4 h-4" />} label="Ngày tạo" value={user.displayCreatedAt} />
        </div>
      </div>

      {/* Nutrition Plan */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary-500" />
          Lộ trình dinh dưỡng
        </h2>
        {plan ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {plan.dailyCalories && <InfoItem label="Calo/ngày" value={`${plan.dailyCalories} kcal`} />}
            {plan.protein && <InfoItem label="Protein" value={`${plan.protein}g`} />}
            {plan.carbs && <InfoItem label="Carbs" value={`${plan.carbs}g`} />}
            {plan.fat && <InfoItem label="Fat" value={`${plan.fat}g`} />}
            {plan.water && <InfoItem label="Nước" value={`${plan.water} ml`} />}
          </div>
        ) : (
          <p className="text-neutral-400">Chưa có lộ trình dinh dưỡng.</p>
        )}
      </div>

      {/* Recent Meals */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-primary-500" />
          Nhật ký ăn uống
          <span className="text-sm font-normal text-neutral-400">({meals.length} mục)</span>
        </h2>
        {meals.length > 0 ? (
          <div className="space-y-2">
            {meals.slice(0, 10).map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-neutral-50">
                <span className="text-sm text-neutral-700">{m.name || m.foodName || 'Bữa ăn'}</span>
                <span className="text-sm text-neutral-500">{m.calories ? `${m.calories} kcal` : '—'}</span>
              </div>
            ))}
            {meals.length > 10 && (
              <p className="text-sm text-neutral-400 pt-2">và {meals.length - 10} mục khác...</p>
            )}
          </div>
        ) : (
          <p className="text-neutral-400">Chưa có nhật ký ăn uống.</p>
        )}
      </div>

      {/* Activity Log */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-500" />
          Nhật ký tập luyện
          <span className="text-sm font-normal text-neutral-400">({userActivities.length} mục)</span>
        </h2>
        {userActivities.length > 0 ? (
          <div className="space-y-2">
            {userActivities.slice(0, 10).map(a => (
              <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-neutral-50">
                <span className="text-sm text-neutral-700">{a.name || a.activityName || 'Hoạt động'}</span>
                <span className="text-sm text-neutral-500">
                  {a.duration ? `${a.duration} phút` : '—'}
                </span>
              </div>
            ))}
            {userActivities.length > 10 && (
              <p className="text-sm text-neutral-400 pt-2">và {userActivities.length - 10} mục khác...</p>
            )}
          </div>
        ) : (
          <p className="text-neutral-400">Chưa có nhật ký tập luyện.</p>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-neutral-50 rounded-lg p-3">
      {icon && <div className="text-neutral-400 mb-1">{icon}</div>}
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-sm font-medium text-neutral-900 mt-0.5">{value}</p>
    </div>
  );
}
