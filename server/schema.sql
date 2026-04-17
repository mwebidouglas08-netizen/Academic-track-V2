-- AcademiTrack V2 Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS moderators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL,
  username VARCHAR(60) UNIQUE NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(60) DEFAULT 'Moderator',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  reg_number VARCHAR(60) UNIQUE NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  academic_level VARCHAR(60) NOT NULL,
  department VARCHAR(120) NOT NULL,
  research_topic VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  current_level VARCHAR(60) DEFAULT 'Department',
  status VARCHAR(30) DEFAULT 'Submitted',
  ai_score INTEGER DEFAULT 0,
  ai_feedback TEXT,
  manual_score INTEGER DEFAULT 0,
  moderator_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submission_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  level VARCHAR(60) NOT NULL,
  status VARCHAR(30) NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES moderators(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sent_by UUID REFERENCES moderators(id) ON DELETE SET NULL,
  recipient_type VARCHAR(20) DEFAULT 'all',
  recipient_id UUID REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  reply TEXT,
  replied_by UUID REFERENCES moderators(id) ON DELETE SET NULL,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_sub_history_sub ON submission_history(submission_id);
CREATE INDEX IF NOT EXISTS idx_notifs_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_student ON messages(student_id);

-- Default Super Admin: username=olalekennedy, password=@Ken_olale
-- Change immediately after first login!
INSERT INTO moderators (name, username, email, password_hash, role)
VALUES (
  'Super Administrator',
  'olalekennedy',
  'admin@academitrack.edu',
  '$2a$12$RIHVBmCGNSre9XyoMPzHiuYGL5bBnBOzMsl.GFy9wMHGiJGv3zXKi',
  'Super Admin'
) ON CONFLICT (email) DO UPDATE SET
  username      = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash;
