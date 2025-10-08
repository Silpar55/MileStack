-- Database Restructuring Migration
-- This migration restructures the database to support three integrated learning systems
-- while fixing schema conflicts and duplications

-- Drop the leaderboards table (not part of core functionality)
DROP TABLE IF EXISTS leaderboards;

-- Drop old assignment-related tables that conflict with new specifications
DROP TABLE IF EXISTS assignment_analyses CASCADE;
DROP TABLE IF EXISTS learning_pathways CASCADE;
DROP TABLE IF EXISTS learning_milestones CASCADE;
DROP TABLE IF EXISTS concepts CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;

-- Create new assignments table with exact specifications
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    extracted_text TEXT,
    upload_timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
    analysis_status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    estimated_difficulty INTEGER CHECK (estimated_difficulty BETWEEN 1 AND 10),
    due_date TIMESTAMP,
    course_name VARCHAR(100)
);

-- Create assignment analysis table
CREATE TABLE assignment_analysis (
    assignment_id UUID PRIMARY KEY REFERENCES assignments(id) ON DELETE CASCADE,
    concepts JSONB,
    languages JSONB,
    difficulty_score INTEGER CHECK (difficulty_score BETWEEN 1 AND 10),
    prerequisites JSONB,
    estimated_time_hours DECIMAL(4,2),
    analysis_timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create assignment-specific learning milestones table
CREATE TABLE learning_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    milestone_order INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    competency_requirement TEXT NOT NULL,
    points_reward INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'locked' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create assignment checkpoint attempts table
CREATE TABLE assignment_checkpoint_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    milestone_id UUID NOT NULL REFERENCES learning_milestones(id) ON DELETE CASCADE,
    attempt_number INTEGER DEFAULT 1 NOT NULL,
    submitted_answer TEXT,
    ai_score INTEGER CHECK (ai_score BETWEEN 0 AND 100),
    passed BOOLEAN DEFAULT FALSE NOT NULL,
    feedback TEXT,
    attempt_timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create assignment user progress table
CREATE TABLE assignment_user_progress (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    current_milestone_id UUID REFERENCES learning_milestones(id),
    points_earned INTEGER DEFAULT 0 NOT NULL,
    total_checkpoints_passed INTEGER DEFAULT 0 NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0 NOT NULL,
    last_activity TIMESTAMP DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, assignment_id)
);

-- Create workspace sessions table
CREATE TABLE workspace_sessions (
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_code TEXT DEFAULT '',
    language VARCHAR(50) DEFAULT 'python',
    last_save_timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
    version_number INTEGER DEFAULT 1 NOT NULL,
    PRIMARY KEY (assignment_id, user_id)
);

-- Create unified AI assistance log table
CREATE TABLE ai_assistance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context_type VARCHAR(20) NOT NULL,
    context_id UUID NOT NULL,
    assistance_type VARCHAR(20) NOT NULL,
    points_spent INTEGER NOT NULL,
    question_asked TEXT,
    ai_response TEXT,
    usage_timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add performance indexes
CREATE INDEX idx_assignments_user_id ON assignments(user_id);
CREATE INDEX idx_assignments_status ON assignments(analysis_status);
CREATE INDEX idx_learning_milestones_assignment ON learning_milestones(assignment_id, milestone_order);
CREATE INDEX idx_checkpoint_attempts_user_milestone ON assignment_checkpoint_attempts(user_id, milestone_id);
CREATE INDEX idx_ai_assistance_user_context ON ai_assistance_log(user_id, context_type, context_id);
CREATE INDEX idx_workspace_user_assignment ON workspace_sessions(user_id, assignment_id);
CREATE INDEX idx_assignment_progress_user_assignment ON assignment_user_progress(user_id, assignment_id);
CREATE INDEX idx_assignment_analysis_assignment ON assignment_analysis(assignment_id);

-- Add comments for documentation
COMMENT ON TABLE assignments IS 'Core assignment storage with analysis status tracking';
COMMENT ON TABLE assignment_analysis IS 'AI analysis results for assignments including concepts and difficulty';
COMMENT ON TABLE learning_milestones IS 'Assignment-specific learning milestones separate from learning paths';
COMMENT ON TABLE assignment_checkpoint_attempts IS 'Assignment checkpoint attempts separate from learning path checkpoints';
COMMENT ON TABLE assignment_user_progress IS 'Assignment progress tracking for users';
COMMENT ON TABLE workspace_sessions IS 'Code workspace sessions for assignments';
COMMENT ON TABLE ai_assistance_log IS 'Unified AI assistance usage tracking across all learning systems';
