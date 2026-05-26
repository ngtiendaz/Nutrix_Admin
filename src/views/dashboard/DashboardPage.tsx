import { useState } from 'react';
import { useDashboardViewModel, UserDetailData } from '../../viewmodels/DashboardViewModel';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Users, TrendingUp, Flame, Apple,
  Compass, Calendar, Sparkles, Clock, Search,
  Eye, X, Info, Trophy
} from 'lucide-react';


function getSafeTime(dateVal: any): number {
  if (!dateVal) return 0;
  try {
    if (typeof dateVal === 'object' && typeof dateVal.toDate === 'function') {
      return dateVal.toDate().getTime();
    }
    if (typeof dateVal === 'object' && typeof dateVal.seconds === 'number') {
      return dateVal.seconds * 1000;
    }
    const date = new Date(dateVal);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }
  } catch (e) {
    console.error('getSafeTime error:', e);
  }
  return 0;
}

function formatSafeDate(dateVal: any): string {
  if (!dateVal) return '—';
  try {
    if (typeof dateVal === 'object' && typeof dateVal.toDate === 'function') {
      return dateVal.toDate().toLocaleDateString('vi-VN');
    }
    if (typeof dateVal === 'object' && typeof dateVal.seconds === 'number') {
      return new Date(dateVal.seconds * 1000).toLocaleDateString('vi-VN');
    }
    const date = new Date(dateVal);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('vi-VN');
    }
  } catch (e) {
    console.error('formatSafeDate error:', e);
  }
  return '—';
}

const CHART_COLORS = ['#4A7C59', '#6A9470', '#8CAB90', '#B0C7B3', '#D4E3D6', '#E8F0E9'];
const HABIT_COLORS = ['#2E5B3C', '#4A7C59', '#7EA083', '#B8D5BC', '#E3F2E5'];

export default function DashboardPage() {
  const {
    detailedUsers,
    totalUsers,
    usersWithActivePlan,
    planCompletionRate,
    avgWeightProgress,
    sysAvgNutrition,
    goalChartData,
    activityLevelChartData,
    mealTypeChartData,
    activityPopularityData,
    monthlyChartData,
    loading,
    error,
  } = useDashboardViewModel();

  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition_habits' | 'users_list'>('overview');
  const [selectedUser, setSelectedUser] = useState<UserDetailData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-neutral-500 font-medium">Đang tải dữ liệu phân tích hệ thống...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 shadow-sm">
        <div className="flex gap-3 items-center">
          <Info className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Filter users by name or email
  const filteredUsers = detailedUsers.filter(du =>
    du.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    du.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // System nutrition macro ratio data (Protein: 4 kcal/g, Carbs: 4 kcal/g, Fats: 9 kcal/g)
  const totalMacrosGrams = sysAvgNutrition.protein + sysAvgNutrition.carbs + sysAvgNutrition.fats;
  const macroBreakdownData = totalMacrosGrams > 0 ? [
    { name: 'Đạm (Protein)', value: sysAvgNutrition.protein, color: '#3B82F6' },
    { name: 'Tinh bột (Carbs)', value: sysAvgNutrition.carbs, color: '#10B981' },
    { name: 'Chất béo (Fats)', value: sysAvgNutrition.fats, color: '#F59E0B' },
  ] : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Dashboard Quản Trị</h1>
          <p className="text-neutral-500 mt-1">Phân tích chuyên sâu về dinh dưỡng, thói quen tập luyện và lộ trình sức khỏe người dùng.</p>
        </div>
        <div className="bg-white p-1 rounded-xl border border-neutral-200 flex shadow-sm w-fit self-start">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === 'overview' ? 'bg-primary-500 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            Tổng quan hệ thống
          </button>
          <button
            onClick={() => setActiveTab('nutrition_habits')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === 'nutrition_habits' ? 'bg-primary-500 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            Dinh dưỡng & Thói quen
          </button>
          <button
            onClick={() => setActiveTab('users_list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === 'users_list' ? 'bg-primary-500 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            Danh sách người dùng
          </button>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Tổng người dùng"
          value={totalUsers}
          description="Tài khoản trên hệ thống"
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          icon={<Compass className="w-5 h-5" />}
          label="Lộ trình kích hoạt"
          value={`${usersWithActivePlan} / ${totalUsers}`}
          description="Đang sử dụng lộ trình AI"
          gradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Tỷ lệ hoàn thành lộ trình"
          value={`${planCompletionRate}%`}
          description="Đạt đích trong lịch sử"
          gradient="from-amber-500 to-orange-600"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Tiến độ giảm/tăng cân"
          value={`${avgWeightProgress}%`}
          description="Trung bình của người dùng"
          gradient="from-purple-500 to-pink-600"
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phân bố mục tiêu */}
            <div className="card p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Mục tiêu của người dùng</h2>
                <p className="text-xs text-neutral-400 mb-4">Mục tiêu hướng tới khi đăng ký ứng dụng</p>
              </div>
              {goalChartData.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="w-full h-[240px] flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={goalChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {goalChartData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} người`, 'Số lượng']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    {goalChartData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="font-medium">{item.name}:</span>
                        <span className="text-neutral-900 font-bold ml-auto sm:ml-0">{item.value} ({Math.round((item.value / totalUsers) * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-neutral-400">Không có dữ liệu mục tiêu</div>
              )}
            </div>

            {/* Cường độ vận động */}
            <div className="card p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Mức độ hoạt động cơ thể</h2>
                <p className="text-xs text-neutral-400 mb-4">Cường độ vận động hàng ngày của người dùng</p>
              </div>
              {activityLevelChartData.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="w-full h-[240px] flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activityLevelChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {activityLevelChartData.map((_, i) => (
                            <Cell key={i} fill={HABIT_COLORS[i % HABIT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} người`, 'Số lượng']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    {activityLevelChartData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: HABIT_COLORS[i % HABIT_COLORS.length] }} />
                        <span className="font-medium">{item.name}:</span>
                        <span className="text-neutral-900 font-bold ml-auto sm:ml-0">{item.value} ({Math.round((item.value / totalUsers) * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-neutral-400">Không có dữ liệu vận động</div>
              )}
            </div>

            {/* Người dùng mới theo tháng */}
            <div className="card p-6 lg:col-span-2">
              <h2 className="text-lg font-bold text-neutral-900 mb-1">Người dùng mới gia nhập</h2>
              <p className="text-xs text-neutral-400 mb-6">Số lượng tài khoản mới đăng ký theo tháng</p>
              {monthlyChartData.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#888888" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#888888" allowDecimals={false} />
                      <Tooltip formatter={(value) => [`${value} người dùng`, 'Số lượng']} />
                      <Bar dataKey="count" fill="#4A7C59" radius={[6, 6, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-neutral-400">Chưa có thống kê người dùng mới</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nutrition_habits' && (
        <div className="space-y-6">
          {/* System Nutrition Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NutritionSummaryCard
              icon={<Apple className="w-5 h-5 text-orange-600" />}
              label="Calo nạp trung bình"
              value={`${sysAvgNutrition.calories} kcal/ngày`}
              color="bg-orange-50 text-orange-800 border-orange-100"
            />
            <NutritionSummaryCard
              icon={<Flame className="w-5 h-5 text-red-600" />}
              label="Calo đốt cháy trung bình"
              value={`${sysAvgNutrition.burnedCalories} kcal/ngày`}
              color="bg-red-50 text-red-800 border-red-100"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phân bố Macro trung bình */}
            <div className="card p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Tỷ lệ các chất dinh dưỡng</h2>
                <p className="text-xs text-neutral-400 mb-4">Phân bổ chất dinh dưỡng đa lượng trung bình hàng ngày (gam)</p>
              </div>
              {macroBreakdownData.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="w-full h-[240px] flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={macroBreakdownData}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={90}
                          dataKey="value"
                        >
                          {macroBreakdownData.map((item, i) => (
                            <Cell key={i} fill={item.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}g`, 'Trọng lượng']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    {macroBreakdownData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-medium">{item.name}:</span>
                        <span className="text-neutral-900 font-bold ml-auto sm:ml-0">{item.value}g ({Math.round((item.value / totalMacrosGrams) * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-neutral-400">Không có dữ liệu dinh dưỡng</div>
              )}
            </div>

            {/* Phân bố thói quen ăn uống theo bữa */}
            <div className="card p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Thói quen phân bố bữa ăn</h2>
                <p className="text-xs text-neutral-400 mb-4">Tỷ lệ các loại bữa ăn được ghi nhận trong ngày</p>
              </div>
              {mealTypeChartData.some(item => item.value > 0) ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="w-full h-[240px] flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mealTypeChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {mealTypeChartData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} bữa`, 'Tổng ghi nhận']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    {mealTypeChartData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="font-medium">{item.name}:</span>
                        <span className="text-neutral-900 font-bold ml-auto sm:ml-0">{item.value} bữa</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-neutral-400">Không có dữ liệu thói quen bữa ăn</div>
              )}
            </div>

            {/* Top 5 hoạt động phổ biến */}
            <div className="card p-6 lg:col-span-2">
              <h2 className="text-lg font-bold text-neutral-900 mb-1">Thói quen hoạt động & Thể thao</h2>
              <p className="text-xs text-neutral-400 mb-6">Các môn thể thao / hoạt động được người dùng tập luyện nhiều nhất</p>
              {activityPopularityData.length > 0 ? (
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityPopularityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5E5" />
                      <XAxis type="number" stroke="#888888" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" stroke="#888888" tick={{ fontSize: 12 }} width={100} />
                      <Tooltip formatter={(value) => [`${value} lượt tập`, 'Số lượt']} />
                      <Bar dataKey="count" fill="#3D6A4A" radius={[0, 6, 6, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-neutral-400">Chưa có nhật ký hoạt động thể thao</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users_list' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="card p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field pl-10.5 py-2.5 text-sm"
                placeholder="Tìm kiếm người dùng bằng tên hoặc email..."
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Họ và tên / Email</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Mục tiêu</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Calo TB</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Luyện tập TB</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Tiến độ Lộ trình</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((du) => (
                      <tr key={du.user.id} className="hover:bg-primary-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-neutral-900">{du.user.name || 'Người dùng mới'}</div>
                          <div className="text-xs text-neutral-500">{du.user.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          {du.user.displayGoal ? (
                            <span className="bg-primary-50 text-primary-800 text-xs px-2 py-1 rounded-md font-medium border border-primary-100">
                              {du.user.displayGoal}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-neutral-900 font-semibold">{du.stats.avgCaloriesIn} <span className="text-xs text-neutral-500">kcal/ngày</span></div>
                          <div className="text-[10px] text-neutral-400">Đốt: {du.stats.avgCaloriesBurned} kcal</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-neutral-900 font-medium">{du.stats.totalWorkouts} buổi tập</div>
                          <div className="text-[10px] text-neutral-400">{du.stats.avgWorkoutDuration} phút/buổi</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {du.stats.weightProgress !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-neutral-200 h-2 rounded-full overflow-hidden">
                                <div className="bg-primary-500 h-full" style={{ width: `${du.stats.weightProgress}%` }} />
                              </div>
                              <span className="font-bold text-primary-700 text-xs">{du.stats.weightProgress}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-400">Không có lộ trình</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedUser(du)}
                            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                        Không tìm thấy người dùng phù hợp
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailModal
          userData={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

// Subcomponents

function StatCard({ icon, label, value, description, gradient }: { icon: React.ReactNode; label: string; value: string | number; description: string; gradient: string }) {
  return (
    <div className="card overflow-hidden relative group">
      <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${gradient}`} />
      <div className="p-5 flex items-start gap-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white flex-shrink-0 shadow-sm`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
          <p className="text-xs text-neutral-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

function NutritionSummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className={`card p-5 flex items-center gap-4 border ${color}`}>
      <div className="p-3 bg-white rounded-xl shadow-sm border border-neutral-100">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium opacity-85 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}

interface UserDetailModalProps {
  userData: UserDetailData;
  onClose: () => void;
}

function UserDetailModal({ userData, onClose }: UserDetailModalProps) {
  const { user, summaries, currentPlan, historyPlans, activities, stats } = userData;
  const [modalTab, setModalTab] = useState<'profile' | 'plan' | 'logs'>('profile');

  // Sort logs by date desc
  const sortedSummaries = [...summaries].sort((a, b) => b.dateKey.localeCompare(a.dateKey)).slice(0, 10);
  const sortedActivities = [...activities].sort((a, b) => {
    return getSafeTime(b.createdAt) - getSafeTime(a.createdAt);
  }).slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">{user.name || 'Người dùng chưa đặt tên'}</h2>
              <p className="text-xs text-neutral-500">{user.email} (ID: {user.userId})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-200 transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-neutral-100 px-6 bg-white flex-shrink-0">
          <button
            onClick={() => setModalTab('profile')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all duration-150 ${modalTab === 'profile' ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
          >
            Hồ sơ & Chỉ số
          </button>
          <button
            onClick={() => setModalTab('plan')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all duration-150 ${modalTab === 'plan' ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
          >
            Lộ trình dinh dưỡng AI
          </button>
          <button
            onClick={() => setModalTab('logs')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all duration-150 ${modalTab === 'logs' ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
          >
            Nhật ký gần đây
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50 space-y-6">
          {modalTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Details Card */}
              <div className="card p-5 bg-white md:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary-500" /> Chỉ số cơ thể & Thông tin
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <ProfileField label="Tuổi" value={user.age ? `${user.age} tuổi` : '—'} />
                  <ProfileField label="Giới tính" value={user.displayGender || '—'} />
                  <ProfileField label="Chiều cao" value={user.height ? `${user.height} cm` : '—'} />
                  <ProfileField label="Cân nặng hiện tại" value={user.weight ? `${user.weight} kg` : '—'} />
                  <ProfileField label="Cường độ hoạt động" value={user.displayActivityLevel || '—'} />
                  <ProfileField label="Mục tiêu đăng ký" value={user.displayGoal || '—'} />
                  <div className="col-span-2">
                    <ProfileField label="Ghi chú sức khỏe" value={user.healthNote || 'Không có ghi chú bệnh lý'} />
                  </div>
                  <ProfileField label="Ngày tạo tài khoản" value={user.displayCreatedAt} />
                </div>
              </div>

              {/* Individual Nutrition Summary */}
              <div className="card p-5 bg-white space-y-4">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-orange-500" /> Dinh dưỡng trung bình
                </h3>
                <div className="space-y-3">
                  <NutritionMetricRow label="Calo nạp" value={`${stats.avgCaloriesIn} kcal`} />
                  <NutritionMetricRow label="Đạm (Protein)" value={`${stats.avgProteinIn}g`} />
                  <NutritionMetricRow label="Tinh bột (Carbs)" value={`${stats.avgCarbsIn}g`} />
                  <NutritionMetricRow label="Chất béo (Fats)" value={`${stats.avgFatsIn}g`} />
                  <NutritionMetricRow label="Calo đốt cháy" value={`${stats.avgCaloriesBurned} kcal`} />
                  <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-xs text-neutral-500">
                    <span>Tổng số ngày ghi nhật ký:</span>
                    <span className="font-bold text-neutral-800">{summaries.length} ngày</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {modalTab === 'plan' && (
            <div className="space-y-6">
              {currentPlan ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Plan Overview Card */}
                  <div className="card p-5 bg-white md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Lộ trình AI hiện tại
                      </h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${currentPlan.isActive ? 'bg-green-50 text-green-700 border border-green-150' : 'bg-neutral-100 text-neutral-600'}`}>
                        {currentPlan.isActive ? 'Đang hoạt động' : 'Hết hạn'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-b border-neutral-100 pb-4">
                      <div>
                        <p className="text-xs text-neutral-400">Mục tiêu Calo hàng ngày</p>
                        <p className="text-lg font-bold text-neutral-800">{currentPlan.dailyCalories ? `${Math.round(currentPlan.dailyCalories)} kcal` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400">Mục tiêu Calo đốt cháy</p>
                        <p className="text-lg font-bold text-neutral-800">{currentPlan.activityCalories ? `${Math.round(currentPlan.activityCalories)} kcal` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400">Cân nặng bắt đầu</p>
                        <p className="text-lg font-bold text-neutral-800">{currentPlan.currentWeight ? `${currentPlan.currentWeight} kg` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400">Cân nặng mục tiêu</p>
                        <p className="text-lg font-bold text-neutral-800 text-primary-600">{currentPlan.targetWeight ? `${currentPlan.targetWeight} kg` : '—'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-neutral-500 uppercase">Lời khuyên của AI:</p>
                      <p className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-lg border border-neutral-100 leading-relaxed whitespace-pre-wrap">{currentPlan.advice || 'Chưa có lời khuyên cụ thể'}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-neutral-500 uppercase">Kế hoạch tập luyện:</p>
                      <p className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-lg border border-neutral-100 leading-relaxed whitespace-pre-wrap">{currentPlan.exercisePlan || 'Chưa có kế hoạch tập cụ thể'}</p>
                    </div>
                  </div>

                  {/* Plan Progress & History */}
                  <div className="space-y-6">
                    {/* Weight progress */}
                    <div className="card p-5 bg-white space-y-4">
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Tiến độ cân nặng</h4>
                      {stats.weightProgress !== null ? (
                        <div className="text-center space-y-2">
                          <p className="text-4xl font-extrabold text-primary-600">{stats.weightProgress}%</p>
                          <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden border border-neutral-200">
                            <div className="bg-primary-500 h-full" style={{ width: `${stats.weightProgress}%` }} />
                          </div>
                          <p className="text-xs text-neutral-500">Đã đi được {stats.weightProgress}% chặng đường mục tiêu</p>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-neutral-400 py-4">Chưa đủ dữ liệu để tính tiến độ</div>
                      )}
                    </div>

                    {/* Historical plans list */}
                    <div className="card p-5 bg-white space-y-3">
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Lịch sử lộ trình</h4>
                      {historyPlans.length > 0 ? (
                        <div className="space-y-2 max-h-[160px] overflow-y-auto">
                          {historyPlans.map((hp, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs bg-neutral-50 p-2 rounded border border-neutral-100">
                              <div>
                                <span className="font-semibold text-neutral-700">Mục tiêu: {hp.targetWeight}kg</span>
                                <p className="text-[10px] text-neutral-400">
                                  {hp.startDate ? formatSafeDate(hp.startDate) : ''}
                                </p>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] uppercase ${hp.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {hp.status === 'completed' ? 'Xong' : 'Hủy'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 text-center py-2">Chưa có lộ trình lịch sử</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card p-8 text-center text-neutral-400 bg-white">
                  <Compass className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium text-sm">Người dùng này chưa có lộ trình dinh dưỡng AI nào.</p>
                </div>
              )}
            </div>
          )}

          {modalTab === 'logs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily summaries (nutrition logs) */}
              <div className="card p-5 bg-white space-y-4">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-emerald-500" /> Nhật ký Dinh dưỡng (10 ngày qua)
                </h3>
                {sortedSummaries.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {sortedSummaries.map((s, idx) => (
                      <div key={idx} className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-neutral-700 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-neutral-400" /> {s.dateKey}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-white p-1.5 rounded border border-neutral-200/60 text-center">
                            <span className="block text-[10px] text-neutral-400">Calo</span>
                            <span className="font-bold text-neutral-800">{Math.round(s.intakeCalories || 0)} kcal</span>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-neutral-200/60 text-center">
                            <span className="block text-[10px] text-neutral-400">Đạm</span>
                            <span className="font-bold text-neutral-800">{Math.round(s.intakeProtein || 0)}g</span>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-neutral-200/60 text-center">
                            <span className="block text-[10px] text-neutral-400">Tinh bột</span>
                            <span className="font-bold text-neutral-800">{Math.round(s.intakeCarbs || 0)}g</span>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-neutral-200/60 text-center">
                            <span className="block text-[10px] text-neutral-400">Béo</span>
                            <span className="font-bold text-neutral-800">{Math.round(s.intakeFats || 0)}g</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 text-center py-6">Người dùng chưa ghi nhật ký bữa ăn nào</p>
                )}
              </div>

              {/* Workout logs */}
              <div className="card p-5 bg-white space-y-4">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-500" /> Nhật ký Vận động (10 ngày qua)
                </h3>
                {sortedActivities.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {sortedActivities.map((a, idx) => (
                      <div key={idx} className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <p className="font-bold text-neutral-800 text-sm flex items-center gap-1">
                            <span>{a.activityType?.icon || '🏃'}</span>
                            {a.activityType?.name || 'Hoạt động thể chất'}
                          </p>
                          <div className="flex gap-2 text-xs text-neutral-500">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.durationMinutes || 0} phút</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {a.dateKey}</span>
                          </div>
                        </div>
                        <div className="bg-red-50 border border-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold text-center">
                          -{Math.round(a.caloriesBurned || 0)} kcal
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 text-center py-6">Người dùng chưa ghi hoạt động thể thao nào</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="block text-xs text-neutral-400 font-medium">{label}</span>
      <span className="text-sm font-semibold text-neutral-800">{value}</span>
    </div>
  );
}

function NutritionMetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-neutral-100 text-sm">
      <span className="text-neutral-500">{label}:</span>
      <span className="font-bold text-neutral-800">{value}</span>
    </div>
  );
}
