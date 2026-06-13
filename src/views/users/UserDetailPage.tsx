import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserDetailViewModel } from '../../viewmodels/UserViewModel';
import {
  ArrowLeft, User, Ruler, Weight, Target, Activity,
  Utensils, ClipboardList, Calendar, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { DocumentData } from 'firebase/firestore';

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

  // Grouping logic
  const translateMealType = (type?: string) => {
    if (!type) return 'Bữa ăn';
    switch (type.toLowerCase()) {
      case 'breakfast': return 'Bữa sáng';
      case 'lunch': return 'Bữa trưa';
      case 'dinner': return 'Bữa tối';
      case 'snack': return 'Ăn vặt';
      case 'afternoon': return 'Bữa xế';
      default: return type || 'Bữa ăn';
    }
  };

  const translateUnit = (unit?: string) => {
    if (!unit) return '';
    const u = unit.toLowerCase();
    if (u.includes('gram')) return 'g';
    if (u === 'ml') return 'ml';
    return unit;
  };

  const groupedMeals = (meals || []).reduce((acc, meal) => {
    const date = meal?.dateKey || 'Không xác định';
    if (!acc[date]) acc[date] = [];
    acc[date].push(meal);
    return acc;
  }, {} as Record<string, DocumentData[]>);

  const groupedActivities = (userActivities || []).reduce((acc, activity) => {
    const date = activity?.dateKey || 'Không xác định';
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, DocumentData[]>);

  const mealDates = Object.keys(groupedMeals).sort((a, b) => b.localeCompare(a));
  const activityDates = Object.keys(groupedActivities).sort((a, b) => b.localeCompare(a));

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
            {plan.protein && <InfoItem label="Đạm" value={`${plan.protein}g`} />}
            {plan.carbs && <InfoItem label="Tinh bột" value={`${plan.carbs}g`} />}
            {plan.fat && <InfoItem label="Chất béo" value={`${plan.fat}g`} />}
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
        {mealDates.length > 0 ? (
          <div className="space-y-4">
            {mealDates.map((date, index) => (
              <DateAccordion key={date} date={date} defaultOpen={index === 0}>
                {groupedMeals[date].map((m: DocumentData) => (
                  <div key={m.id} className="bg-white border border-neutral-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-primary-600">
                        {translateMealType(m.mealType)}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-neutral-700">{m.totalCalories ? `${Math.round(m.totalCalories)} kcal` : '—'}</span>
                      </div>
                    </div>
                    
                    {/* Macros summary */}
                    <div className="flex gap-4 text-xs text-neutral-500 mb-3 bg-neutral-50 p-2 rounded">
                      <span>Đạm: {m.totalProtein ? `${Math.round(m.totalProtein)}g` : '-'}</span>
                      <span>Tinh bột: {m.totalCarbs ? `${Math.round(m.totalCarbs)}g` : '-'}</span>
                      <span>Chất béo: {m.totalFats ? `${Math.round(m.totalFats)}g` : '-'}</span>
                    </div>

                    {/* Food items */}
                    {Array.isArray(m.food) && m.food.length > 0 && (
                      <div className="space-y-1 mt-2 border-t border-neutral-100 pt-2">
                        <p className="text-xs font-medium text-neutral-500 mb-1">Các món ăn:</p>
                        {m.food.map((f: DocumentData, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-neutral-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full"></span>
                              {f.name} {f.quantity && f.servingSize ? `(${(f.quantity * f.servingSize).toFixed(1)}${translateUnit(f.servingUnit)})` : ''}
                            </span>
                            <span className="text-neutral-500 text-xs">{f.calories ? `${Math.round(f.calories * (f.quantity || 1))} kcal` : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </DateAccordion>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-neutral-50 rounded-lg border border-neutral-100 border-dashed">
            <Utensils className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-500">Chưa có nhật ký ăn uống.</p>
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-500" />
          Nhật ký tập luyện
          <span className="text-sm font-normal text-neutral-400">({userActivities.length} mục)</span>
        </h2>
        {activityDates.length > 0 ? (
          <div className="space-y-4">
            {activityDates.map((date, index) => (
              <DateAccordion key={date} date={date} defaultOpen={index === 0}>
                {groupedActivities[date].map((a: DocumentData) => (
                  <div key={a.id} className="flex items-center justify-between py-3 px-4 bg-white border border-neutral-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 shrink-0">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">
                          {a.activityType?.name || 'Hoạt động thể chất'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {typeof a.createdAt?.toDate === 'function' ? a.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-500">{a.caloriesBurned ? `-${Math.round(a.caloriesBurned)} kcal` : '—'}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{a.durationMinutes ? `${a.durationMinutes} phút` : '—'}</p>
                    </div>
                  </div>
                ))}
              </DateAccordion>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-neutral-50 rounded-lg border border-neutral-100 border-dashed">
            <Activity className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-500">Chưa có nhật ký tập luyện.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DateAccordion({ date, children, defaultOpen = false }: { date: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
      >
        <span className="font-semibold text-neutral-700">Ngày {date}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-white space-y-3 border-t border-neutral-100">
          {children}
        </div>
      )}
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
