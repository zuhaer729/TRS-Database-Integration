import { WorkoutData, WorkoutDay, Workout, User } from '../types/workout';

const STORAGE_KEY = 'workout_tracker_data';
const USERS_KEY = 'workout_tracker_users';

const defaultUsers: User[] = [
  { id: 'afnan', name: 'Afnan', sequence: 'AF2024' },
  { id: 'zuhaer', name: 'Zuhaer', sequence: 'ZU2024' }
];

const createDefaultData = (userId: string): WorkoutData => ({
  userId,
  days: [
    {
      id: 'push',
      name: 'Push',
      workouts: [
        {
          id: 'bench-press',
          name: 'Bench Press',
          defaultSets: 4,
          defaultReps: { min: 6, max: 8 },
          machineSetupNotes: 'Adjust bench to flat position, ensure proper bar path',
          todaySets: [],
          previousSets: [
            { reps: 8, weight: 60, completed: true },
            { reps: 8, weight: 60, completed: true },
            { reps: 6, weight: 65, completed: true },
            { reps: 5, weight: 65, completed: true }
          ],
          completed: false
        },
        {
          id: 'shoulder-press',
          name: 'Shoulder Press',
          defaultSets: 3,
          defaultReps: { min: 8, max: 12 },
          machineSetupNotes: 'Seat height at shoulder level, back support engaged',
          todaySets: [],
          previousSets: [
            { reps: 10, weight: 35, completed: true },
            { reps: 9, weight: 37.5, completed: true },
            { reps: 8, weight: 37.5, completed: true }
          ],
          completed: false
        }
      ]
    },
    {
      id: 'pull',
      name: 'Pull',
      workouts: [
        {
          id: 'lat-pulldown',
          name: 'Lat Pulldown',
          defaultSets: 4,
          defaultReps: { min: 8, max: 12 },
          machineSetupNotes: 'Wide grip, slight lean back, pull to upper chest',
          todaySets: [],
          previousSets: [
            { reps: 10, weight: 55, completed: true },
            { reps: 10, weight: 60, completed: true },
            { reps: 8, weight: 65, completed: true },
            { reps: 7, weight: 65, completed: true }
          ],
          completed: false
        }
      ]
    },
    {
      id: 'legs',
      name: 'Legs',
      workouts: [
        {
          id: 'squats',
          name: 'Squats',
          defaultSets: 4,
          defaultReps: { min: 10, max: 15 },
          machineSetupNotes: 'Bar at shoulder height, feet shoulder-width apart',
          todaySets: [],
          previousSets: [
            { reps: 12, weight: 85, completed: true },
            { reps: 12, weight: 90, completed: true },
            { reps: 10, weight: 95, completed: true },
            { reps: 8, weight: 95, completed: true }
          ],
          completed: false
        }
      ]
    }
  ],
  selectedDayId: null,
  selectedDate: new Date().toISOString().split('T')[0],
  workoutHistory: {}
});

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const authenticateUser = (sequence: string): User | null => {
  const users = getUsers();
  return users.find(user => user.sequence === sequence) || null;
};

export const saveWorkoutData = (data: WorkoutData): void => {
  const key = `${STORAGE_KEY}_${data.userId}`;
  localStorage.setItem(key, JSON.stringify(data));
};

export const loadWorkoutData = (userId: string): WorkoutData => {
  const key = `${STORAGE_KEY}_${userId}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const today = new Date().toISOString().split('T')[0];
      
      // If it's a new day, save yesterday's data to history and reset for today
      if (parsed.selectedDate !== today) {
        // Save previous day's data to history if there was progress
        if (parsed.selectedDayId && parsed.selectedDate) {
          const selectedDay = parsed.days.find((day: WorkoutDay) => day.id === parsed.selectedDayId);
          if (selectedDay && selectedDay.workouts.some((w: Workout) => w.todaySets.length > 0)) {
            parsed.workoutHistory[parsed.selectedDate] = JSON.parse(JSON.stringify(parsed.days));
          }
        }
        
        // Move today's sets to previous sets and reset for new day
        parsed.days.forEach((day: WorkoutDay) => {
          day.workouts.forEach((workout: Workout) => {
            if (workout.todaySets.length > 0) {
              workout.previousSets = [...workout.todaySets];
            }
            workout.todaySets = [];
            workout.completed = false;
          });
          day.completedAt = undefined;
        });
        
        parsed.selectedDate = today;
        // Keep the selected day for convenience
      }
      return parsed;
    } catch {
      return createDefaultData(userId);
    }
  }
  return createDefaultData(userId);
};

export const getCurrentUser = (): string | null => {
  return localStorage.getItem('current_user');
};

export const setCurrentUser = (userId: string): void => {
  localStorage.setItem('current_user', userId);
};

export const logout = (): void => {
  localStorage.removeItem('current_user');
};