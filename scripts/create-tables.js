// Supabaseのテーブルを作成するスクリプト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTables() {
  console.log('データベーステーブルの作成を開始します...');

  try {
    // employees テーブルの作成
    await supabase.rpc('create_tables', {
      table_employees: `
        CREATE TABLE IF NOT EXISTS employees (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          given_name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
    });
    console.log('✅ employees テーブルを作成しました');

    // shifts テーブルの作成
    await supabase.rpc('create_tables', {
      table_shifts: `
        CREATE TABLE IF NOT EXISTS shifts (
          id SERIAL PRIMARY KEY,
          employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          shift_code TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(employee_id, date)
        )
      `
    });
    console.log('✅ shifts テーブルを作成しました');

    // shift_types テーブルの作成
    await supabase.rpc('create_tables', {
      table_shift_types: `
        CREATE TABLE IF NOT EXISTS shift_types (
          id SERIAL PRIMARY KEY,
          code TEXT NOT NULL UNIQUE,
          label TEXT NOT NULL,
          color TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
    });
    console.log('✅ shift_types テーブルを作成しました');

    console.log('🎉 すべてのテーブルが正常に作成されました');
  } catch (error) {
    console.error('❌ テーブル作成中にエラーが発生しました:', error);
  }
}

createTables(); 