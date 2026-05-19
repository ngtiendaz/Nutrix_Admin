import { useDashboardViewModel } from '../../viewmodels/DashboardViewModel';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Users, Target, UserPlus, Activity } from 'lucide-react';

const GOAL_COLORS = ['#4A7C59', '#E8F0E9', '#8CAB90', '#D4E3D6', '#3D6A4A'];

export default function DashboardPage() {
  const { totalUsers, goalChartData, monthlyChartData, loading, error } = useDashboardViewModel();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Tổng quan hệ thống Nutrix</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Tổng người dùng"
          value={totalUsers}
          color="primary"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Mục tiêu phổ biến"
          value={goalChartData.length > 0
            ? goalChartData.reduce((a, b) => a.value > b.value ? a : b).name
            : '—'}
          color="primary"
        />
        <StatCard
          icon={<UserPlus className="w-5 h-5" />}
          label="Tháng này"
          value={monthlyChartData.length > 0
            ? monthlyChartData[monthlyChartData.length - 1].count
            : 0}
          color="primary"
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Số mục tiêu"
          value={goalChartData.length}
          color="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goal Distribution */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Phân bố mục tiêu</h2>
          {goalChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={goalChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {goalChartData.map((_, i) => (
                    <Cell key={i} fill={GOAL_COLORS[i % GOAL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-neutral-400">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* New Users Per Month */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Người dùng mới theo tháng</h2>
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#787878" />
                <YAxis tick={{ fontSize: 12 }} stroke="#787878" />
                <Tooltip />
                <Bar dataKey="count" fill="#4A7C59" radius={[4, 4, 0, 0]} name="Người dùng mới" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-neutral-400">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const iconBgMap: Record<string, string> = { primary: 'bg-primary-500' };
  const textMap: Record<string, string> = { primary: 'text-primary-700' };

  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`${iconBgMap[color]} text-white p-2.5 rounded-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-neutral-500">{label}</p>
        <p className={`text-2xl font-bold ${textMap[color]} mt-0.5`}>{value}</p>
      </div>
    </div>
  );
}
