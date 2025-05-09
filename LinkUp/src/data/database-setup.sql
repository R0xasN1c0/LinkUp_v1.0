
-- LinkUp Database Setup Script
-- This script creates all necessary tables and populates them with sample data
-- for development and testing purposes.

-- Cleanup (drop tables if they exist)
DROP TABLE IF EXISTS vote_responses;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS calendar_connections;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS profiles;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  color TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create group_members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id),
  user_id UUID NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id),
  title TEXT NOT NULL,
  description TEXT,
  proposed_start TIMESTAMP WITH TIME ZONE NOT NULL,
  proposed_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vote_responses table
CREATE TABLE vote_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES votes(id),
  user_id UUID NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create calendar_connections table
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  external_calendar_id TEXT NOT NULL,
  calendar_name TEXT,
  sync_token TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create friends table
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert sample profiles data
INSERT INTO profiles (id, name, username, avatar_url) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Alice Smith', 'alice', 'https://example.com/avatars/alice.png'),
('550e8400-e29b-41d4-a716-446655440001', 'Bob Johnson', 'bob', 'https://example.com/avatars/bob.png'),
('550e8400-e29b-41d4-a716-446655440002', 'Charlie Brown', 'charlie', 'https://example.com/avatars/charlie.png'),
('550e8400-e29b-41d4-a716-446655440003', 'Diana Prince', 'diana', 'https://example.com/avatars/diana.png'),
('550e8400-e29b-41d4-a716-446655440004', 'Ethan Hunt', 'ethan', 'https://example.com/avatars/ethan.png');

-- Insert sample events data
INSERT INTO events (id, user_id, title, description, start_time, end_time, location, color, is_private) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Team Meeting', 'Weekly team sync', '2025-06-01 10:00:00+00', '2025-06-01 11:00:00+00', 'Conference Room A', '#4285F4', false),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Dentist Appointment', 'Regular checkup', '2025-06-02 14:00:00+00', '2025-06-02 15:00:00+00', 'Dental Clinic', '#DB4437', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Birthday Party', 'Charlie''s birthday celebration', '2025-06-05 18:00:00+00', '2025-06-05 22:00:00+00', 'Charlie''s House', '#F4B400', false),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Project Deadline', 'Submit final deliverables', '2025-06-10 09:00:00+00', '2025-06-10 17:00:00+00', 'Office', '#0F9D58', false),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Yoga Class', 'Weekly yoga session', '2025-06-03 07:00:00+00', '2025-06-03 08:00:00+00', 'Fitness Center', '#AB47BC', false);

-- Insert sample groups data
INSERT INTO groups (id, name, description, created_by) VALUES
('770e8400-e29b-41d4-a716-446655440000', 'Project Alpha', 'Core development team', '550e8400-e29b-41d4-a716-446655440000'),
('770e8400-e29b-41d4-a716-446655440001', 'Family', 'Family events coordination', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', 'Book Club', 'Monthly book discussions', '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample group_members data
INSERT INTO group_members (group_id, user_id, is_admin) VALUES
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', true),
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', false),
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', false),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', true),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', false),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', false),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', true),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', false),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', false);

-- Insert sample votes data
INSERT INTO votes (id, group_id, title, description, proposed_start, proposed_end, status, created_by) VALUES
('880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Sprint Planning', 'Planning session for next sprint', '2025-06-15 10:00:00+00', '2025-06-15 12:00:00+00', 'active', '550e8400-e29b-41d4-a716-446655440000'),
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Family Reunion', 'Annual family gathering', '2025-07-10 09:00:00+00', '2025-07-10 18:00:00+00', 'active', '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Book Discussion', 'Review of "The Great Gatsby"', '2025-06-20 19:00:00+00', '2025-06-20 21:00:00+00', 'active', '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample vote_responses data
INSERT INTO vote_responses (vote_id, user_id, response) VALUES
('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'yes'),
('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'yes'),
('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'no'),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'yes'),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'maybe'),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'yes'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'yes'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'yes'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'no');

-- Insert sample calendar_connections data
INSERT INTO calendar_connections (user_id, provider, external_calendar_id, calendar_name, access_token, refresh_token, token_expires_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'google', 'primary', 'My Calendar', 'fake-access-token-1', 'fake-refresh-token-1', '2025-12-31 23:59:59+00'),
('550e8400-e29b-41d4-a716-446655440001', 'google', 'primary', 'Work Calendar', 'fake-access-token-2', 'fake-refresh-token-2', '2025-12-31 23:59:59+00'),
('550e8400-e29b-41d4-a716-446655440002', 'google', 'primary', 'Personal Calendar', 'fake-access-token-3', 'fake-refresh-token-3', '2025-12-31 23:59:59+00');

-- Insert sample friends data
INSERT INTO friends (user_id, friend_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'accepted'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'accepted'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'accepted'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'accepted'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'pending'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'accepted'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'accepted');

-- Add appropriate indexes
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_votes_group_id ON votes(group_id);
CREATE INDEX idx_vote_responses_vote_id ON vote_responses(vote_id);
CREATE INDEX idx_vote_responses_user_id ON vote_responses(user_id);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
CREATE INDEX idx_calendar_connections_user_id ON calendar_connections(user_id);

-- Add Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Event policies
CREATE POLICY "Users can view their own events" ON events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own events" ON events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own events" ON events FOR DELETE USING (auth.uid() = user_id);

-- Groups policies
CREATE POLICY "Users can view groups they are members of" ON groups FOR SELECT 
USING (EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = id AND group_members.user_id = auth.uid()));
CREATE POLICY "Users can create groups" ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group admins can update groups" ON groups FOR UPDATE 
USING (EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = id AND group_members.user_id = auth.uid() AND group_members.is_admin = true));
CREATE POLICY "Group admins can delete groups" ON groups FOR DELETE 
USING (EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = id AND group_members.user_id = auth.uid() AND group_members.is_admin = true));
