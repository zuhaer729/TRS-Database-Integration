import React from 'react';
import { WorkoutData } from '../types/workout';
import { DaySelector } from './DaySelector';
import { WorkoutItem } from './WorkoutItem';
import { Trophy, CheckCircle, Loader2 } from 'lucide-react';

interface TrackTabProps {
  data: WorkoutData;
  loading: boolean;
  onSelectDay: (dayId: string) => void;
  onMarkDayCompleted: (dayId: string) => void;
  onUpdateWorkoutSets: (dayId: string, workoutId: string, sets: any[]) => void;
  onToggleWorkoutCompleted: (dayId: string, workoutId: string) => void;
}

export const TrackTab: React.FC<TrackTabProps> = ({
  data,
  loading,
  onSelectDay,
  onMarkDayCompleted,
  onUpdateWorkoutSets,
  onToggleWorkoutCompleted
}) => {
  const selectedDay = data.days.find(day => day.id === data.selectedDayId);
  const allWorkoutsCompleted = selectedDay?.workouts.length > 0 && selectedDay.workouts.every(w => w.completed);
  const hasAnyProgress = selectedDay?.workouts.some(w => w.todaySets.length > 0);

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="flex items-center space-x-3 mb-6">
          <Trophy className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Track Workout</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-gray-600">Loading your workout data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center space-x-3 mb-6">
        <Trophy className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Track Workout</h1>
      </div>

      <DaySelector
        days={data.days}
        selectedDayId={data.selectedDayId}
        onSelectDay={onSelectDay}
      />

      {selectedDay && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedDay.name} Workout
            </h2>
            <div className="text-sm text-gray-500">
              {selectedDay.workouts.filter(w => w.completed).length}/{selectedDay.workouts.length} completed
            </div>
          </div>

          {/* Completion Status */}
          {selectedDay.completedAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Workout Completed!</p>
                  <p className="text-sm text-green-600">
                    Finished at {new Date(selectedDay.completedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          {selectedDay.workouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No exercises added to this day yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Go to Routine tab to add exercises.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {selectedDay.workouts.map((workout) => (
                  <WorkoutItem
                    key={workout.id}
                    workout={workout}
                    onUpdateSets={(sets) => onUpdateWorkoutSets(selectedDay.id, workout.id, sets)}
                    onToggleCompleted={() => onToggleWorkoutCompleted(selectedDay.id, workout.id)}
                  />
                ))}
              </div>

              {/* Done Button */}
              {hasAnyProgress && !selectedDay.completedAt && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => onMarkDayCompleted(selectedDay.id)}
                    disabled={!allWorkoutsCompleted}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-3 ${
                      allWorkoutsCompleted
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span>Mark Workout Complete</span>
                  </button>
                  {!allWorkoutsCompleted && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Complete all exercises to finish your workout
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};