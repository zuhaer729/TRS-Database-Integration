import React from 'react';
import { WorkoutDay } from '../types/workout';
import { Calendar } from 'lucide-react';

interface DaySelectorProps {
  days: WorkoutDay[];
  selectedDayId: string | null;
  onSelectDay: (dayId: string) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  selectedDayId,
  onSelectDay
}) => {
  if (selectedDayId) {
    const selectedDay = days.find(day => day.id === selectedDayId);
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">
              Today's Workout: {selectedDay?.name}
            </span>
          </div>
          <button
            onClick={() => onSelectDay('')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Select Today's Workout</h2>
      <div className="grid grid-cols-2 gap-3">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => onSelectDay(day.id)}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
          >
            <div className="font-semibold text-gray-900">{day.name}</div>
            <div className="text-sm text-gray-500 mt-1">
              {day.workouts.length} exercise{day.workouts.length !== 1 ? 's' : ''}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};