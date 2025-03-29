export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: number;
          name: string;
          given_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          given_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          given_name?: string | null;
          created_at?: string;
        };
      };
      shifts: {
        Row: {
          id: number;
          employee_id: number;
          date: string;
          shift_code: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          employee_id: number;
          date: string;
          shift_code: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          employee_id?: number;
          date?: string;
          shift_code?: string;
          created_at?: string;
        };
      };
      shift_types: {
        Row: {
          id: number;
          code: string;
          label: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          code: string;
          label: string;
          color: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          code?: string;
          label?: string;
          color?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 