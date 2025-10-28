-- Performance Optimization Indexes for osu-guessr
-- These indexes improve query performance for frequently executed queries

-- Indexes for games table
-- Supports user achievement and ranking queries
CREATE INDEX IF NOT EXISTS idx_games_user_variant ON games(user_id, variant, game_mode);

-- Supports mode-specific leaderboard queries
CREATE INDEX IF NOT EXISTS idx_games_mode_variant ON games(game_mode, variant);

-- Supports global classic rankings (ordered by points)
CREATE INDEX IF NOT EXISTS idx_games_variant_points ON games(variant, points);

-- Supports global death rankings (ordered by streak)
CREATE INDEX IF NOT EXISTS idx_games_variant_streak ON games(variant, streak);

-- Composite index for ended_at ordering in user games
CREATE INDEX IF NOT EXISTS idx_games_user_ended ON games(user_id, ended_at DESC);

-- Indexes for mapset_tags table
-- Supports random audio selection with filtering
CREATE INDEX IF NOT EXISTS idx_mapset_tags_audio ON mapset_tags(audio_filename, mapset_id);

-- Supports random background selection
CREATE INDEX IF NOT EXISTS idx_mapset_tags_mapset ON mapset_tags(mapset_id);

-- Indexes for users table
-- Supports user search functionality
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Supports user lookup by bancho_id (may already exist as primary key)
CREATE INDEX IF NOT EXISTS idx_users_bancho_id ON users(bancho_id);

-- Indexes for user_badges table
-- Supports badge queries joined with users
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id, badge_name);

-- Index for mapset_data table
-- Supports title search/autocomplete
CREATE INDEX IF NOT EXISTS idx_mapset_data_title ON mapset_data(title);

-- Supports mapset lookup
CREATE INDEX IF NOT EXISTS idx_mapset_data_mapset_id ON mapset_data(mapset_id);

-- Index for skins table  
-- Supports skin name search/autocomplete
CREATE INDEX IF NOT EXISTS idx_skins_name ON skins(name);

-- Performance monitoring query
-- Run this to check index usage after adding indexes:
-- SELECT 
--     table_name,
--     index_name,
--     seq_in_index,
--     column_name,
--     cardinality
-- FROM information_schema.statistics
-- WHERE table_schema = 'osu_guessr'
-- ORDER BY table_name, index_name, seq_in_index;
