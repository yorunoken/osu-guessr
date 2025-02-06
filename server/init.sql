SET
    FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS game_sessions;

DROP TABLE IF EXISTS user_achievements;

DROP TABLE IF EXISTS games;

DROP TABLE IF EXISTS mapset_tags;

DROP TABLE IF EXISTS api_keys;

DROP TABLE IF EXISTS mapset_data;

DROP TABLE IF EXISTS users;

SET
    FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS users (
    bancho_id INT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    avatar_url TEXT NOT NULL,
    special_badge VARCHAR(255),
    special_badge_color VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (bancho_id),
    INDEX user_id_idx (user_id)
);

CREATE TABLE IF NOT EXISTS user_achievements (
    user_id INT NOT NULL,
    game_mode ENUM ('background', 'audio', 'skin') NOT NULL,
    total_score INT DEFAULT 0,
    games_played INT DEFAULT 0,
    highest_streak INT DEFAULT 0,
    highest_score INT DEFAULT 0,
    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY user_game_mode (user_id, game_mode),
    FOREIGN KEY (user_id) REFERENCES users (bancho_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS games (
    user_id INT NOT NULL,
    game_mode ENUM ('background', 'audio', 'skin') NOT NULL,
    points INT DEFAULT 0,
    streak INT DEFAULT 0,
    variant ENUM ('classic', 'death') DEFAULT 'classic',
    ended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (bancho_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mapset_tags (
    mapset_id INT NOT NULL,
    image_filename VARCHAR(255),
    audio_filename VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS mapset_data (
    mapset_id INT PRIMARY KEY,
    title VARCHAR(500),
    artist VARCHAR(500),
    mapper VARCHAR(500)
);

CREATE TABLE game_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    game_mode ENUM ('background', 'audio', 'skin') NOT NULL,
    last_action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_beatmap_id INT,
    time_left INT DEFAULT 30,
    current_streak INT DEFAULT 0,
    highest_streak INT DEFAULT 0,
    total_points INT DEFAULT 0,
    last_guess TEXT DEFAULT NULL,
    last_guess_correct BOOLEAN DEFAULT NULL,
    last_points INT DEFAULT 0,
    current_round INT DEFAULT 1,
    correct_guesses INT DEFAULT 0,
    total_time_used INT DEFAULT 0,
    variant ENUM ('classic', 'death') DEFAULT 'classic',
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users (bancho_id) ON DELETE CASCADE,
    FOREIGN KEY (current_beatmap_id) REFERENCES mapset_data (mapset_id)
);

CREATE TABLE IF NOT EXISTS session_mapsets (
    session_id VARCHAR(36),
    mapset_id INT,
    round_number INT,
    FOREIGN KEY (session_id) REFERENCES game_sessions (id) ON DELETE CASCADE,
    FOREIGN KEY (mapset_id) REFERENCES mapset_data (mapset_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    mapset_id INT NOT NULL,
    report_type ENUM (
        'incorrect_title',
        'inappropriate_content',
        'wrong_audio',
        'wrong_background',
        'other'
    ) NOT NULL,
    description TEXT,
    status ENUM (
        'pending',
        'investigating',
        'resolved',
        'rejected'
    ) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    github_issue_number INT,
    github_issue_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users (bancho_id) ON DELETE CASCADE,
    FOREIGN KEY (mapset_id) REFERENCES mapset_data (mapset_id) ON DELETE CASCADE,
    INDEX idx_reports_status (status),
    INDEX idx_reports_user (user_id),
    INDEX idx_reports_mapset (mapset_id)
);

CREATE INDEX IF NOT EXISTS idx_username ON users (username);

CREATE INDEX IF NOT EXISTS idx_active_sessions ON game_sessions (user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_session_last_action ON game_sessions (last_action_at);

CREATE INDEX IF NOT EXISTS idx_games_user_mode ON games (user_id, game_mode);

CREATE INDEX IF NOT EXISTS idx_games_ended ON games (ended_at);

CREATE INDEX IF NOT EXISTS idx_mapset_tags_mapset_id ON mapset_tags (mapset_id);

CREATE INDEX IF NOT EXISTS idx_mapset_data_title ON mapset_data (title);

CREATE INDEX IF NOT EXISTS idx_mapset_data_artist ON mapset_data (artist);

CREATE INDEX IF NOT EXISTS idx_mapset_data_mapper ON mapset_data (mapper);

CREATE INDEX IF NOT EXISTS idx_user_achievements_score ON user_achievements (total_score);

CREATE INDEX IF NOT EXISTS idx_game_sessions_mode ON game_sessions (game_mode);

CREATE INDEX IF NOT EXISTS idx_api_keys_last_used ON api_keys (last_used);

CREATE INDEX IF NOT EXISTS idx_achievements_user_score ON user_achievements (user_id, total_score);

CREATE INDEX IF NOT EXISTS idx_achievements_mode_score ON user_achievements (game_mode, total_score);

CREATE INDEX IF NOT EXISTS idx_session_mapsets_round ON session_mapsets (session_id, round_number);

CREATE INDEX IF NOT EXISTS idx_sessions_user_mode_active ON game_sessions (user_id, game_mode, is_active);

CREATE INDEX IF NOT EXISTS idx_games_mode_points ON games (game_mode, points);
