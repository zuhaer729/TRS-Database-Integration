import React from 'react';
import { BarChart3, TrendingUp, Calendar, Clock } from 'lucide-react';

export const StatsTab: React.FC = () => {
  return (
    <div className="p-4 pb-20">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
      </div>

      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-gray-100 rounded-full p-8 mb-6">
          <TrendingUp className="h-16 w-16 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon!</h2>
        <p className="text-gray-500 text-center max-w-sm">
          Track your progress with detailed statistics, charts, and performance analytics.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-sm">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Workout History</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Progress Tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
};