import { useState, useEffect, useCallback } from 'react';
import type { DocumentData } from 'firebase/firestore';
import {
  fetchUsers,
  fetchUserMeals,
  fetchUserPlan,
  fetchUserActivities,
} from '../services/firebase';
import { UserModel } from '../models/User';

export function useUserListViewModel() {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsers();
      setUsers(data.map(u => new UserModel(u)));
    } catch {
      setError('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search
      || u.name?.toLowerCase().includes(search.toLowerCase())
      || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesGoal = !goalFilter || u.goal === goalFilter;
    return matchesSearch && matchesGoal;
  });

  return {
    users: filteredUsers,
    loading,
    error,
    search,
    setSearch,
    goalFilter,
    setGoalFilter,
    refresh: loadUsers,
  };
}

export function useUserDetailViewModel(userId: string | undefined) {
  const [user, setUser] = useState<UserModel | null>(null);
  const [meals, setMeals] = useState<DocumentData[]>([]);
  const [plan, setPlan] = useState<DocumentData | null>(null);
  const [userActivities, setUserActivities] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [userData, mealsData, planData, activitiesData] = await Promise.all([
          fetchUsers().then(list => list.find(u => u.id === userId || u.userId === userId)),
          fetchUserMeals(userId),
          fetchUserPlan(userId),
          fetchUserActivities(userId),
        ]);
        if (cancelled) return;
        setUser(userData ? new UserModel(userData) : null);
        setMeals(mealsData);
        setPlan(planData);
        setUserActivities(activitiesData);
      } catch {
        if (!cancelled) setError('Không thể tải thông tin người dùng.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  return { user, meals, plan, userActivities, loading, error };
}
