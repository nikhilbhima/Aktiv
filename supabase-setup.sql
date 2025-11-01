-- =====================================================
-- AKTIV DATABASE SETUP - UNIFIED APPROACH
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- 1. CREATE REPORTS TABLE (for safety/moderation)
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);

-- =====================================================
-- 2. DROP OLD IRL TABLES (no longer needed)
-- =====================================================
DROP TABLE IF EXISTS irl_activity_participants CASCADE;
DROP TABLE IF EXISTS irl_activities CASCADE;

-- =====================================================
-- 3. ADD MISSING COLUMNS TO USERS (if not exists)
-- =====================================================
DO $$
BEGIN
    -- Add accountability_mode column (for backwards compatibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'accountability_mode'
    ) THEN
        ALTER TABLE users ADD COLUMN accountability_mode BOOLEAN DEFAULT true;
    END IF;

    -- Ensure location fields exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'location_city'
    ) THEN
        ALTER TABLE users ADD COLUMN location_city TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'location_lat'
    ) THEN
        ALTER TABLE users ADD COLUMN location_lat FLOAT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'location_lng'
    ) THEN
        ALTER TABLE users ADD COLUMN location_lng FLOAT;
    END IF;
END $$;

-- =====================================================
-- 4. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location_lat, location_lng) WHERE location_lat IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_goal_date ON checkins(goal_id, completed_at DESC);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- USERS: Everyone can read profiles, only own profile can be updated
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- GOALS: Users can only manage their own goals, but can view matched users' goals
DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
CREATE POLICY "Users can view their own goals" ON goals FOR SELECT USING (
    user_id = auth.uid() OR
    user_id IN (
        SELECT user1_id FROM matches WHERE user2_id = auth.uid() AND status = 'accepted'
        UNION
        SELECT user2_id FROM matches WHERE user1_id = auth.uid() AND status = 'accepted'
    )
);

DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own goals" ON goals;
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (user_id = auth.uid());

-- MATCHES: Users can view and manage their own matches
DROP POLICY IF EXISTS "Users can view their matches" ON matches;
CREATE POLICY "Users can view their matches" ON matches FOR SELECT USING (
    user1_id = auth.uid() OR user2_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can create matches" ON matches;
CREATE POLICY "Users can create matches" ON matches FOR INSERT WITH CHECK (
    user1_id = auth.uid() OR user2_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can update their matches" ON matches;
CREATE POLICY "Users can update their matches" ON matches FOR UPDATE USING (
    user1_id = auth.uid() OR user2_id = auth.uid()
);

-- MESSAGES: Users can only view/send messages in their matches
DROP POLICY IF EXISTS "Users can view messages in their matches" ON messages;
CREATE POLICY "Users can view messages in their matches" ON messages FOR SELECT USING (
    match_id IN (
        SELECT id FROM matches WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can send messages in their matches" ON messages;
CREATE POLICY "Users can send messages in their matches" ON messages FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    match_id IN (
        SELECT id FROM matches WHERE (user1_id = auth.uid() OR user2_id = auth.uid()) AND status = 'accepted'
    )
);

-- CHECKINS: Users can manage their own check-ins, matched users can view
DROP POLICY IF EXISTS "Users can view own checkins" ON checkins;
CREATE POLICY "Users can view own checkins" ON checkins FOR SELECT USING (
    user_id = auth.uid() OR
    goal_id IN (
        SELECT g.id FROM goals g
        INNER JOIN matches m ON (
            (m.user1_id = g.user_id AND m.user2_id = auth.uid()) OR
            (m.user2_id = g.user_id AND m.user1_id = auth.uid())
        )
        WHERE m.status = 'accepted'
    )
);

DROP POLICY IF EXISTS "Users can create own checkins" ON checkins;
CREATE POLICY "Users can create own checkins" ON checkins FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own checkins" ON checkins;
CREATE POLICY "Users can update own checkins" ON checkins FOR UPDATE USING (user_id = auth.uid());

-- REPORTS: Users can create reports, admins can view all
DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (reporter_id = auth.uid());

-- =====================================================
-- 7. CREATE HELPER FUNCTION FOR DISTANCE CALCULATION
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 FLOAT, lon1 FLOAT,
    lat2 FLOAT, lon2 FLOAT
) RETURNS FLOAT AS $$
DECLARE
    earth_radius FLOAT := 6371; -- Earth's radius in kilometers
    dlat FLOAT;
    dlon FLOAT;
    a FLOAT;
    c FLOAT;
BEGIN
    -- Haversine formula
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);

    a := sin(dlat/2) * sin(dlat/2) +
         cos(radians(lat1)) * cos(radians(lat2)) *
         sin(dlon/2) * sin(dlon/2);

    c := 2 * atan2(sqrt(a), sqrt(1-a));

    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 8. CREATE UNIFIED MATCHING FUNCTION
-- =====================================================

-- Create unified matching function that shows all potential matches
-- with optional distance calculation based on location availability
CREATE OR REPLACE FUNCTION find_unified_matches(
    for_user_id UUID,
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
    -- Get the user's location (may be NULL if not set)
    SELECT location_point INTO user_location
    FROM users
    WHERE id = for_user_id;

    RETURN QUERY
    SELECT
        u.id,
        u.username,
        u.full_name,
        u.avatar_url,
        u.bio,
        -- Calculate distance only if both users have location set
        CASE
            WHEN user_location IS NOT NULL AND u.location_point IS NOT NULL
            THEN ROUND((ST_Distance(user_location, u.location_point) / 1000)::NUMERIC, 1)
            ELSE NULL
        END AS distance_km,
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
        AND NOT EXISTS (  -- Exclude existing matches (properly handle user1_id < user2_id constraint)
            SELECT 1 FROM matches m
            WHERE (m.user1_id = LEAST(for_user_id, u.id) AND m.user2_id = GREATEST(for_user_id, u.id))
        )
        AND EXISTS (  -- Only users with active goals
            SELECT 1 FROM goals WHERE user_id = u.id AND status = 'active'
        )
    ORDER BY match_score DESC NULLS LAST, u.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SETUP COMPLETE! ✅
-- =====================================================
-- Your database is now ready for the unified Aktiv approach!
-- Next step: Connect your frontend to these tables.
