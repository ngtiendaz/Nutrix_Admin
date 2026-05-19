import { useState, useEffect, useCallback } from 'react';
import {
  fetchActivities,
  addActivity,
  updateActivity,
  deleteActivity,
} from '../services/firebase';
import { ActivityModel } from '../models/Activity';

interface ActivityFormData {
  name: string;
  metValue: string;
  icon: string;
}

export function useActivityViewModel() {
  const [activities, setActivities] = useState<ActivityModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingActivity, setEditingActivity] = useState<ActivityModel | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchActivities();
      setActivities(data.map(a => new ActivityModel(a)));
    } catch {
      setError('Không thể tải danh sách hoạt động.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadActivities(); }, [loadActivities]);

  const handleAdd = useCallback(async (formData: ActivityFormData) => {
    try {
      await addActivity({
        name: formData.name,
        metValue: parseFloat(formData.metValue),
        icon: formData.icon,
      });
      setShowForm(false);
      await loadActivities();
    } catch {
      setError('Không thể thêm hoạt động.');
    }
  }, [loadActivities]);

  const handleUpdate = useCallback(async (activityId: string, formData: ActivityFormData) => {
    try {
      await updateActivity(activityId, {
        name: formData.name,
        metValue: parseFloat(formData.metValue),
        icon: formData.icon,
      });
      setEditingActivity(null);
      setShowForm(false);
      await loadActivities();
    } catch {
      setError('Không thể cập nhật hoạt động.');
    }
  }, [loadActivities]);

  const handleDelete = useCallback(async (activityId: string) => {
    try {
      await deleteActivity(activityId);
      await loadActivities();
    } catch {
      setError('Không thể xóa hoạt động.');
    }
  }, [loadActivities]);

  const openCreate = useCallback(() => {
    setEditingActivity(null);
    setShowForm(true);
  }, []);

  const openEdit = useCallback((activity: ActivityModel) => {
    setEditingActivity(activity);
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingActivity(null);
  }, []);

  return {
    activities,
    loading,
    error,
    showForm,
    editingActivity,
    handleAdd,
    handleUpdate,
    handleDelete,
    openCreate,
    openEdit,
    closeForm,
    refresh: loadActivities,
  };
}
