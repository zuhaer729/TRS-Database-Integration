export interface WorkoutSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface RepRange {
  min: number;
  max?: number;
}

export interface Workout {
  id: string;
  name: string;
  defaultSets: number;
  defaultReps: RepRange;
  machineSetupNotes: string;
  todaySets: WorkoutSet[];
  previousSets?: WorkoutSet[];
  completed: boolean;
}

export interface WorkoutDay {
  id: string;
  name: string;
  workouts: Workout[];
  completedAt?: string;
}

export interface WorkoutData {
  days: WorkoutDay[];
  selectedDayId: string | null;
  selectedDate: string;
  userId: string;
  workoutHistory: Record<string, WorkoutDay[]>; // date -> workouts
}

export type TabType = 'track' | 'routine' | 'stats';

export interface User {
  id: string;
  name: string;
  sequence: string;
}