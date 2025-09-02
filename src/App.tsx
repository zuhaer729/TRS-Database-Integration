import React, { useState } from 'react';
import { TabType } from './types/workout';
import { useWorkoutData } from './hooks/useWorkoutData';
import { Login } from './components/Login';
import { TrackTab } from './components/TrackTab';
import { RoutineTab } from './components/RoutineTab';
import { StatsTab } from './components/StatsTab';
import { Trophy, Settings, BarChart3, LogOut, User } from 'lucide-react';
import { User as UserType } from './types/workout';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('track');
  const [currentUser, setCurrentUserState] = useState<UserType | null>(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUserState(JSON.parse(savedUser));
    }
  }, []);

  const workoutData = useWorkoutData(currentUser?.id || '');

  const handleLogin = (user: UserType) => {
    setCurrentUserState(user);
    localStorage.setItem("currentUser", JSON.stringify(user)); // save login
  };

  const handleLogout = () => {
    setCurrentUserState(null);
    setActiveTab('track');
    localStorage.removeItem("currentUser"); // clear login
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }
  
  const workoutData = useWorkoutData(currentUser?.id || '');

  const handleLogin = (user: UserType) => {
    setCurrentUserState(user);
  };

  const handleLogout = () => {
    setCurrentUserState(null);
    setActiveTab('track');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const tabs = [
    { id: 'track' as TabType, name: 'Track', icon: Trophy },
    { id: 'routine' as TabType, name: 'Routine', icon: Settings },
    { id: 'stats' as TabType, name: 'Statistics', icon: BarChart3 },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'track':
        return (
          <TrackTab
            data={workoutData.data}
            loading={workoutData.loading}
            onSelectDay={workoutData.selectDay}
            onMarkDayCompleted={workoutData.markDayCompleted}
            onUpdateWorkoutSets={workoutData.updateWorkoutSets}
            onToggleWorkoutCompleted={workoutData.toggleWorkoutCompleted}
          />
        );
      case 'routine':
        return (
          <RoutineTab
            data={workoutData.data}
            loading={workoutData.loading}
            onAddDay={workoutData.addDay}
            onRemoveDay={workoutData.removeDay}
            onAddWorkout={workoutData.addWorkout}
            onRemoveWorkout={workoutData.removeWorkout}
            onUpdateWorkout={workoutData.updateWorkout}
          />
        );
      case 'stats':
        return <StatsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">Workout Tracker</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>
      {/* Main Content */}
      <main className="min-h-screen pt-0">
        {renderActiveTab()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-inset-bottom">
        <div className="flex justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-0 ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;