import React, { useState } from 'react';
import { WorkoutData, Workout, RepRange } from '../types/workout';
import { Plus, Trash2, Edit3, Settings, ChevronDown, ChevronUp } from 'lucide-react';

interface RoutineTabProps {
  data: WorkoutData;
  onAddDay: (name: string) => void;
  onRemoveDay: (dayId: string) => void;
  onAddWorkout: (dayId: string, workout: Omit<Workout, 'id' | 'todaySets' | 'completed'>) => void;
  onRemoveWorkout: (dayId: string, workoutId: string) => void;
  onUpdateWorkout: (dayId: string, workoutId: string, updates: Partial<Workout>) => void;
}

const formatRepRange = (repRange: RepRange): string => {
  if (repRange.max && repRange.max !== repRange.min) {
    return `${repRange.min}-${repRange.max}`;
  }
  return repRange.min.toString();
};

const parseRepInput = (input: string): RepRange => {
  const trimmed = input.trim();
  if (trimmed.includes('-')) {
    const [min, max] = trimmed.split('-').map(n => parseInt(n.trim()));
    return { min: min || 1, max: max || min || 1 };
  }
  const num = parseInt(trimmed) || 1;
  return { min: num };
};
export const RoutineTab: React.FC<RoutineTabProps> = ({
  data,
  onAddDay,
  onRemoveDay,
  onAddWorkout,
  onRemoveWorkout,
  onUpdateWorkout
}) => {
  const [newDayName, setNewDayName] = useState('');
  const [showAddDay, setShowAddDay] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<string | null>(null);
  const [showAddWorkout, setShowAddWorkout] = useState<string | null>(null);
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    defaultSets: 3,
    defaultReps: '8-12',
    machineSetupNotes: ''
  });

  const handleAddDay = () => {
    if (newDayName.trim()) {
      onAddDay(newDayName.trim());
      setNewDayName('');
      setShowAddDay(false);
    }
  };

  const handleAddWorkout = (dayId: string) => {
    if (newWorkout.name.trim()) {
      onAddWorkout(dayId, newWorkout);
      setNewWorkout({ name: '', defaultSets: 3, defaultReps: '8-12', machineSetupNotes: '' });
        defaultReps: parseRepInput(newWorkout.defaultReps)
    }
  };

  const [editingReps, setEditingReps] = useState<string>('');

  const startEditingWorkout = (workout: Workout) => {
    setEditingWorkout(workout.id);
    setEditingReps(formatRepRange(workout.defaultReps));
  };

  const saveWorkoutEdit = (dayId: string, workoutId: string) => {
    onUpdateWorkout(dayId, workoutId, {
      defaultReps: parseRepInput(editingReps)
    });
    setEditingWorkout(null);
    setEditingReps('');
  };
  return (
    <div className="p-4 pb-20">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Routine</h1>
      </div>

      {/* Add Day Section */}
      <div className="mb-6">
        {!showAddDay ? (
          <button
            onClick={() => setShowAddDay(true)}
            className="flex items-center space-x-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
          >
            <Plus className="h-5 w-5 text-gray-500" />
            <span className="text-gray-600">Add New Workout Day</span>
          </button>
        ) : (
          <div className="bg-white border-2 border-blue-400 rounded-lg p-4">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter day name (e.g., Push, Pull, Legs)"
                value={newDayName}
                onChange={(e) => setNewDayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleAddDay}
                  disabled={!newDayName.trim()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  Add Day
                </button>
                <button
                  onClick={() => {
                    setShowAddDay(false);
                    setNewDayName('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Days List */}
      <div className="space-y-4">
        {data.days.map((day) => (
          <div key={day.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {expandedDay === day.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  <div>
                    <h3 className="font-semibold text-gray-900">{day.name}</h3>
                    <p className="text-sm text-gray-500">
                      {day.workouts.length} exercise{day.workouts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveDay(day.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {expandedDay === day.id && (
                <div className="mt-4 space-y-4">
                  {/* Workouts List */}
                  {day.workouts.map((workout) => (
                    <div key={workout.id} className="bg-gray-50 rounded-lg p-3">
                      {editingWorkout === workout.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={workout.name}
                            onChange={(e) => onUpdateWorkout(day.id, workout.id, { name: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Sets</label>
                              <input
                                type="number"
                                value={workout.defaultSets}
                                onChange={(e) => onUpdateWorkout(day.id, workout.id, { defaultSets: parseInt(e.target.value) || 1 })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Reps (e.g., 8 or 8-12)</label>
                              <input
                                type="text"
                                value={editingReps}
                                onChange={(e) => setEditingReps(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="8-12"
                              />
                            </div>
                          </div>
                          <textarea
                            placeholder="Machine setup notes (optional)"
                            value={workout.machineSetupNotes}
                            onChange={(e) => onUpdateWorkout(day.id, workout.id, { machineSetupNotes: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={2}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => saveWorkoutEdit(day.id, workout.id)}
                              className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingWorkout(null);
                                setEditingReps('');
                              }}
                              className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 text-sm rounded-md hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{workout.name}</h4>
                            <p className="text-sm text-gray-600">
                              {workout.defaultSets} × {formatRepRange(workout.defaultReps)}
                            </p>
                            {workout.machineSetupNotes && (
                              <p className="text-xs text-gray-500 mt-1">{workout.machineSetupNotes}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditingWorkout(workout)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onRemoveWorkout(day.id, workout.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Workout */}
                  {showAddWorkout === day.id ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Exercise name"
                          value={newWorkout.name}
                          onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Default Sets</label>
                            <input
                              type="number"
                              value={newWorkout.defaultSets}
                              onChange={(e) => setNewWorkout({ ...newWorkout, defaultSets: parseInt(e.target.value) || 1 })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Default Reps (e.g., 8 or 8-12)</label>
                            <input
                              type="text"
                              value={newWorkout.defaultReps}
                              onChange={(e) => setNewWorkout({ ...newWorkout, defaultReps: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="8-12"
                            />
                          </div>
                        </div>
                        <textarea
                          placeholder="Machine setup notes (optional)"
                          value={newWorkout.machineSetupNotes}
                          onChange={(e) => setNewWorkout({ ...newWorkout, machineSetupNotes: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddWorkout(day.id)}
                            disabled={!newWorkout.name.trim()}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                          >
                            Add Exercise
                          </button>
                          <button
                            onClick={() => {
                              setShowAddWorkout(null);
                              setNewWorkout({ name: '', defaultSets: 3, defaultReps: '8-12', machineSetupNotes: '' });
                            }}
                            className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 text-sm rounded-md hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddWorkout(day.id)}
                      className="flex items-center space-x-2 w-full p-3 border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 text-sm">Add Exercise</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.days.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No workout days created yet.</p>
          <p className="text-sm text-gray-400 mt-1">Add your first workout day above!</p>
        </div>
      )}
    </div>
  );
};