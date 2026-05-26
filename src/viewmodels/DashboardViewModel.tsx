import { useState, useEffect, useCallback } from 'react';
import {
  fetchUsers,
  fetchUserDailySummaries,
  fetchUserHistoryPlans,
  fetchUserPlan,
  fetchUserActivities,
  fetchUserMeals,
} from '../services/firebase';
import { UserModel } from '../models/User';

export interface UserDetailData {
  user: UserModel;
  summaries: any[];
  currentPlan: any | null;
  historyPlans: any[];
  activities: any[];
  meals: any[];
  stats: {
    avgCaloriesIn: number;
    avgProteinIn: number;
    avgCarbsIn: number;
    avgFatsIn: number;
    avgCaloriesBurned: number;
    totalWorkouts: number;
    avgWorkoutDuration: number;
    weightProgress: number | null; // null if no plan
  };
}

export function useDashboardViewModel() {
  const [detailedUsers, setDetailedUsers] = useState<UserDetailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rawUsers = await fetchUsers();
      const usersList = rawUsers.map(u => new UserModel(u));

      const fullDetails: UserDetailData[] = await Promise.all(
        usersList.map(async (user) => {
          try {
            const [summaries, currentPlan, historyPlans, activities, meals] = await Promise.all([
              fetchUserDailySummaries(user.userId).catch(() => []),
              fetchUserPlan(user.userId).catch(() => null),
              fetchUserHistoryPlans(user.userId).catch(() => []),
              fetchUserActivities(user.userId).catch(() => []),
              fetchUserMeals(user.userId).catch(() => []),
            ]);

            // Calculate user stats
            const avgCaloriesIn = summaries.length > 0
              ? summaries.reduce((acc, s) => acc + (s.intakeCalories || 0), 0) / summaries.length
              : 0;
            const avgProteinIn = summaries.length > 0
              ? summaries.reduce((acc, s) => acc + (s.intakeProtein || 0), 0) / summaries.length
              : 0;
            const avgCarbsIn = summaries.length > 0
              ? summaries.reduce((acc, s) => acc + (s.intakeCarbs || 0), 0) / summaries.length
              : 0;
            const avgFatsIn = summaries.length > 0
              ? summaries.reduce((acc, s) => acc + (s.intakeFats || 0), 0) / summaries.length
              : 0;
            const avgCaloriesBurned = summaries.length > 0
              ? summaries.reduce((acc, s) => acc + (s.burnedCalories || 0), 0) / summaries.length
              : 0;

            const totalWorkouts = activities.length;
            const avgWorkoutDuration = activities.length > 0
              ? activities.reduce((acc, a) => acc + (a.durationMinutes || 0), 0) / activities.length
              : 0;

            // Calculate Weight Progress Safely
            let weightProgress: number | null = null;
            if (currentPlan) {
              const startWeightRaw = currentPlan.currentWeight ?? user.weight;
              const targetWeightRaw = currentPlan.targetWeight;
              const actualWeightRaw = user.weight;

              if (startWeightRaw != null && targetWeightRaw != null && actualWeightRaw != null) {
                const startWeight = Number(startWeightRaw);
                const targetWeight = Number(targetWeightRaw);
                const actualWeight = Number(actualWeightRaw);

                if (!isNaN(startWeight) && !isNaN(targetWeight) && !isNaN(actualWeight)) {
                  if (startWeight === targetWeight) {
                    weightProgress = 100;
                  } else if (startWeight > targetWeight) {
                    // Lose weight goal
                    if (actualWeight <= targetWeight) weightProgress = 100;
                    else if (actualWeight >= startWeight) weightProgress = 0;
                    else weightProgress = ((startWeight - actualWeight) / (startWeight - targetWeight)) * 100;
                  } else {
                    // Gain weight goal
                    if (actualWeight >= targetWeight) weightProgress = 100;
                    else if (actualWeight <= startWeight) weightProgress = 0;
                    else weightProgress = ((actualWeight - startWeight) / (targetWeight - startWeight)) * 100;
                  }
                }
              }
            }

            // Ensure weightProgress is not NaN
            if (weightProgress !== null && isNaN(weightProgress)) {
              weightProgress = null;
            }

            return {
              user,
              summaries,
              currentPlan,
              historyPlans,
              activities,
              meals,
              stats: {
                avgCaloriesIn: Math.round(avgCaloriesIn),
                avgProteinIn: Math.round(avgProteinIn * 10) / 10,
                avgCarbsIn: Math.round(avgCarbsIn * 10) / 10,
                avgFatsIn: Math.round(avgFatsIn * 10) / 10,
                avgCaloriesBurned: Math.round(avgCaloriesBurned),
                totalWorkouts,
                avgWorkoutDuration: Math.round(avgWorkoutDuration),
                weightProgress: weightProgress !== null ? Math.round(weightProgress) : null,
              },
            };
          } catch (err) {
            console.error('Error loading subcollections for user:', user.userId, err);
            return {
              user,
              summaries: [],
              currentPlan: null,
              historyPlans: [],
              activities: [],
              meals: [],
              stats: {
                avgCaloriesIn: 0,
                avgProteinIn: 0,
                avgCarbsIn: 0,
                avgFatsIn: 0,
                avgCaloriesBurned: 0,
                totalWorkouts: 0,
                avgWorkoutDuration: 0,
                weightProgress: null,
              },
            };
          }
        })
      );

      setDetailedUsers(fullDetails);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu thống kê từ hệ thống.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Aggregate System Stats ---
  const totalUsers = detailedUsers.length;

  const usersWithActivePlan = detailedUsers.filter(du => du.currentPlan?.isActive).length;

  // History plan completion rate
  let totalHistoryPlans = 0;
  let completedHistoryPlans = 0;
  detailedUsers.forEach(du => {
    du.historyPlans.forEach(hp => {
      totalHistoryPlans++;
      if (hp.status === 'completed') {
        completedHistoryPlans++;
      }
    });
  });
  const planCompletionRate = totalHistoryPlans > 0
    ? Math.round((completedHistoryPlans / totalHistoryPlans) * 100)
    : 0;

  // Average weight progress across users with active plans and valid progress
  const usersWithProgress = detailedUsers.filter(du => du.stats.weightProgress !== null);
  const avgWeightProgress = usersWithProgress.length > 0
    ? Math.round(usersWithProgress.reduce((acc, du) => acc + (du.stats.weightProgress || 0), 0) / usersWithProgress.length)
    : 0;

  // Nutrition averages across all daily summaries
  let totalSummariesCount = 0;
  let sumCalories = 0;
  let sumProtein = 0;
  let sumCarbs = 0;
  let sumFats = 0;
  let sumBurnedCalories = 0;

  detailedUsers.forEach(du => {
    du.summaries.forEach(s => {
      totalSummariesCount++;
      sumCalories += s.intakeCalories || 0;
      sumProtein += s.intakeProtein || 0;
      sumCarbs += s.intakeCarbs || 0;
      sumFats += s.intakeFats || 0;
      sumBurnedCalories += s.burnedCalories || 0;
    });
  });

  const sysAvgNutrition = {
    calories: totalSummariesCount > 0 ? Math.round(sumCalories / totalSummariesCount) : 0,
    protein: totalSummariesCount > 0 ? Math.round((sumProtein / totalSummariesCount) * 10) / 10 : 0,
    carbs: totalSummariesCount > 0 ? Math.round((sumCarbs / totalSummariesCount) * 10) / 10 : 0,
    fats: totalSummariesCount > 0 ? Math.round((sumFats / totalSummariesCount) * 10) / 10 : 0,
    burnedCalories: totalSummariesCount > 0 ? Math.round(sumBurnedCalories / totalSummariesCount) : 0,
  };

  // Habit: Goal Distribution
  const goalCounts = detailedUsers.reduce<Record<string, number>>((acc, du) => {
    const goal = du.user.displayGoal || 'Không rõ';
    acc[goal] = (acc[goal] || 0) + 1;
    return acc;
  }, {});
  const goalChartData = Object.entries(goalCounts).map(([name, value]) => ({ name, value }));

  // Habit: Activity Level Distribution
  const activityLevelCounts = detailedUsers.reduce<Record<string, number>>((acc, du) => {
    const level = du.user.displayActivityLevel || 'Không rõ';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});
  const activityLevelChartData = Object.entries(activityLevelCounts).map(([name, value]) => ({ name, value }));

  // Habit: Meal types distribution
  const mealTypeCounts: Record<string, number> = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  };
  detailedUsers.forEach(du => {
    du.meals.forEach(m => {
      const type = m.mealType || 'snack';
      if (type in mealTypeCounts) {
        mealTypeCounts[type]++;
      } else {
        mealTypeCounts['snack']++;
      }
    });
  });
  const mealTypeMap: Record<string, string> = {
    breakfast: 'Bữa sáng',
    lunch: 'Bữa trưa',
    dinner: 'Bữa tối',
    snack: 'Bữa phụ',
  };
  const mealTypeChartData = Object.entries(mealTypeCounts).map(([key, value]) => ({
    name: mealTypeMap[key] || key,
    value,
  }));

  // Habit: Workout/Activities Popularity
  const activityCounts: Record<string, number> = {};
  detailedUsers.forEach(du => {
    du.activities.forEach(a => {
      const name = a.activityType?.name || 'Vận động khác';
      activityCounts[name] = (activityCounts[name] || 0) + 1;
    });
  });
  const activityPopularityData = Object.entries(activityCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // New Users by Month
  const usersByMonth = detailedUsers.reduce<Record<string, number>>((acc, du) => {
    if (!du.user.createdAt) return acc;
    const date = 'toDate' in du.user.createdAt ? du.user.createdAt.toDate() : new Date(du.user.createdAt as Date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const monthlyChartData = Object.entries(usersByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  return {
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
    refresh: loadData,
  };
}
