/*
  # Workout Tracker Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `sequence` (text, unique) - for authentication
      - `created_at` (timestamp)
    - `workout_days`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `order_index` (integer)
      - `created_at` (timestamp)
    - `workouts`
      - `id` (uuid, primary key)
      - `day_id` (uuid, foreign key)
      - `name` (text)
      - `default_sets` (integer)
      - `default_reps_min` (integer)
      - `default_reps_max` (integer, nullable)
      - `machine_setup_notes` (text)
      - `order_index` (integer)
      - `created_at` (timestamp)
    - `workout_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `day_id` (uuid, foreign key)
      - `session_date` (date)
      - `completed_at` (timestamp, nullable)
      - `created_at` (timestamp)
    - `workout_sets`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `workout_id` (uuid, foreign key)
      - `set_number` (integer)
      - `reps` (integer)
      - `weight` (decimal)
      - `completed` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  name text NOT NULL,
  sequence text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Workout days table
CREATE TABLE IF NOT EXISTS workout_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workout days"
  ON workout_days
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid REFERENCES workout_days(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  default_sets integer DEFAULT 3,
  default_reps_min integer DEFAULT 8,
  default_reps_max integer,
  machine_setup_notes text DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage workouts for own days"
  ON workouts
  FOR ALL
  TO authenticated
  USING (
    day_id IN (
      SELECT id FROM workout_days WHERE user_id = auth.uid()
    )
  );

-- Workout sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  day_id uuid REFERENCES workout_days(id) ON DELETE CASCADE NOT NULL,
  session_date date DEFAULT CURRENT_DATE,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workout sessions"
  ON workout_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Workout sets table
CREATE TABLE IF NOT EXISTS workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  set_number integer NOT NULL,
  reps integer DEFAULT 0,
  weight decimal DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage sets for own sessions"
  ON workout_sets
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM workout_sessions WHERE user_id = auth.uid()
    )
  );

-- Insert default users
INSERT INTO users (id, name, sequence) VALUES 
  ('afnan-uuid', 'Afnan', 'AF2024'),
  ('zuhaer-uuid', 'Zuhaer', 'ZU2024')
ON CONFLICT (sequence) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_days_user_id ON workout_days(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_day_id ON workouts(day_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_workout_sets_session_id ON workout_sets(session_id);