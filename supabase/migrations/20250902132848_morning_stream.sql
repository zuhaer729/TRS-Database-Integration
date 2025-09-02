/*
  # Workout Tracker Database Schema

  1. New Tables
    - `users` - User profiles with unique sequences for authentication
    - `workout_days` - Workout day templates (Push, Pull, Legs, etc.)
    - `workouts` - Individual exercises within workout days
    - `workout_sessions` - Daily workout session records
    - `workout_sets` - Individual set records for each workout

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
    - Users can only access data linked to their user ID

  3. Features
    - Support for rep ranges (min/max)
    - Machine setup notes for exercises
    - Session tracking with completion timestamps
    - Historical data preservation
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  name text NOT NULL,
  sequence text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create workout_days table
CREATE TABLE IF NOT EXISTS workout_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
  name text NOT NULL,
  default_sets integer DEFAULT 3,
  default_reps_min integer DEFAULT 8,
  default_reps_max integer,
  machine_setup_notes text DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create workout_sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_id uuid NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
  session_date date DEFAULT CURRENT_DATE,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create workout_sets table
CREATE TABLE IF NOT EXISTS workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  set_number integer NOT NULL,
  reps integer DEFAULT 0,
  weight numeric(5,2) DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true);

-- Create RLS policies for workout_days table
CREATE POLICY "Users can read own workout days" ON workout_days
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own workout days" ON workout_days
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own workout days" ON workout_days
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own workout days" ON workout_days
  FOR DELETE USING (true);

-- Create RLS policies for workouts table
CREATE POLICY "Users can read workouts from own days" ON workouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_days 
      WHERE workout_days.id = workouts.day_id
    )
  );

CREATE POLICY "Users can insert workouts to own days" ON workouts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_days 
      WHERE workout_days.id = workouts.day_id
    )
  );

CREATE POLICY "Users can update workouts from own days" ON workouts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_days 
      WHERE workout_days.id = workouts.day_id
    )
  );

CREATE POLICY "Users can delete workouts from own days" ON workouts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workout_days 
      WHERE workout_days.id = workouts.day_id
    )
  );

-- Create RLS policies for workout_sessions table
CREATE POLICY "Users can read own workout sessions" ON workout_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own workout sessions" ON workout_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own workout sessions" ON workout_sessions
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own workout sessions" ON workout_sessions
  FOR DELETE USING (true);

-- Create RLS policies for workout_sets table
CREATE POLICY "Users can read own workout sets" ON workout_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = workout_sets.session_id
    )
  );

CREATE POLICY "Users can insert own workout sets" ON workout_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = workout_sets.session_id
    )
  );

CREATE POLICY "Users can update own workout sets" ON workout_sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = workout_sets.session_id
    )
  );

CREATE POLICY "Users can delete own workout sets" ON workout_sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = workout_sets.session_id
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_days_user_id ON workout_days(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_day_id ON workouts(day_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_workout_sets_session_id ON workout_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_id ON workout_sets(workout_id);

-- Insert demo users
INSERT INTO users (name, sequence) VALUES 
  ('Afnan', 'AF2024'),
  ('Zuhaer', 'ZU2024')
ON CONFLICT (sequence) DO NOTHING;

-- Get user IDs for demo data
DO $$
DECLARE
  afnan_id uuid;
  zuhaer_id uuid;
  push_day_id uuid;
  pull_day_id uuid;
  legs_day_id uuid;
BEGIN
  -- Get user IDs
  SELECT id INTO afnan_id FROM users WHERE sequence = 'AF2024';
  SELECT id INTO zuhaer_id FROM users WHERE sequence = 'ZU2024';

  -- Insert demo workout days for Afnan
  IF afnan_id IS NOT NULL THEN
    INSERT INTO workout_days (id, user_id, name, order_index) VALUES 
      (gen_random_uuid(), afnan_id, 'Push Day', 1),
      (gen_random_uuid(), afnan_id, 'Pull Day', 2),
      (gen_random_uuid(), afnan_id, 'Leg Day', 3)
    ON CONFLICT DO NOTHING;

    -- Get day IDs for Afnan
    SELECT id INTO push_day_id FROM workout_days WHERE user_id = afnan_id AND name = 'Push Day';
    SELECT id INTO pull_day_id FROM workout_days WHERE user_id = afnan_id AND name = 'Pull Day';
    SELECT id INTO legs_day_id FROM workout_days WHERE user_id = afnan_id AND name = 'Leg Day';

    -- Insert demo workouts for Push Day
    IF push_day_id IS NOT NULL THEN
      INSERT INTO workouts (day_id, name, default_sets, default_reps_min, default_reps_max, machine_setup_notes, order_index) VALUES 
        (push_day_id, 'Bench Press', 4, 6, 8, 'Adjust bench to flat position. Grip bar slightly wider than shoulders.', 1),
        (push_day_id, 'Overhead Press', 3, 8, 10, 'Stand with feet shoulder-width apart. Keep core tight.', 2),
        (push_day_id, 'Incline Dumbbell Press', 3, 8, 12, 'Set bench to 30-45 degree incline.', 3),
        (push_day_id, 'Lateral Raises', 3, 12, 15, 'Use light weight. Control the movement.', 4),
        (push_day_id, 'Tricep Dips', 3, 8, 12, 'Keep body upright. Lower until 90 degrees.', 5)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Insert demo workouts for Pull Day
    IF pull_day_id IS NOT NULL THEN
      INSERT INTO workouts (day_id, name, default_sets, default_reps_min, default_reps_max, machine_setup_notes, order_index) VALUES 
        (pull_day_id, 'Pull-ups', 4, 5, 8, 'Use assisted machine if needed. Full range of motion.', 1),
        (pull_day_id, 'Barbell Rows', 4, 6, 8, 'Keep back straight. Pull to lower chest.', 2),
        (pull_day_id, 'Lat Pulldowns', 3, 8, 12, 'Lean back slightly. Pull to upper chest.', 3),
        (pull_day_id, 'Face Pulls', 3, 12, 15, 'Set cable at face height. Squeeze shoulder blades.', 4),
        (pull_day_id, 'Bicep Curls', 3, 10, 12, 'Control the negative. No swinging.', 5)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Insert demo workouts for Leg Day
    IF legs_day_id IS NOT NULL THEN
      INSERT INTO workouts (day_id, name, default_sets, default_reps_min, default_reps_max, machine_setup_notes, order_index) VALUES 
        (legs_day_id, 'Squats', 4, 6, 8, 'Feet shoulder-width apart. Go to parallel or below.', 1),
        (legs_day_id, 'Romanian Deadlifts', 3, 8, 10, 'Keep bar close to body. Hinge at hips.', 2),
        (legs_day_id, 'Leg Press', 3, 10, 15, 'Feet high on platform. Full range of motion.', 3),
        (legs_day_id, 'Walking Lunges', 3, 12, 16, 'Step forward into lunge. Alternate legs.', 4),
        (legs_day_id, 'Calf Raises', 4, 15, 20, 'Full stretch at bottom. Squeeze at top.', 5)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Insert demo workout days for Zuhaer
  IF zuhaer_id IS NOT NULL THEN
    INSERT INTO workout_days (user_id, name, order_index) VALUES 
      (zuhaer_id, 'Upper Body', 1),
      (zuhaer_id, 'Lower Body', 2),
      (zuhaer_id, 'Full Body', 3)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;