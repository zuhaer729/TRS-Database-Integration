import React, { useState } from 'react';
import { Workout, WorkoutSet, RepRange } from '../types/workout';
import { Check, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';

interface WorkoutItemProps {
  workout: Workout;
  onUpdateSets: (sets: WorkoutSet[]) => void;
  onToggleCompleted: () => void;
}

const formatRepRange = (repRange: RepRange): string => {
  if (repRange.max && repRange.max !== repRange.min) {
    return `${repRange.min}-${repRange.max}`;
  }
  return repRange.min.toString();
};
export const WorkoutItem: React.FC<WorkoutItemProps> = ({
  workout,
  onUpdateSets,
  onToggleCompleted
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sets, setSets] = useState<WorkoutSet[]>(() => {
    if (workout.todaySets.length > 0) {
      return workout.todaySets;
    }
    return Array.from({ length: workout.defaultSets }, () => ({
      reps: workout.defaultReps.min,
      weight: 0,
      completed: false
    }));
  });

  const updateSet = (index: number, field: keyof WorkoutSet, value: number | boolean) => {
    const newSets = sets.map((set, i) =>
      i === index ? { ...set, [field]: value } : set
    );
    setSets(newSets);
    onUpdateSets(newSets);
  };

  const addSet = () => {
    const newSet: WorkoutSet = {
      reps: workout.defaultReps.min,
      weight: sets[sets.length - 1]?.weight || 0,
      completed: false
    };
    const newSets = [...sets, newSet];
    setSets(newSets);
    onUpdateSets(newSets);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      const newSets = sets.filter((_, i) => i !== index);
      setSets(newSets);
      onUpdateSets(newSets);
    }
  };

  const completedSets = sets.filter(set => set.completed).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleCompleted}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                workout.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {workout.completed && <Check className="h-4 w-4" />}
            </button>
            <div>
              <h3 className={`font-semibold ${workout.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                {workout.name}
              </h3>
              <p className="text-sm text-gray-500">
                {completedSets}/{sets.length} sets • {workout.defaultSets} × {formatRepRange(workout.defaultReps)} default
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Previous Performance */}
            {workout.previousSets && workout.previousSets.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Previous Session</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="font-medium text-gray-600">Set</div>
                    <div className="font-medium text-gray-600">Reps</div>
                    <div className="font-medium text-gray-600">Weight (kg)</div>
                  </div>
                  {workout.previousSets.map((set, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 text-sm mt-2">
                      <div>{index + 1}</div>
                      <div>{set.reps}</div>
                      <div>{set.weight} kg</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's Sets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700">Today's Sets</h4>
                <button
                  onClick={addSet}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Set</span>
                </button>
              </div>
              <div className="space-y-3">
                {sets.map((set, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                    <button
                      onClick={() => updateSet(index, 'completed', !set.completed)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        set.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {set.completed && <Check className="h-3 w-3" />}
                    </button>
                    
                    <div className="font-medium text-gray-600 w-8">
                      {index + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Reps</label>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(index, 'reps', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={set.weight}
                          onChange={(e) => updateSet(index, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {sets.length > 1 && (
                      <button
                        onClick={() => removeSet(index)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Machine Setup Notes */}
            {workout.machineSetupNotes && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Setup Notes</h4>
                <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  {workout.machineSetupNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};