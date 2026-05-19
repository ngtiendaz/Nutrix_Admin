import { useState, useEffect, useCallback } from 'react';
import { fetchUsers } from '../services/firebase';
import { UserModel } from '../models/User';

interface GoalChartItem {
  name: string;
  value: number;
}

interface MonthlyChartItem {
  month: string;
  count: number;
}

export function useDashboardViewModel() {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsers();
      setUsers(data.map(u => new UserModel(u)));
    } catch {
      setError('Không thể tải dữ liệu người dùng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const totalUsers = users.length;

  const goalDistribution = users.reduce<Record<string, number>>((acc, u) => {
    const goal = u.displayGoal || 'Khác';
    acc[goal] = (acc[goal] || 0) + 1;
    return acc;
  }, {});

  const goalChartData: GoalChartItem[] = Object.entries(goalDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const usersByMonth = users.reduce<Record<string, number>>((acc, u) => {
    if (!u.createdAt) return acc;
    const date = 'toDate' in u.createdAt ? u.createdAt.toDate() : new Date(u.createdAt as Date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const monthlyChartData: MonthlyChartItem[] = Object.entries(usersByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  return {
    totalUsers,
    goalChartData,
    monthlyChartData,
    loading,
    error,
    refresh: loadUsers,
  };
}
