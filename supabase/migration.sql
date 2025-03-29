-- 従業員テーブル
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  given_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- シフト種別テーブル
CREATE TABLE IF NOT EXISTS shift_types (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  hours DECIMAL(4,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- シフトテーブル
CREATE TABLE IF NOT EXISTS shifts (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(employee_id, date)
);

-- Row Level Security (RLS) を有効化
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成
CREATE POLICY "全ユーザーにemployeesのselect権限を付与" ON employees FOR SELECT USING (true);
CREATE POLICY "全ユーザーにemployeesのinsert権限を付与" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "全ユーザーにemployeesのupdate権限を付与" ON employees FOR UPDATE USING (true);
CREATE POLICY "全ユーザーにemployeesのdelete権限を付与" ON employees FOR DELETE USING (true);

CREATE POLICY "全ユーザーにshift_typesのselect権限を付与" ON shift_types FOR SELECT USING (true);
CREATE POLICY "全ユーザーにshift_typesのinsert権限を付与" ON shift_types FOR INSERT WITH CHECK (true);
CREATE POLICY "全ユーザーにshift_typesのupdate権限を付与" ON shift_types FOR UPDATE USING (true);
CREATE POLICY "全ユーザーにshift_typesのdelete権限を付与" ON shift_types FOR DELETE USING (true);

CREATE POLICY "全ユーザーにshiftsのselect権限を付与" ON shifts FOR SELECT USING (true);
CREATE POLICY "全ユーザーにshiftsのinsert権限を付与" ON shifts FOR INSERT WITH CHECK (true);
CREATE POLICY "全ユーザーにshiftsのupdate権限を付与" ON shifts FOR UPDATE USING (true);
CREATE POLICY "全ユーザーにshiftsのdelete権限を付与" ON shifts FOR DELETE USING (true);

-- サンプルデータの投入 (シフト種別)
INSERT INTO shift_types (code, label, color, hours) VALUES
('A', '早番', '#4CAF50', 8.0),
('B', '遅番', '#2196F3', 8.0),
('C', '夜勤', '#9C27B0', 8.0),
('D', '日勤', '#FF9800', 8.0),
('H', '休日', '#F44336', 0.0),
('V', '有休', '#00BCD4', 0.0)
ON CONFLICT (code) DO NOTHING;

-- 必要なアクセス権を付与
GRANT ALL ON TABLE employees TO anon, authenticated;
GRANT ALL ON TABLE shift_types TO anon, authenticated;
GRANT ALL ON TABLE shifts TO anon, authenticated;
GRANT ALL ON SEQUENCE employees_id_seq TO anon, authenticated;
GRANT ALL ON SEQUENCE shift_types_id_seq TO anon, authenticated;
GRANT ALL ON SEQUENCE shifts_id_seq TO anon, authenticated; 