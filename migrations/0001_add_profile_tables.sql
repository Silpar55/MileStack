-- Add isProfileComplete field to users table
ALTER TABLE users ADD COLUMN is_profile_complete BOOLEAN DEFAULT FALSE NOT NULL;

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    university VARCHAR(255),
    major VARCHAR(255) NOT NULL,
    year VARCHAR(50) NOT NULL,
    programming_languages JSONB DEFAULT '{}',
    experience_level VARCHAR(50) DEFAULT 'beginner',
    learning_goals JSONB DEFAULT '[]',
    institution_id VARCHAR(100),
    institution_name VARCHAR(255),
    data_usage_consent BOOLEAN DEFAULT FALSE NOT NULL,
    marketing_consent BOOLEAN DEFAULT FALSE NOT NULL,
    research_participation BOOLEAN DEFAULT FALSE NOT NULL,
    is_profile_complete BOOLEAN DEFAULT FALSE NOT NULL,
    profile_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create honor_code_signatures table
CREATE TABLE honor_code_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    signature TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    version VARCHAR(20) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    institution VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_institution ON user_profiles(institution_id);
CREATE INDEX idx_honor_code_signatures_user_id ON honor_code_signatures(user_id);
CREATE INDEX idx_honor_code_signatures_timestamp ON honor_code_signatures(timestamp);
CREATE INDEX idx_honor_code_signatures_active ON honor_code_signatures(is_active);

-- Add trigger to update updated_at timestamp for user_profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
