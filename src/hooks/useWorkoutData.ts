import { useState, useEffect } from 'react';
import { WorkoutData, WorkoutDay, Workout, WorkoutSet } from '../types/workout';
import { WorkoutService } from '../services/workoutService';

export const useWorkoutData = (userId: string) => {
  const [data, setData] = useState<WorkoutData>({
    userId,
    days: [],
    selectedDayId: null,
    selectedDate: new Date().toISOString().split('T')[0],
    workoutHistory: {}
  });
  const [loading, setLoading] = useState(true);

  // Load data from Supabase when component mounts or user changes
  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      
      setLoading(true);
      const workoutData = await WorkoutService.loadWorkoutData(userId);
      setData(workoutData);
      setLoading(false);
    };

    loadData();
  }, [userId]);

  const selectDay = (dayId: string) => {
    setData(prev => ({
      ...prev,
      selectedDayId: dayId
    }));
  };

  const markDayCompleted = async (dayId: string) => {
    const success = await WorkoutService.markDayCompleted(userId, dayId);
    if (success) {
      setData(prev => ({
        ...prev,
        days: prev.days.map(day =>
          day.id === dayId
            ? { ...day, completedAt: new Date().toISOString() }
            : day
        )
      }));
    }
  };

  const updateWorkoutSets = async (dayId: string, workoutId: string, sets: WorkoutSet[]) => {
    // Update local state immediately for responsiveness
    setData(prev => ({
      ...prev,
      days: prev.days.map(day =>
        day.id === dayId
          ? {
              ...day,
              workouts: day.workouts.map(workout =>
                workout.id === workoutId
                  ? { ...workout, todaySets: sets }
                  : workout
              )
            }
          : day
      )
    }));

    // Save to database
    await WorkoutService.saveWorkoutSets(userId, dayId, workoutId, sets);
  };

  const toggleWorkoutCompleted = async (dayId: string, workoutId: string) => {
    setData(prev => ({
      ...prev,
      days: prev.days.map(day =>
        day.id === dayId
          ? {
              ...day,
              workouts: day.workouts.map(workout =>
                workout.id === workoutId
                  ? { ...workout, completed: !workout.completed }
                  : workout
              )
            }
          : day
      )
    }));
  };

  const addDay = async (name: string) => {
    const dayId = await WorkoutService.addWorkoutDay(userId, name);
    if (dayId) {
      const newDay: WorkoutDay = {
        id: dayId,
        name,
        workouts: []
      };
      setData(prev => ({
        ...prev,
        days: [...prev.days, newDay]
      }));
    }
  };

  const removeDay = async (dayId: string) => {
    const success = await WorkoutService.removeWorkoutDay(dayId);
    if (success) {
      setData(prev => ({
        ...prev,
        days: prev.days.filter(day => day.id !== dayId),
        selectedDayId: prev.selectedDayId === dayId ? null : prev.selectedDayId
      }));
    }
  };

  const addWorkout = async (dayId: string, workout: Omit<Workout, 'id' | 'todaySets' | 'completed'>) => {
    const workoutId = await WorkoutService.addWorkout(dayId, workout);
    if (workoutId) {
      const newWorkout: Workout = {
        ...workout,
        id: workoutId,
        todaySets: [],
        completed: false
      };
      setData(prev => ({
        ...prev,
        days: prev.days.map(day =>
          day.id === dayId
            ? { ...day, workouts: [...day.workouts, newWorkout] }
            : day
        )
      }));
    }
  };

  const removeWorkout = async (dayId: string, workoutId: string) => {
    const success = await WorkoutService.removeWorkout(workoutId);
    if (success) {
      setData(prev => ({
        ...prev,
        days: prev.days.map(day =>
          day.id === dayId
            ? { ...day, workouts: day.workouts.filter(w => w.id !== workoutId) }
            : day
        )
      }));
    }
  };

  const updateWorkout = async (dayId: string, workoutId: string, updates: Partial<Workout>) => {
    // Update local state immediately
    setData(prev => ({
      ...prev,
      days: prev.days.map(day =>
        day.id === dayId
          ? {
              ...day,
              workouts: day.workouts.map(workout =>
                workout.id === workoutId
                  ? { ...workout, ...updates }
                  : workout
              )
            }
          : day
      )
    }));

    // Save to database
    await WorkoutService.updateWorkout(workoutId, updates);
  };

  return {
    data,
    loading,
    selectDay,
    markDayCompleted,
    updateWorkoutSets,
    toggleWorkoutCompleted,
    addDay,
    removeDay,
    addWorkout,
    removeWorkout,
    updateWorkout
  };
};