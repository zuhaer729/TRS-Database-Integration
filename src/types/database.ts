export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          name: string;
          sequence: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          name: string;
          sequence: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string;
          sequence?: string;
          created_at?: string;
        };
      };
      workout_days: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      workouts: {
        Row: {
          id: string;
          day_id: string;
          name: string;
          default_sets: number;
          default_reps_min: number;
          default_reps_max: number | null;
          machine_setup_notes: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          day_id: string;
          name: string;
          default_sets?: number;
          default_reps_min?: number;
          default_reps_max?: number | null;
          machine_setup_notes?: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          day_id?: string;
          name?: string;
          default_sets?: number;
          default_reps_min?: number;
          default_reps_max?: number | null;
          machine_setup_notes?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          day_id: string;
          session_date: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_id: string;
          session_date?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          day_id?: string;
          session_date?: string;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      workout_sets: {
        Row: {
          id: string;
          session_id: string;
          workout_id: string;
          set_number: number;
          reps: number;
          weight: number;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          workout_id: string;
          set_number: number;
          reps?: number;
          weight?: number;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          workout_id?: string;
          set_number?: number;
          reps?: number;
          weight?: number;
          completed?: boolean;
          created_at?: string;
        };
      };
    };
  };
}