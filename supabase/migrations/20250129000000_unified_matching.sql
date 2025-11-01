-- =====================================================
-- UNIFIED MATCHING FUNCTION
-- Combines accountability and IRL into single approach
-- =====================================================

-- Drop old accountability_mode column if it exists (unified approach doesn't need mode separation)
-- Note: Keep it for now for backward compatibility, but it's no longer actively used

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
-- COMPLETE! ✅
-- =====================================================
-- The unified matching function is now available.
-- It will:
-- 1. Show all potential matches regardless of location
-- 2. Calculate distance if both users have location set
-- 3. Sort by match score (shared categories/goals)
-- 4. Exclude self and existing matches
