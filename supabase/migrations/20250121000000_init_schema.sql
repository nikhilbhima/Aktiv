-- =====================================================
-- AKTIV DATABASE SCHEMA
-- Phase 3: Complete Database Setup
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For location-based features

-- =====================================================
-- TABLES
-- =====================================================

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,

    -- Demographics
    gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
    date_of_birth DATE,

    -- Location (for IRL mode)
    location_city TEXT,
    location_state TEXT,
    location_country TEXT,
    location_point GEOGRAPHY(POINT, 4326), -- PostGIS point for precise location

    -- Preferences
    accountability_mode BOOLEAN DEFAULT true, -- true = accountability, false = IRL
    max_distance_km INTEGER DEFAULT 50, -- For IRL mode matching
    preferred_categories TEXT[], -- Array of preferred goal categories

    -- Social Links
    instagram_handle TEXT,
    twitter_handle TEXT,
    linkedin_url TEXT,
    website_url TEXT,

    -- Stats
    streak_days INTEGER DEFAULT 0,
    total_goals_completed INTEGER DEFAULT 0,
    total_checkins INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals Table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'fitness', 'nutrition', 'learning', 'reading', 'creative',
        'career', 'finance', 'mindfulness', 'social', 'other'
    )),

    -- Frequency & Timeline
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
    frequency_count INTEGER DEFAULT 1, -- e.g., "3 times per week"
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),

    -- Privacy
    is_public BOOLEAN DEFAULT true,

    -- Stats
    total_checkins INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Matches Table (for accountability partnerships)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- Match Details
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    match_score DECIMAL(3, 2), -- 0.00 to 1.00 similarity score

    -- Match Type
    is_irl_match BOOLEAN DEFAULT false,

    -- Timestamps
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    last_interaction_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure no duplicate matches and no self-matches
    CONSTRAINT unique_match CHECK (user1_id < user2_id),
    CONSTRAINT no_self_match CHECK (user1_id != user2_id)
);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    content TEXT NOT NULL,

    -- Message Metadata
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,

    -- Timestamps
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins Table
CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- Check-in Details
    note TEXT,
    proof_url TEXT, -- URL to image/video proof (stored in Supabase Storage)
    mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'struggling')),

    -- Timestamps
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IRL Activities Table (for in-person meetups)
CREATE TABLE irl_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'fitness', 'nutrition', 'learning', 'reading', 'creative',
        'career', 'finance', 'mindfulness', 'social', 'other'
    )),

    -- Location
    location_name TEXT NOT NULL, -- e.g., "Central Park"
    location_address TEXT,
    location_point GEOGRAPHY(POINT, 4326), -- PostGIS point

    -- Time
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER,

    -- Capacity
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 1,

    -- Status
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IRL Activity Participants (many-to-many relationship)
CREATE TABLE irl_activity_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES irl_activities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),

    joined_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure no duplicate participants
    UNIQUE(activity_id, user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users USING GIST(location_point);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Goals
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_created_at ON goals(created_at);
CREATE INDEX idx_goals_user_status ON goals(user_id, status); -- Composite for active goals

-- Matches
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_both_users ON matches(user1_id, user2_id); -- Composite lookup

-- Messages
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
CREATE INDEX idx_messages_match_sent ON messages(match_id, sent_at); -- Composite for chat history

-- Check-ins
CREATE INDEX idx_checkins_goal_id ON checkins(goal_id);
CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_completed_at ON checkins(completed_at);
CREATE INDEX idx_checkins_goal_completed ON checkins(goal_id, completed_at); -- Composite for timeline

-- IRL Activities
CREATE INDEX idx_irl_activities_creator ON irl_activities(creator_id);
CREATE INDEX idx_irl_activities_category ON irl_activities(category);
CREATE INDEX idx_irl_activities_scheduled_at ON irl_activities(scheduled_at);
CREATE INDEX idx_irl_activities_location ON irl_activities USING GIST(location_point);
CREATE INDEX idx_irl_activities_status ON irl_activities(status);

-- IRL Activity Participants
CREATE INDEX idx_irl_participants_activity ON irl_activity_participants(activity_id);
CREATE INDEX idx_irl_participants_user ON irl_activity_participants(user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_irl_activities_updated_at BEFORE UPDATE ON irl_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user stats on check-in
CREATE OR REPLACE FUNCTION update_user_stats_on_checkin()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment total check-ins
    UPDATE users
    SET total_checkins = total_checkins + 1,
        last_active_at = NOW()
    WHERE id = NEW.user_id;

    -- Increment goal check-ins
    UPDATE goals
    SET total_checkins = total_checkins + 1
    WHERE id = NEW.goal_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_checkin AFTER INSERT ON checkins
    FOR EACH ROW EXECUTE FUNCTION update_user_stats_on_checkin();

-- Function to calculate match score based on shared interests
CREATE OR REPLACE FUNCTION calculate_match_score(
    user1_uuid UUID,
    user2_uuid UUID
)
RETURNS DECIMAL AS $$
DECLARE
    user1_categories TEXT[];
    user2_categories TEXT[];
    shared_count INTEGER;
    total_count INTEGER;
    score DECIMAL;
BEGIN
    -- Get unique categories from both users' goals
    SELECT ARRAY_AGG(DISTINCT category) INTO user1_categories
    FROM goals WHERE user_id = user1_uuid AND status = 'active';

    SELECT ARRAY_AGG(DISTINCT category) INTO user2_categories
    FROM goals WHERE user_id = user2_uuid AND status = 'active';

    -- Handle null cases
    IF user1_categories IS NULL OR user2_categories IS NULL THEN
        RETURN 0.0;
    END IF;

    -- Calculate intersection (shared categories)
    SELECT COUNT(*) INTO shared_count
    FROM unnest(user1_categories) AS cat
    WHERE cat = ANY(user2_categories);

    -- Calculate union (total unique categories)
    SELECT COUNT(DISTINCT cat) INTO total_count
    FROM (
        SELECT unnest(user1_categories) AS cat
        UNION
        SELECT unnest(user2_categories) AS cat
    ) AS all_cats;

    -- Calculate Jaccard similarity (intersection / union)
    IF total_count > 0 THEN
        score := shared_count::DECIMAL / total_count::DECIMAL;
    ELSE
        score := 0.0;
    END IF;

    RETURN ROUND(score, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to find potential matches for a user (Accountability mode)
CREATE OR REPLACE FUNCTION find_accountability_matches(
    for_user_id UUID,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    match_score DECIMAL,
    shared_categories TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.username,
        u.full_name,
        u.avatar_url,
        u.bio,
        calculate_match_score(for_user_id, u.id) AS match_score,
        ARRAY(
            SELECT DISTINCT g1.category
            FROM goals g1
            WHERE g1.user_id = for_user_id AND g1.status = 'active'
            INTERSECT
            SELECT DISTINCT g2.category
            FROM goals g2
            WHERE g2.user_id = u.id AND g2.status = 'active'
        ) AS shared_categories
    FROM users u
    WHERE u.id != for_user_id  -- Exclude self
        AND u.accountability_mode = true  -- Only accountability mode users
        AND u.id NOT IN (  -- Exclude existing matches
            SELECT user2_id FROM matches WHERE user1_id = for_user_id
            UNION
            SELECT user1_id FROM matches WHERE user2_id = for_user_id
        )
        AND EXISTS (  -- Only users with active goals
            SELECT 1 FROM goals WHERE user_id = u.id AND status = 'active'
        )
    ORDER BY match_score DESC, u.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to find IRL matches within distance
CREATE OR REPLACE FUNCTION find_irl_matches(
    for_user_id UUID,
    max_distance_meters NUMERIC DEFAULT 50000,  -- 50km default
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    distance_km NUMERIC,
    match_score DECIMAL,
    shared_categories TEXT[]
) AS $$
DECLARE
    user_location GEOGRAPHY;
BEGIN
    -- Get the user's location
    SELECT location_point INTO user_location
    FROM users
    WHERE id = for_user_id;

    -- Return empty if no location set
    IF user_location IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        u.id,
        u.username,
        u.full_name,
        u.avatar_url,
        u.bio,
        ROUND((ST_Distance(user_location, u.location_point) / 1000)::NUMERIC, 1) AS distance_km,
        calculate_match_score(for_user_id, u.id) AS match_score,
        ARRAY(
            SELECT DISTINCT g1.category
            FROM goals g1
            WHERE g1.user_id = for_user_id AND g1.status = 'active'
            INTERSECT
            SELECT DISTINCT g2.category
            FROM goals g2
            WHERE g2.user_id = u.id AND g2.status = 'active'
        ) AS shared_categories
    FROM users u
    WHERE u.id != for_user_id
        AND u.accountability_mode = false  -- IRL mode users
        AND u.location_point IS NOT NULL
        AND ST_DWithin(user_location, u.location_point, max_distance_meters)
        AND u.id NOT IN (
            SELECT user2_id FROM matches WHERE user1_id = for_user_id
            UNION
            SELECT user1_id FROM matches WHERE user2_id = for_user_id
        )
        AND EXISTS (
            SELECT 1 FROM goals WHERE user_id = u.id AND status = 'active'
        )
    ORDER BY distance_km ASC, match_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE irl_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE irl_activity_participants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS POLICIES
-- =====================================================

-- Users can view all public profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON users FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- GOALS POLICIES
-- =====================================================

-- Anyone can view public goals
CREATE POLICY "Public goals are viewable by everyone"
    ON goals FOR SELECT
    USING (is_public = true OR user_id = auth.uid());

-- Users can insert their own goals
CREATE POLICY "Users can insert own goals"
    ON goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own goals
CREATE POLICY "Users can update own goals"
    ON goals FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own goals
CREATE POLICY "Users can delete own goals"
    ON goals FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- MATCHES POLICIES
-- =====================================================

-- Users can view matches they're part of
CREATE POLICY "Users can view own matches"
    ON matches FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can insert matches (send match requests)
CREATE POLICY "Users can create matches"
    ON matches FOR INSERT
    WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can update matches they're part of (accept/reject)
CREATE POLICY "Users can update own matches"
    ON matches FOR UPDATE
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can delete matches they're part of
CREATE POLICY "Users can delete own matches"
    ON matches FOR DELETE
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================

-- Users can view messages in their matches
CREATE POLICY "Users can view messages in their matches"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = messages.match_id
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

-- Users can send messages in their matches
CREATE POLICY "Users can send messages in their matches"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = match_id
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
            AND matches.status = 'accepted'
        )
    );

-- Users can update their own messages (edit/mark as read)
CREATE POLICY "Users can update own messages"
    ON messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = messages.match_id
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

-- =====================================================
-- CHECKINS POLICIES
-- =====================================================

-- Users can view check-ins for public goals or their own goals
CREATE POLICY "Users can view public checkins"
    ON checkins FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM goals
            WHERE goals.id = checkins.goal_id
            AND goals.is_public = true
        )
    );

-- Users can insert check-ins for their own goals
CREATE POLICY "Users can create own checkins"
    ON checkins FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM goals
            WHERE goals.id = goal_id
            AND goals.user_id = auth.uid()
        )
    );

-- Users can update their own check-ins
CREATE POLICY "Users can update own checkins"
    ON checkins FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own check-ins
CREATE POLICY "Users can delete own checkins"
    ON checkins FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- IRL ACTIVITIES POLICIES
-- =====================================================

-- Anyone can view open IRL activities
CREATE POLICY "Public can view open IRL activities"
    ON irl_activities FOR SELECT
    USING (status = 'open' OR creator_id = auth.uid());

-- Authenticated users can create IRL activities
CREATE POLICY "Users can create IRL activities"
    ON irl_activities FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

-- Creators can update their activities
CREATE POLICY "Creators can update own activities"
    ON irl_activities FOR UPDATE
    USING (auth.uid() = creator_id);

-- Creators can delete their activities
CREATE POLICY "Creators can delete own activities"
    ON irl_activities FOR DELETE
    USING (auth.uid() = creator_id);

-- =====================================================
-- IRL ACTIVITY PARTICIPANTS POLICIES
-- =====================================================

-- Users can view participants of activities they're part of
CREATE POLICY "Users can view activity participants"
    ON irl_activity_participants FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM irl_activities
            WHERE irl_activities.id = activity_id
            AND irl_activities.creator_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM irl_activity_participants AS iap
            WHERE iap.activity_id = irl_activity_participants.activity_id
            AND iap.user_id = auth.uid()
        )
    );

-- Users can join activities
CREATE POLICY "Users can join activities"
    ON irl_activity_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their participation status
CREATE POLICY "Users can update own participation"
    ON irl_activity_participants FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can leave activities
CREATE POLICY "Users can leave activities"
    ON irl_activity_participants FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- STORAGE BUCKETS (to be created via Supabase Dashboard)
-- =====================================================

-- Storage buckets needed:
-- 1. avatars (public) - User profile pictures
-- 2. checkin-proofs (authenticated) - Check-in proof images/videos
-- 3. activity-images (public) - IRL activity photos

-- Note: These need to be created in Supabase Dashboard or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('checkin-proofs', 'checkin-proofs', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('activity-images', 'activity-images', true);
