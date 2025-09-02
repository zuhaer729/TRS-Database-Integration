import { useState, useEffect } from 'react';
import { WorkoutData, WorkoutDay, Workout, WorkoutSet } from '../types/workout';
import { saveWorkoutData, loadWorkoutData, getCurrentUser } from '../utils/storage';

export const useWorkoutData = (userId: string) => {
  const [data, setData] = useState<WorkoutData>(() => loadWorkoutData(userId));

  useEffect(() => {
    if (data.userId === userId) {
      saveWorkoutData(data);
    }
  }, [data, userId]);

  // Reload data when user changes
  useEffect(() => {
    setData(loadWorkoutData(userId));
  }, [userId]);

  const selectDay = (dayId: string) => {
    setData(prev => ({
      ...prev,
      selectedDayId: dayId
    }));
  };

  const markDayCompleted = (dayId: string) => {
    setData(prev => ({
      ...prev,
      days: prev.days.map(day =>
        day.id === dayId
          ? { ...day, completedAt: new Date().toISOString() }
          : day
      )
    }));
  };
  const updateWorkoutSets = (dayId: string, workoutId: string, sets: WorkoutSet[]) => {
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
  };

  const toggleWorkoutCompleted = (dayId: string, workoutId: string) => {
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

  const addDay = (name: string) => {
    const newDay: WorkoutDay = {
      id: `day-${Date.now()}`,
      name,
      workouts: []
    };
    setData(prev => ({
      ...prev,
      days: [...prev.days, newDay]
    }));
  };

  const removeDay = (dayId: string) => {
    setData(prev => ({
      ...prev,
      days: prev.days.filter(day => day.id !== dayId),
      selectedDayId: prev.selectedDayId === dayId ? null : prev.selectedDayId
    }));
  };

  const addWorkout = (dayId: string, workout: Omit<Workout, 'id' | 'todaySets' | 'completed'>) => {
    const newWorkout: Workout = {
      ...workout,
      id: `workout-${Date.now()}`,
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
  };

  const removeWorkout = (dayId: string, workoutId: string) => {
    setData(prev => ({
      ...prev,
      days: prev.days.map(day =>
        day.id === dayId
          ? { ...day, workouts: day.workouts.filter(w => w.id !== workoutId) }
          : day
      )
    }));
  };

  const updateWorkout = (dayId: string, workoutId: string, updates: Partial<Workout>) => {
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
  };

  return {
    data,
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