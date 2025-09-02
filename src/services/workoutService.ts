import { supabase } from '../lib/supabase';
import { WorkoutData, WorkoutDay, Workout, WorkoutSet, RepRange, User } from '../types/workout';

export class WorkoutService {
  static async authenticateUser(sequence: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('sequence', sequence)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        sequence: data.sequence
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  static async loadWorkoutData(userId: string): Promise<WorkoutData> {
    try {
      // Load workout days
      const { data: daysData, error: daysError } = await supabase
        .from('workout_days')
        .select('*')
        .eq('user_id', userId)
        .order('order_index');

      if (daysError) throw daysError;

      // Load workouts for all days
      const dayIds = daysData?.map(day => day.id) || [];
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .in('day_id', dayIds)
        .order('order_index');

      if (workoutsError) throw workoutsError;

      // Load today's session data
      const today = new Date().toISOString().split('T')[0];
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_sets (*)
        `)
        .eq('user_id', userId)
        .eq('session_date', today);

      if (sessionsError) throw sessionsError;

      // Load previous session data (last 30 days for previous sets)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: previousSetsData, error: previousError } = await supabase
        .from('workout_sessions')
        .select(`
          day_id,
          session_date,
          workout_sets (
            workout_id,
            reps,
            weight,
            completed
          )
        `)
        .eq('user_id', userId)
        .gte('session_date', thirtyDaysAgo.toISOString().split('T')[0])
        .lt('session_date', today)
        .order('session_date', { ascending: false });

      if (previousError) throw previousError;

      // Transform data to match existing structure
      const days: WorkoutDay[] = daysData?.map(day => {
        const dayWorkouts = workoutsData?.filter(w => w.day_id === day.id) || [];
        const todaySession = sessionsData?.find(s => s.day_id === day.id);
        
        const workouts: Workout[] = dayWorkouts.map(workout => {
          const todaySets: WorkoutSet[] = todaySession?.workout_sets
            ?.filter((set: any) => set.workout_id === workout.id)
            ?.sort((a: any, b: any) => a.set_number - b.set_number)
            ?.map((set: any) => ({
              reps: set.reps,
              weight: set.weight,
              completed: set.completed
            })) || [];

          // Get most recent previous session for this workout
          const previousSets: WorkoutSet[] = [];
          for (const prevSession of previousSetsData || []) {
            if (prevSession.day_id === day.id) {
              const prevWorkoutSets = prevSession.workout_sets
                ?.filter((set: any) => set.workout_id === workout.id)
                ?.map((set: any) => ({
                  reps: set.reps,
                  weight: set.weight,
                  completed: set.completed
                }));
              
              if (prevWorkoutSets && prevWorkoutSets.length > 0) {
                previousSets.push(...prevWorkoutSets);
                break;
              }
            }
          }

          const defaultReps: RepRange = {
            min: workout.default_reps_min,
            max: workout.default_reps_max || undefined
          };

          return {
            id: workout.id,
            name: workout.name,
            defaultSets: workout.default_sets,
            defaultReps,
            machineSetupNotes: workout.machine_setup_notes,
            todaySets,
            previousSets: previousSets.length > 0 ? previousSets : undefined,
            completed: todaySets.length > 0 && todaySets.every(set => set.completed)
          };
        });

        return {
          id: day.id,
          name: day.name,
          workouts,
          completedAt: todaySession?.completed_at || undefined
        };
      }) || [];

      return {
        userId,
        days,
        selectedDayId: null,
        selectedDate: today,
        workoutHistory: {}
      };
    } catch (error) {
      console.error('Error loading workout data:', error);
      return {
        userId,
        days: [],
        selectedDayId: null,
        selectedDate: new Date().toISOString().split('T')[0],
        workoutHistory: {}
      };
    }
  }

  static async addWorkoutDay(userId: string, name: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('workout_days')
        .insert({
          user_id: userId,
          name,
          order_index: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error adding workout day:', error);
      return null;
    }
  }

  static async removeWorkoutDay(dayId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_days')
        .delete()
        .eq('id', dayId);

      return !error;
    } catch (error) {
      console.error('Error removing workout day:', error);
      return false;
    }
  }

  static async addWorkout(dayId: string, workout: Omit<Workout, 'id' | 'todaySets' | 'completed'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          day_id: dayId,
          name: workout.name,
          default_sets: workout.defaultSets,
          default_reps_min: workout.defaultReps.min,
          default_reps_max: workout.defaultReps.max || null,
          machine_setup_notes: workout.machineSetupNotes,
          order_index: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error adding workout:', error);
      return null;
    }
  }

  static async removeWorkout(workoutId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      return !error;
    } catch (error) {
      console.error('Error removing workout:', error);
      return false;
    }
  }

  static async updateWorkout(workoutId: string, updates: Partial<Workout>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.defaultSets !== undefined) updateData.default_sets = updates.defaultSets;
      if (updates.defaultReps !== undefined) {
        updateData.default_reps_min = updates.defaultReps.min;
        updateData.default_reps_max = updates.defaultReps.max || null;
      }
      if (updates.machineSetupNotes !== undefined) updateData.machine_setup_notes = updates.machineSetupNotes;

      const { error } = await supabase
        .from('workouts')
        .update(updateData)
        .eq('id', workoutId);

      return !error;
    } catch (error) {
      console.error('Error updating workout:', error);
      return false;
    }
  }

  static async saveWorkoutSets(userId: string, dayId: string, workoutId: string, sets: WorkoutSet[]): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get or create today's session
      let { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('day_id', dayId)
        .eq('session_date', today)
        .single();

      if (sessionError && sessionError.code === 'PGRST116') {
        // Session doesn't exist, create it
        const { data: newSession, error: createError } = await supabase
          .from('workout_sessions')
          .insert({
            user_id: userId,
            day_id: dayId,
            session_date: today
          })
          .select()
          .single();

        if (createError) throw createError;
        session = newSession;
      } else if (sessionError) {
        throw sessionError;
      }

      // Delete existing sets for this workout in today's session
      await supabase
        .from('workout_sets')
        .delete()
        .eq('session_id', session.id)
        .eq('workout_id', workoutId);

      // Insert new sets
      if (sets.length > 0) {
        const setsToInsert = sets.map((set, index) => ({
          session_id: session.id,
          workout_id: workoutId,
          set_number: index + 1,
          reps: set.reps,
          weight: set.weight,
          completed: set.completed
        }));

        const { error: insertError } = await supabase
          .from('workout_sets')
          .insert(setsToInsert);

        if (insertError) throw insertError;
      }

      return true;
    } catch (error) {
      console.error('Error saving workout sets:', error);
      return false;
    }
  }

  static async markDayCompleted(userId: string, dayId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('workout_sessions')
        .update({
          completed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('day_id', dayId)
        .eq('session_date', today);

      return !error;
    } catch (error) {
      console.error('Error marking day completed:', error);
      return false;
    }
  }
}